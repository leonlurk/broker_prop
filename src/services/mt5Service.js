import axios from 'axios';
import { getAuth } from 'firebase/auth';

// URL base de la API de MT5_Manager - usando proxy de Netlify para evitar CORS
const API_BASE_URL = import.meta.env.VITE_MT5_API_URL || '/.netlify/functions/mt5-proxy/api';

// Función auxiliar para obtener el token de autenticación
const getAuthToken = async () => {
  const auth = getAuth();
  if (!auth.currentUser) {
    throw new Error('Usuario no autenticado');
  }
  return await auth.currentUser.getIdToken();
};

// Función para configurar los headers con el token
const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Comprueba si la API está en línea
 * @returns {Promise<boolean>} - true si la API está en línea
 */
export const checkApiStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data.status === 'online';
  } catch (error) {
    console.error('Error al verificar el estado de la API:', error);
    return false;
  }
};

/**
 * Crea una nueva cuenta de trading
 * @param {Object} accountData - Datos de la cuenta a crear
 * @returns {Promise<Object>} - Información de la cuenta creada
 */
export const createTradingAccount = async (accountData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/accounts`, accountData, { headers });
    
    if (response.data && response.data.status === 'success' && response.data.data) {
      return response.data.data;
    } else if (response.data && response.data.status === 'error') {
      throw new Error(response.data.message || 'Error al crear cuenta de trading');
    } else {
      console.error('Respuesta inesperada del servidor:', response.data);
      throw new Error('Formato de respuesta inesperado del servidor');
    }
  } catch (error) {
    console.error('Error al crear cuenta de trading:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Error desconocido al crear cuenta de trading');
    }
  }
};

/**
 * Deposita fondos en una cuenta
 * @param {number} login - Login de la cuenta
 * @param {number} amount - Cantidad a depositar
 * @param {string} comment - Comentario opcional
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const depositFunds = async (login, amount, comment = '') => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/accounts/${login}/deposit`, 
      { amount, comment }, 
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error al depositar fondos:', error);
    throw new Error(error.response?.data?.error || 'Error al depositar fondos');
  }
};

/**
 * Obtiene información de una cuenta
 * @param {number} login - Login de la cuenta
 * @returns {Promise<Object>} - Información de la cuenta
 */
export const getAccountInfo = async (login) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/accounts/${login}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error al obtener información de la cuenta:', error);
    throw new Error(error.response?.data?.error || 'Error al obtener información de la cuenta');
  }
};

/**
 * Cambia el grupo de una cuenta
 * @param {number} login - Login de la cuenta
 * @param {string} newGroup - Nuevo grupo
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const changeAccountGroup = async (login, newGroup) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${API_BASE_URL}/accounts/${login}/group`, 
      { group: newGroup }, 
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error al cambiar grupo de cuenta:', error);
    throw new Error(error.response?.data?.error || 'Error al cambiar grupo de cuenta');
  }
};

/**
 * Obtiene el historial de operaciones de una cuenta
 * @param {number} login - Login de la cuenta
 * @param {string} fromDate - Fecha de inicio (YYYY-MM-DD)
 * @param {string} toDate - Fecha de fin (YYYY-MM-DD)
 * @returns {Promise<Object>} - Historial de operaciones
 */
export const getAccountHistory = async (login, fromDate, toDate) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_BASE_URL.replace('/api', '')}/accounts/history`, 
      {
        login: Number(login),
        from_date: fromDate,
        to_date: toDate
      }, 
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial de operaciones:', error);
    throw new Error(error.response?.data?.error || 'Error al obtener historial de operaciones');
  }
};

/**
 * Obtiene las estrategias de una cuenta
 * @param {string} accountId - ID de la cuenta
 * @returns {Promise<Object>} - Estrategias de la cuenta
 */
export const getAccountStrategies = async (accountId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/accounts/${accountId}/strategies`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error al obtener estrategias de cuenta:', error);
    throw new Error(error.response?.data?.error || 'Error al obtener estrategias de cuenta');
  }
};

export default {
  checkApiStatus,
  createTradingAccount,
  depositFunds,
  getAccountInfo,
  changeAccountGroup,
  getAccountHistory,
  getAccountStrategies
}; 