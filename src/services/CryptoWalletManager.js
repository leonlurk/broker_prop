import TronWeb from 'tronweb/dist/TronWeb.js';
import Web3 from 'web3';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

/**
 * Clase para gestionar billeteras y direcciones de criptomonedas
 */
export class CryptoWalletManager {
  constructor() {
    // Inicializar Web3 para BSC
    this.web3 = new Web3(new Web3.providers.HttpProvider(
      import.meta.env.VITE_BSC_URL || 'https://bsc-dataseed.binance.org/'
    ));
    
    // Inicializar TronWeb
    this.tronWeb = new TronWeb({
      fullHost: import.meta.env.VITE_TRON_FULL_HOST || 'https://api.trongrid.io'
    });
    
    // Configuración
    this.BSC_NETWORK_ID = '56'; // Mainnet BSC
    this.STATIC_WALLETS = {
      tron: import.meta.env.VITE_TRON_WALLET_ADDRESS,
      bsc: import.meta.env.VITE_BSC_WALLET_ADDRESS
    };
  }

  /**
   * Genera un ID único para el pago
   * @returns {string} ID único
   */
  generatePaymentId() {
    return uuidv4();
  }

  /**
   * Obtiene una dirección de billetera para recibir pagos
   * @param {string} network - Red blockchain (Tron o BSC)
   * @returns {Promise<string>} - Dirección de billetera
   */
  async generateWalletAddress(network) {
    // Primero intentamos obtener la dirección estática de las variables de entorno
    if (network === 'Tron' && this.STATIC_WALLETS.tron) {
      return this.STATIC_WALLETS.tron;
    } 
    if (network === 'BSC' && this.STATIC_WALLETS.bsc) {
      return this.STATIC_WALLETS.bsc;
    }
    
    // Si no hay dirección en las variables de entorno, buscamos en Firestore
    return await this.getWalletAddressFromFirestore(network);
  }

  /**
   * Obtiene la dirección de billetera desde Firestore
   * @param {string} network - Red blockchain
   * @returns {Promise<string>} - Dirección de billetera
   */
  async getWalletAddressFromFirestore(network) {
    try {
      // Consultar el documento de configuración en Firestore (sintaxis v9)
      const configRef = doc(db, 'config', 'wallets');
      const configSnapshot = await getDoc(configRef);
      
      if (!configSnapshot.exists()) {
        throw new Error('No se encontró configuración de billeteras en Firestore');
      }
      
      const wallets = configSnapshot.data();
      const networkKey = network.toLowerCase();
      
      if (!wallets[networkKey]) {
        throw new Error(`No hay dirección configurada para la red ${network}`);
      }
      
      return wallets[networkKey];
    } catch (error) {
      console.error(`Error al obtener dirección de wallet para ${network}:`, error);
      // Fallback a direcciones predeterminadas (solo para desarrollo)
      if (network === 'Tron') {
        return 'TEaQgjdWECF4fjzgscF6pA5v2GQvPPhBpR'; // Dirección correcta Tron
      } else if (network === 'BSC') {
        return '0x1234567890123456789012345678901234567890'; // Dirección demo BSC
      }
      throw error;
    }
  }

  /**
   * Genera un código QR para un pago
   * @param {string} address - Dirección de billetera
   * @param {number} amount - Monto a pagar
   * @param {string} currency - Moneda (USDT, etc)
   * @param {string} network - Red blockchain
   * @returns {Promise<string>} - URL del código QR en base64
   */
  async generatePaymentQR(address, amount, currency, network) {
    try {
      return await QRCode.toDataURL(address);
    } catch (error) {
      console.error('Error al generar código QR:', error);
      throw new Error('No se pudo generar el código QR para el pago');
    }
  }

  /**
   * Valida una dirección de blockchain
   * @param {string} address - Dirección a validar
   * @param {string} network - Red blockchain
   * @returns {boolean} - true si la dirección es válida
   */
  validateAddress(address, network) {
    try {
      if (network === 'Tron') {
        return this.tronWeb.isAddress(address);
      } else if (network === 'BSC') {
        return this.web3.utils.isAddress(address);
      }
      return false;
    } catch (error) {
      console.error(`Error al validar dirección ${address} en red ${network}:`, error);
      return false;
    }
  }
}

export default new CryptoWalletManager(); 