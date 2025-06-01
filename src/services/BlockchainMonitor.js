import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import axios from 'axios';
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
   * Verifica si existe una transacción confirmada para un pago en Tron
   * @param {Object} payment - Datos del pago
   * @returns {Promise<Object|null>} - Datos de la transacción o null si no se encuentra
   */
  async checkTronPayment(payment) {
    try {
      const recipientAddress = payment.paymentData.mainWallet.address;
      const currency = payment.paymentData.currency;
      
      // Obtener información del token
      const tokenInfo = this.getTokenInfo('Tron', currency);
      if (!tokenInfo) {
        console.error(`[Monitor-Tron] Moneda no soportada ${currency} para pago ${payment.uniqueId}`);
        return null;
      }
      
      // Convertir el monto esperado a unidades con decimales
      const expectedAmountSunStr = ethers.utils.parseUnits(
        payment.paymentData.amount.toString(), 
        tokenInfo.decimals
      ).toString();
      const expectedAmountSunBig = new BigNumber(expectedAmountSunStr);
      
      // Validar fechas
      const now = new Date();
      const createdAt = payment.paymentData.createdAt.toDate ? 
        payment.paymentData.createdAt.toDate() : payment.paymentData.createdAt;
      const expiresAt = payment.paymentData.expiresAt.toDate ? 
        payment.paymentData.expiresAt.toDate() : payment.paymentData.expiresAt;
      
      const minTimestamp = createdAt.getTime();
      const maxTimestamp = expiresAt.getTime() + (5 * 60 * 1000); // 5 min extra
      
      // Determinar si es una transferencia de token o TRX nativo
      const isTokenTransfer = (currency !== 'TRX');
      
      // Configurar headers para la API
      let headers = {};
      if (this.tronApiKey) {
        headers['TRON-PRO-API-KEY'] = this.tronApiKey;
      }
      
      // Construir URL y parámetros
      let apiUrl = '';
      if (isTokenTransfer) {
        apiUrl = `${this.tronApiUrl}/v1/accounts/${recipientAddress}/transactions/trc20`;
      } else {
        apiUrl = `${this.tronApiUrl}/v1/accounts/${recipientAddress}/transactions`;
      }
      
      const apiParams = {
        limit: 50,
        min_block_timestamp: minTimestamp,
        max_block_timestamp: maxTimestamp,
        only_to: true
      };
      
      if (isTokenTransfer) {
        apiParams.contract_address = tokenInfo.contractAddress;
      }
      
      console.log(`[Monitor-Tron] Consultando ${apiUrl} para ${currency} a ${recipientAddress} para pago ${payment.uniqueId}`);
      const response = await axios.get(apiUrl, { params: apiParams, headers });
      
      if (!response.data || !response.data.success) {
        console.error(`[Monitor-Tron] Error de API para ${payment.uniqueId}: ${response.data?.error || 'Error desconocido'}`);
        return null;
      }
      
      if (!response.data.data || response.data.data.length === 0) {
        console.log(`[Monitor-Tron] No se encontraron transacciones para ${payment.uniqueId}`);
        return null;
      }
      
      // Buscar una transacción que coincida con los criterios
      for (const tx of response.data.data) {
        let txHash, blockNumber, receivedAmountSunBig, txConfirmed, txTimestamp;
        
        if (isTokenTransfer) {
          // Verificar transferencia de token TRC20
          if (tx.type !== 'Transfer' || 
              tx.to.toLowerCase() !== recipientAddress.toLowerCase() || 
              !tx.token_info || 
              tx.token_info.address !== tokenInfo.contractAddress) {
            continue;
          }
          
          txHash = tx.transaction_id;
          blockNumber = tx.block_timestamp;
          receivedAmountSunBig = new BigNumber(tx.value);
          txTimestamp = tx.block_timestamp;
          txConfirmed = true; // Asumimos que las transacciones devueltas por la API ya están confirmadas
          
        } else {
          // Verificar transferencia de TRX nativo
          if (!tx.raw_data || !tx.raw_data.contract || 
              tx.raw_data.contract.length === 0 || 
              tx.raw_data.contract[0].type !== 'TransferContract') {
            continue;
          }
          
          // Verificar datos del contrato
          if (!tx.raw_data.contract[0].parameter || !tx.raw_data.contract[0].parameter.value) {
            continue;
          }
          
          const contractData = tx.raw_data.contract[0].parameter.value;
          
          // Verificar destinatario y monto
          if (!contractData.to_address || typeof contractData.amount === 'undefined') {
            continue;
          }
          
          txHash = tx.txID;
          blockNumber = tx.blockNumber || tx.block_timestamp;
          txTimestamp = tx.block_timestamp;
          
          // Parsear monto
          receivedAmountSunBig = new BigNumber(contractData.amount.toString());
          
          // Determinar si está confirmada
          txConfirmed = tx.ret && tx.ret.length > 0 && tx.ret[0].contractRet === 'SUCCESS' && blockNumber > 0;
        }
        
        // Verificar timestamp nuevamente
        if (txTimestamp < minTimestamp || txTimestamp > maxTimestamp) {
          continue;
        }
        
        // Verificar coincidencia exacta del monto
        if (receivedAmountSunBig.isEqualTo(expectedAmountSunBig)) {
          console.log(`[Monitor-Tron] Encontrada coincidencia para ${payment.uniqueId}: Tx ${txHash}, Confirmada: ${txConfirmed}`);
          
          return {
            hash: txHash,
            receivedAmount: ethers.utils.formatUnits(receivedAmountSunBig.toFixed(), tokenInfo.decimals),
            blockNumber: blockNumber,
            isConfirmed: txConfirmed
          };
        } else {
          console.log(`[Monitor-Tron] Tx ${txHash} para ${payment.uniqueId} con monto incorrecto. Esperado: ${expectedAmountSunBig.toFixed()}, Recibido: ${receivedAmountSunBig.toFixed()}`);
        }
      }
      
      console.log(`[Monitor-Tron] No se encontró transacción confirmada para ${payment.uniqueId}`);
      return null;
      
    } catch (error) {
      console.error(`[Monitor-Tron] Error al verificar pago Tron ${payment.uniqueId}:`, error.message);
      if (error.response) {
        console.error("[Monitor-Tron] Datos de respuesta con error:", error.response.data);
      }
      return null;
    }
  }
  
  /**
   * Monitorea un pago en la blockchain correspondiente
   * @param {Object} payment - Datos del pago
   * @returns {Promise<Object|null>} - Datos de la transacción o null si no se encuentra
   */
  async monitorPayment(payment) {
    if (payment.paymentData.network === 'BSC') {
      return await this.checkBSCPayment(payment);
    } else if (payment.paymentData.network === 'Tron') {
      return await this.checkTronPayment(payment);
    } else {
      console.error(`[Monitor] Red no soportada: ${payment.paymentData.network}`);
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