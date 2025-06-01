import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import axios from 'axios';
import TronWeb from 'tronweb/dist/TronWeb.js';
import { db } from '../firebase/config';

/**
 * Clase para monitorear transacciones en diferentes blockchains
 */
export class BlockchainMonitor {
  constructor() {
    // Configuración de APIs
    this.bscApiUrl = import.meta.env.VITE_BSC_API_URL || 'https://api.bscscan.com/api';
    this.bscApiKey = import.meta.env.VITE_BSC_API_KEY || '';
    this.tronApiUrl = import.meta.env.VITE_TRON_API_URL || 'https://api.trongrid.io';
    this.tronApiKey = import.meta.env.VITE_TRON_API_KEY || '';
    
    // Confirmaciones requeridas
    this.BSC_CONFIRMATIONS = parseInt(import.meta.env.VITE_BSC_CONFIRMATIONS || '15', 10);
    this.TRON_CONFIRMATIONS = parseInt(import.meta.env.VITE_TRON_CONFIRMATIONS || '20', 10);
    
    // Inicializar TronWeb
    this.tronWeb = new TronWeb({
      fullHost: import.meta.env.VITE_TRON_FULL_HOST || 'https://api.trongrid.io'
    });
    
    // Inicializar axios para las solicitudes HTTP
    this.axios = axios;
  }
  
  /**
   * Verifica si existe una transacción confirmada para un pago en BSC
   * @param {Object} payment - Datos del pago
   * @returns {Promise<Object|null>} - Datos de la transacción o null si no se encuentra
   */
  async checkBSCPayment(payment) {
    try {
      const recipientAddress = payment.paymentData.mainWallet.address;
      const currency = payment.paymentData.currency;
      
      // Obtener información del token
      const tokenInfo = this.getTokenInfo('BSC', currency);
      if (!tokenInfo) {
        console.error(`[Monitor-BSC] Moneda no soportada ${currency} para pago ${payment.uniqueId}`);
        return null;
      }
      
      // Convertir el monto esperado a unidades con decimales
      const expectedAmountWeiStr = ethers.utils.parseUnits(
        payment.paymentData.amount.toString(), 
        tokenInfo.decimals
      ).toString();
      const expectedAmountBig = new BigNumber(expectedAmountWeiStr);
      
      // Preparar parámetros para la API de BSCScan
      let apiParams = {
        module: 'account',
        address: recipientAddress,
        starttimestamp: Math.floor(payment.paymentData.createdAt.toDate ? 
          payment.paymentData.createdAt.toDate().getTime() / 1000 : 
          payment.paymentData.createdAt.getTime() / 1000),
        endtimestamp: Math.floor(payment.paymentData.expiresAt.toDate ? 
          payment.paymentData.expiresAt.toDate().getTime() / 1000 : 
          payment.paymentData.expiresAt.getTime() / 1000) + 300, // 5 min extra
        sort: 'desc',
        apikey: this.bscApiKey,
      };
      
      // Determinar si es una transferencia de token o de moneda nativa
      const isTokenTransfer = (currency !== 'BNB');
      if (isTokenTransfer) {
        apiParams.action = 'tokentx';
        apiParams.contractaddress = tokenInfo.contractAddress;
      } else {
        apiParams.action = 'txlist'; // Para BNB nativo
      }
      
      console.log(`[Monitor-BSC] Consultando ${this.bscApiUrl} para ${currency} a ${recipientAddress} para pago ${payment.uniqueId}`);
      const response = await axios.get(this.bscApiUrl, { params: apiParams });
      
      if (response.data.status !== '1' && response.data.message !== 'No transactions found') {
        console.error(`[Monitor-BSC] Error de API para ${payment.uniqueId}: ${response.data.message}`);
        return null;
      }
      
      if (!response.data.result || response.data.result.length === 0) {
        console.log(`[Monitor-BSC] No se encontraron transacciones para ${payment.uniqueId}`);
        return null;
      }
      
      // Buscar una transacción que coincida con los criterios
      for (const tx of response.data.result) {
        // Verificar el destinatario (comparación insensible a mayúsculas/minúsculas)
        if (!tx.to || tx.to.toLowerCase() !== recipientAddress.toLowerCase()) {
          continue;
        }
        
        // Verificar el contrato del token si es aplicable
        if (isTokenTransfer && (!tx.contractAddress || 
            tx.contractAddress.toLowerCase() !== tokenInfo.contractAddress.toLowerCase())) {
          continue;
        }
        
        // Verificar timestamp para mayor seguridad
        const txTimestamp = parseInt(tx.timeStamp, 10);
        if (txTimestamp < apiParams.starttimestamp || txTimestamp > apiParams.endtimestamp) {
          continue;
        }
        
        // Verificar el monto
        const receivedAmountBig = new BigNumber(tx.value);
        
        // Verificar coincidencia exacta (podría modificarse para aceptar sobrepagos)
        if (receivedAmountBig.isEqualTo(expectedAmountBig)) {
          const confirmations = parseInt(tx.confirmations, 10);
          const isConfirmed = confirmations >= this.BSC_CONFIRMATIONS;
          console.log(`[Monitor-BSC] Encontrada coincidencia para ${payment.uniqueId}: Tx ${tx.hash}, Confirmaciones: ${confirmations}, Confirmada: ${isConfirmed}`);
          
          return {
            hash: tx.hash,
            receivedAmount: ethers.utils.formatUnits(receivedAmountBig.toFixed(), tokenInfo.decimals),
            blockNumber: parseInt(tx.blockNumber, 10),
            isConfirmed: isConfirmed
          };
        } else {
          console.log(`[Monitor-BSC] Tx ${tx.hash} para ${payment.uniqueId} con monto incorrecto. Esperado: ${expectedAmountBig.toFixed()}, Recibido: ${receivedAmountBig.toFixed()}`);
        }
      }
      
      console.log(`[Monitor-BSC] No se encontró transacción confirmada para ${payment.uniqueId}`);
      return null;
      
    } catch (error) {
      console.error(`[Monitor-BSC] Error al verificar pago BSC ${payment.uniqueId}:`, error.message);
      if (error.response) {
        console.error("[Monitor-BSC] Datos de respuesta con error:", error.response.data);
      }
      return null;
    }
  }
  
  /**
   * Verifica pagos en Tron mediante consultas a la API de TronGrid
   * @param {string} paymentId - ID único del pago
   * @param {string} receiverAddress - Dirección que recibe el pago
   * @param {number} amount - Monto esperado en USDT
   * @param {number} startTime - Timestamp de inicio para buscar la transacción
   * @returns {Promise<Object>} - Resultado de la verificación
   */
  async checkTronPayment(paymentId, receiverAddress, amount, startTime) {
    try {
      // Usar la dirección correcta de contrato USDT en Tron
      const contractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT contract address on Tron
      
      console.log(`[Monitor-Tron] Usando dirección de contrato USDT: ${contractAddress}`);
      
      // Asegúrate de que la dirección del receptor es válida
      if (!receiverAddress || !this.tronWeb.isAddress(receiverAddress)) {
        console.error(`[Monitor-Tron] Dirección de receptor inválida: ${receiverAddress}`);
        return {
          success: false,
          error: 'Dirección de receptor inválida',
          data: null
        };
      }
      
      // Calcular el rango de tiempo para buscar transacciones
      const currentTime = Date.now();
      const minTimestamp = startTime || (currentTime - (60 * 60 * 1000)); // 1 hora atrás por defecto
      const maxTimestamp = currentTime;
      
      const requestUrl = `${this.tronApiUrl}/v1/accounts/${receiverAddress}/transactions/trc20`;
      const requestParams = {
        limit: 50,
        min_block_timestamp: minTimestamp,
        max_block_timestamp: maxTimestamp,
        only_to: true,
        contract_address: contractAddress
      };
      
      console.log(`[Monitor-Tron] URL de petición: ${requestUrl}`);
      console.log(`[Monitor-Tron] Parámetros:`, requestParams);
      
      // Consultar la API de TronGrid
      const response = await this.axios.get(requestUrl, { params: requestParams });
      
      if (!response.data || !response.data.data || response.data.data.length === 0) {
        return {
          success: false,
          message: 'No se encontraron transacciones',
          data: null
        };
      }
      
      // Buscar una transacción que coincida con el monto
      const validTransaction = response.data.data.find(tx => {
        // La cantidad en TRC20 se maneja en un formato específico
        const txAmount = parseInt(tx.value) / Math.pow(10, 6); // USDT tiene 6 decimales
        
        // Verificar si el monto coincide (con un margen de 0.01 para redondeo)
        return Math.abs(txAmount - amount) < 0.01;
      });
      
      if (validTransaction) {
        return {
          success: true,
          message: 'Pago verificado en blockchain',
          data: validTransaction
        };
      } else {
        return {
          success: false,
          message: 'No se encontró una transacción que coincida con el monto esperado',
          data: null
        };
      }
      
    } catch (error) {
      console.error(`[Monitor-Tron] Error al verificar pago Tron ${paymentId}:`, error.message);
      if (error.response && error.response.data) {
        console.error('[Monitor-Tron] Datos de respuesta con error:', error.response.data);
      }
      return {
        success: false,
        error: error.message,
        data: error.response ? error.response.data : null
      };
    }
  }
  
  /**
   * Monitorea un pago en la blockchain correspondiente
   * @param {Object} payment - Datos del pago
   * @returns {Promise<Object|null>} - Datos de la transacción o null si no se encuentra
   */
  async monitorPayment(payment) {
    try {
      if (!payment || !payment.paymentData) {
        console.error('[Monitor] Datos de pago inválidos o nulos');
        return null;
      }

      // Convertir createdAt a timestamp numérico, manejando diferentes formatos
      let startTimestamp;
      const createdAt = payment.paymentData.createdAt;
      
      if (!createdAt) {
        // Si no hay fecha, usar hace 1 hora
        startTimestamp = Date.now() - (60 * 60 * 1000);
      } else if (typeof createdAt === 'number') {
        // Si ya es un timestamp numérico
        startTimestamp = createdAt;
      } else if (typeof createdAt === 'string') {
        // Si es string, intentar parsearlo
        startTimestamp = new Date(createdAt).getTime();
      } else if (typeof createdAt.getTime === 'function') {
        // Si es un objeto Date
        startTimestamp = createdAt.getTime();
      } else if (createdAt.toDate && typeof createdAt.toDate === 'function') {
        // Si es un Timestamp de Firestore
        startTimestamp = createdAt.toDate().getTime();
      } else if (createdAt.seconds) {
        // Si es un Timestamp en formato {seconds, nanoseconds}
        startTimestamp = createdAt.seconds * 1000;
      } else {
        // Fallback: usar la hora actual menos 1 hora
        console.warn('[Monitor] Formato de fecha no reconocido, usando timestamp actual');
        startTimestamp = Date.now() - (60 * 60 * 1000);
      }

      if (payment.paymentData.network === 'BSC') {
        return await this.checkBSCPayment(payment);
      } else if (payment.paymentData.network === 'Tron') {
        return await this.checkTronPayment(
          payment.uniqueId,
          payment.paymentData.mainWallet.address,
          parseFloat(payment.paymentData.amount),
          startTimestamp
        );
      } else {
        console.error(`[Monitor] Red no soportada: ${payment.paymentData.network}`);
        return null;
      }
    } catch (error) {
      console.error(`[Monitor] Error al monitorear pago: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Obtiene información de un token para una red específica
   * @param {string} network - Red blockchain
   * @param {string} currency - Símbolo de la moneda
   * @returns {Object|null} - Información del token o null si no se encuentra
   */
  getTokenInfo(network, currency) {
    // Configuración de tokens para BSC
    const bscTokens = {
      'BNB': { decimals: 18, isNative: true },
      'USDT': { decimals: 18, contractAddress: '0x55d398326f99059fF775485246999027B3197955' },
      'BUSD': { decimals: 18, contractAddress: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' },
      'USDC': { decimals: 18, contractAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' }
    };
    
    // Configuración de tokens para Tron
    const tronTokens = {
      'TRX': { decimals: 6, isNative: true },
      'USDT': { decimals: 6, contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' },
      'USDC': { decimals: 6, contractAddress: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8' }
    };
    
    if (network === 'BSC') {
      return bscTokens[currency] || null;
    } else if (network === 'Tron') {
      return tronTokens[currency] || null;
    }
    
    return null;
  }
  
  /**
   * Determina el estado final de un pago basado en el monto recibido
   * @param {string} expectedAmount - Monto esperado
   * @param {string} receivedAmountStr - Monto recibido
   * @returns {string} - Estado final (completed, underpaid, overpaid)
   */
  determineFinalStatus(expectedAmount, receivedAmountStr) {
    if (receivedAmountStr === null || receivedAmountStr === undefined) {
      return 'pending';
    }
    
    try {
      // Convertir a números para comparación
      const expected = parseFloat(expectedAmount);
      const received = parseFloat(receivedAmountStr);
      
      // Pequeña tolerancia para posibles problemas de punto flotante
      const tolerance = 0.000001;
      
      if (Math.abs(received - expected) < tolerance) {
        return 'completed';
      } else if (received < expected) {
        return 'underpaid';
      } else {
        return 'overpaid';
      }
    } catch (error) {
      console.error(`[Monitor-Status] Error al comparar montos:`, error);
      return 'error';
    }
  }
}

export default new BlockchainMonitor(); 