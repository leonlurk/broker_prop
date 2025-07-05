import axios from 'axios';
import { getAuth } from 'firebase/auth';
import createAxiosInstance from './axiosConfig';

// URL base de la API de MT5_Manager - HTTPS funcionando en puerto 8443
const API_BASE_URL = import.meta.env.VITE_MT5_API_URL || 'https://62.171.177.212:8443';

// Crear instancia de axios configurada para certificados auto-firmados
const axiosInstance = createAxiosInstance(API_BASE_URL);

// Función auxiliar para obtener el token de autenticación
const getAuthToken = async () => {
  try {
    const auth = getAuth();
    console.log("🔐 Firebase Auth state:", {
      currentUser: !!auth.currentUser,
      userEmail: auth.currentUser?.email,
      userUID: auth.currentUser?.uid
    });
    
    if (!auth.currentUser) {
      throw new Error('Usuario no autenticado - No hay usuario actual en Firebase Auth');
    }
    
    const token = await auth.currentUser.getIdToken(true); // force refresh
    console.log("✅ Firebase token obtenido:", token ? 'Token válido' : 'Token vacío');
    return token;
  } catch (error) {
    console.error("❌ Error obteniendo token de Firebase:", error);
    throw error;
  }
};

// Función para configurar los headers con el token
const getAuthHeaders = async () => {
  try {
    const token = await getAuthToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    console.log("📤 Headers preparados:", {
      hasAuthorization: !!headers.Authorization,
      tokenLength: token ? token.length : 0,
      authPrefix: headers.Authorization ? headers.Authorization.substring(0, 20) + '...' : 'No token'
    });
    return headers;
  } catch (error) {
    console.error("❌ Error preparando headers de autenticación:", error);
    throw error;
  }
};

/**
 * Comprueba si la API está en línea
 * @returns {Promise<boolean>} - true si la API está en línea
 */
export const checkApiStatus = async () => {
  try {
    const response = await axiosInstance.get('/health');
    return response.data.status === 'healthy' || response.data.status === 'online';
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
    const response = await axiosInstance.post('/accounts', accountData, { headers });
    
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
    const response = await axiosInstance.post(
      `/accounts/${login}/deposit`, 
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
    const response = await axiosInstance.get(`/accounts/${login}`, { headers });
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
    const response = await axiosInstance.put(
      `/accounts/${login}/group`, 
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
 * Obtiene las operaciones activas de una cuenta
 * @param {number} login - Login de la cuenta
 * @returns {Promise<Object>} - Operaciones activas de la cuenta
 */
export const getAccountTrades = async (login) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axiosInstance.get(`/accounts/${login}/trades`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error al obtener operaciones de la cuenta:', error);
    throw new Error(error.response?.data?.error || 'Error al obtener operaciones de la cuenta');
  }
};

/**
 * Obtiene el historial de operaciones de una cuenta
 * @param {number} login - Login de la cuenta
 * @param {string} fromDate - Fecha inicial (YYYY-MM-DD)
 * @param {string} toDate - Fecha final (YYYY-MM-DD)
 * @returns {Promise<Object>} - Historial de operaciones
 */
export const getAccountHistory = async (login, fromDate = null, toDate = null) => {
  console.log("🔄 getAccountHistory llamado:", { login, fromDate, toDate });
  
  try {
    // Obtener headers con autenticación Firebase
    console.log("📡 Obteniendo headers de autenticación...");
    const headers = await getAuthHeaders();
    
    // Preparar parámetros de consulta
    const params = new URLSearchParams();
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    
    const queryString = params.toString();
    const url = `/api/v1/accounts/${login}/history${queryString ? `?${queryString}` : ''}`;
    
    console.log("🌐 Realizando petición:", {
      url: `${API_BASE_URL}${url}`,
      hasHeaders: !!headers,
      params: { fromDate, toDate }
    });
    
    // Realizar petición con autenticación
    const response = await axiosInstance.get(url, { headers });
    
    console.log("✅ Respuesta del servidor:", {
      status: response.status,
      hasData: !!response.data,
      dataKeys: Object.keys(response.data || {}),
      operationsCount: response.data?.operations?.length || 0
    });
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error completo al obtener historial:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      stack: error.stack
    });
    
    // Re-lanzar con información más detallada
    if (error.response?.status === 401) {
      throw new Error(`Autenticación fallida: ${error.response?.data?.message || 'Token inválido o expirado'}`);
    } else if (error.response?.status === 403) {
      throw new Error(`Acceso denegado: ${error.response?.data?.message || 'Sin permisos para esta cuenta'}`);
    } else {
      throw new Error(error.response?.data?.error || error.message || 'Error al obtener historial de la cuenta');
    }
  }
};

export default {
  checkApiStatus,
  createTradingAccount,
  depositFunds,
  getAccountInfo,
  getAccountTrades,
  getAccountHistory,
  changeAccountGroup
}; 