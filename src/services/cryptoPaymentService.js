import axios from 'axios';
import { getAuth } from 'firebase/auth';

// URL base de la API de pagos con criptomonedas
const CRYPTO_API_URL = import.meta.env.VITE_CRYPTO_API_URL || 'https://whapy.com/crypto/api';

// Función auxiliar para obtener el token de autenticación
const getAuthToken = async () => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('Usuario no autenticado');
    }
    const token = await auth.currentUser.getIdToken(true); // Forzar refresh del token
    if (!token) {
      throw new Error('No se pudo obtener el token de autenticación');
    }
    return token;
  } catch (error) {
    console.error('Error al obtener token de autenticación:', error);
    throw new Error('Error de autenticación: ' + error.message);
  }
};

/**
 * Genera una página de pago con criptomoneda
 * @param {number} amount - Monto a pagar
 * @param {string} currency - Moneda (USDT)
 * @param {string} network - Red (Tron o BSC)
 * @returns {Promise<Object>} - URL y datos del pago
 */
export const generateCryptoPayment = async (amount, currency = 'USDT', network = 'Tron') => {
  try {
    const token = await getAuthToken();
    console.log('Token obtenido:', token ? 'Sí' : 'No'); // Debug

    const response = await axios.post(
      `${CRYPTO_API_URL}/wallet/generate-payment-page`,
      { 
        amount, 
        currency, 
        network,
        userName: 'Usuario' // Agregar userName requerido
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && response.data.success) {
      return response.data;
    } else {
      throw new Error('Error al generar página de pago');
    }
  } catch (error) {
    console.error('Error al generar página de pago con criptomoneda:', error);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
      throw new Error(error.response.data.error || error.response.data.msg || 'Error al generar página de pago');
    }
    throw new Error(error.message || 'Error al generar página de pago');
  }
};

/**
 * Verifica el estado de un pago
 * @param {string} uniqueId - ID único del pago
 * @returns {Promise<Object>} - Estado del pago
 */
export const checkPaymentStatus = async (uniqueId) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(
      `${CRYPTO_API_URL}/wallet/payment-status/${uniqueId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error al verificar estado del pago:', error);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
      throw new Error(error.response.data.error || error.response.data.msg || 'Error al verificar estado del pago');
    }
    throw new Error(error.message || 'Error al verificar estado del pago');
  }
};

export default {
  generateCryptoPayment,
  checkPaymentStatus
}; 