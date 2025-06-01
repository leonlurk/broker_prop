import { db } from '../firebase/config';
import { collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where, limit, orderBy, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import CryptoWalletManager from './CryptoWalletManager';
import BlockchainMonitor from './BlockchainMonitor';

/**
 * Servicio para gestionar pagos con criptomonedas
 */
class PaymentService {
  constructor() {
    this.walletManager = CryptoWalletManager;
    this.blockchainMonitor = BlockchainMonitor;
    
    // Configuración por defecto
    this.DEFAULT_CURRENCY = 'USDT';
    this.DEFAULT_NETWORK = 'Tron';
    this.PAYMENT_TTL_MINUTES = 15; // Tiempo de vida de un pago en minutos
  }
  
  /**
   * Genera un nuevo pago con criptomoneda
   * @param {number} amount - Monto a pagar
   * @param {string} currency - Moneda (default: USDT)
   * @param {string} network - Red blockchain (default: Tron)
   * @param {string} userName - Nombre del usuario
   * @returns {Promise<Object>} - Datos del pago generado
   */
  async generateCryptoPayment(amount, currency = this.DEFAULT_CURRENCY, network = this.DEFAULT_NETWORK, userName) {
    try {
      console.log(`Generando pago por ${amount} ${currency} en ${network} para ${userName}`);
      
      // Generar ID único para el pago
      const uniqueId = uuidv4();
      
      // Obtener dirección de wallet para recibir el pago
      const walletAddress = await this.walletManager.generateWalletAddress(network);
      
      // Calcular fecha de expiración
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (this.PAYMENT_TTL_MINUTES * 60 * 1000));
      
      // Generar código QR
      const qrCode = await this.walletManager.generatePaymentQR(
        walletAddress,
        amount,
        currency,
        network
      );
      
      // Construir objeto de pago
      const payment = {
        uniqueId,
        status: 'pending',
        paymentData: {
          amount,
          currency,
          network,
          userName,
          mainWallet: {
            address: walletAddress,
            network
          },
          createdAt: now,
          expiresAt: expiresAt,
          qrCode
        },
        createdAt: serverTimestamp(),
        lastCheckedAt: serverTimestamp()
      };
      
      // Guardar en Firestore
      await addDoc(collection(db, 'payments'), payment);
      
      // Construir URL de pago
      const baseUrl = window.location.origin;
      const paymentUrl = `${baseUrl}/payment/${uniqueId}`;
      
      console.log(`Pago generado: ${uniqueId}, URL: ${paymentUrl}`);
      
      return {
        success: true,
        uniqueId,
        payment,
        url: paymentUrl
      };
      
    } catch (error) {
      console.error('Error al generar pago con criptomoneda:', error);
      throw new Error(`Error al generar pago: ${error.message}`);
    }
  }
  
  /**
   * Verifica el estado de un pago
   * @param {string} uniqueId - ID único del pago
   * @returns {Promise<Object>} - Estado actualizado del pago
   */
  async checkPaymentStatus(uniqueId) {
    try {
      console.log(`Verificando estado del pago: ${uniqueId}`);
      
      // Buscar el pago en Firestore
      const paymentSnapshot = await this.getPaymentByUniqueId(uniqueId);
      
      if (!paymentSnapshot) {
        throw new Error(`Pago no encontrado: ${uniqueId}`);
      }
      
      // Extraer datos del pago
      const paymentId = paymentSnapshot.id;
      const payment = paymentSnapshot.data();
      
      // Si el pago ya está en un estado final, simplemente devolver el estado actual
      if (['completed', 'expired', 'error', 'underpaid', 'overpaid'].includes(payment.status)) {
        console.log(`Pago ${uniqueId} ya está en estado final: ${payment.status}`);
        return payment;
      }
      
      // Verificar si el pago ha expirado
      const now = new Date();
      const expiresAt = payment.paymentData.expiresAt.toDate ? 
        payment.paymentData.expiresAt.toDate() : payment.paymentData.expiresAt;
      
      if (expiresAt < now) {
        console.log(`Pago ${uniqueId} ha expirado`);
        
        // Actualizar estado a expirado
        await updateDoc(doc(db, 'payments', paymentId), {
          status: 'expired',
          lastCheckedAt: serverTimestamp()
        });
        
        payment.status = 'expired';
        return payment;
      }
      
      // Verificar si hay una transacción en la blockchain
      const transactionResult = await this.blockchainMonitor.monitorPayment(payment);
      
      if (transactionResult && transactionResult.isConfirmed) {
        console.log(`Transacción encontrada para pago ${uniqueId}: ${transactionResult.hash}`);
        
        // Determinar estado final
        const finalStatus = this.blockchainMonitor.determineFinalStatus(
          payment.paymentData.amount,
          transactionResult.receivedAmount
        );
        
        // Actualizar en Firestore
        await updateDoc(doc(db, 'payments', paymentId), {
          status: finalStatus,
          transactionHash: transactionResult.hash,
          receivedAmount: transactionResult.receivedAmount,
          confirmedBlock: transactionResult.blockNumber,
          lastCheckedAt: serverTimestamp()
        });
        
        // Actualizar objeto de respuesta
        payment.status = finalStatus;
        payment.transactionHash = transactionResult.hash;
        payment.receivedAmount = transactionResult.receivedAmount;
        payment.confirmedBlock = transactionResult.blockNumber;
        
        console.log(`Pago ${uniqueId} actualizado a estado: ${finalStatus}`);
      } else {
        // Actualizar sólo la última verificación
        await updateDoc(doc(db, 'payments', paymentId), {
          lastCheckedAt: serverTimestamp()
        });
        
        console.log(`No se encontró transacción para pago ${uniqueId}, sigue pendiente`);
      }
      
      return payment;
      
    } catch (error) {
      console.error(`Error al verificar estado del pago ${uniqueId}:`, error);
      throw new Error(`Error al verificar estado del pago: ${error.message}`);
    }
  }
  
  /**
   * Busca un pago por su ID único
   * @param {string} uniqueId - ID único del pago
   * @returns {Promise<Object|null>} - Snapshot del documento o null si no existe
   */
  async getPaymentByUniqueId(uniqueId) {
    try {
      // Consultar colección de pagos
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, where('uniqueId', '==', uniqueId), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log(`No se encontró pago con uniqueId: ${uniqueId}`);
        return null;
      }
      
      return snapshot.docs[0];
    } catch (error) {
      console.error(`Error al buscar pago ${uniqueId}:`, error);
      throw new Error(`Error al buscar pago: ${error.message}`);
    }
  }
  
  /**
   * Busca pagos pendientes para monitoreo
   * @param {number} limit - Límite de pagos a obtener
   * @returns {Promise<Array>} - Lista de pagos pendientes
   */
  async getPendingPayments(limitCount = 10) {
    try {
      // Consultar pagos pendientes
      const paymentsRef = collection(db, 'payments');
      const q = query(
        paymentsRef, 
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener pagos pendientes:', error);
      return [];
    }
  }
}

export default new PaymentService(); 