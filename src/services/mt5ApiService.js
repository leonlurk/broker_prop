import { getAuth } from 'firebase/auth';

/**
 * 🔥 MT5 API Service - Enterprise Edition
 * Servicio centralizado para comunicación con la nueva API MT5 escalada
 * ✅ HTTPS Only
 * ✅ Firebase Authentication  
 * ✅ Error Handling Robusto
 * ✅ Retry Logic
 */

// 🌐 Configuración de URLs - VPS Windows con SSL de Contabo
const API_BASE_URL = import.meta.env.VITE_MT5_API_URL || 'https://whapy.com/mt5';
const API_VERSION = 'v1';

// 🔐 Helper para obtener token de autenticación
const getAuthToken = async () => {
  const auth = getAuth();
  if (!auth.currentUser) {
    throw new Error('Usuario no autenticado');
  }
  return await auth.currentUser.getIdToken();
};

// 🛡️ Helper para configurar headers con autenticación
const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  };
};

// 🔄 Helper para realizar requests con retry
const makeRequest = async (url, options = {}, retries = 3) => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(fullUrl, {
        ...options,
        credentials: 'include', // Para HTTPS con cookies si es necesario
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token de autenticación inválido o expirado');
        }
        if (response.status === 429) {
          throw new Error('Demasiadas solicitudes. Intenta nuevamente en unos momentos.');
        }
        if (response.status >= 500) {
          throw new Error('Error interno del servidor');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
};

/**
 * 🏥 Verificar estado de la API
 * @returns {Promise<Object>} Estado de salud de la API
 */
export const checkApiHealth = async () => {
  try {
    const response = await makeRequest('/health/');
    return {
      status: 'healthy',
      ...response
    };
  } catch (error) {
    console.error('Error al verificar estado de API:', error);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

/**
 * 👤 Obtener información detallada de una cuenta
 * @param {number} login - Login de la cuenta MT5
 * @returns {Promise<Object>} Información completa de la cuenta
 */
export const getAccountInfo = async (login) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/accounts/info/${login}`, { 
      method: 'GET', 
      headers 
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return {
      login: data.login,
      name: data.name,
      email: data.email,
      group: data.group,
      leverage: data.leverage,
      balance: parseFloat(data.balance),
      equity: parseFloat(data.equity),
      margin: parseFloat(data.margin),
      freeMargin: parseFloat(data.free_margin),
      profit: parseFloat(data.profit),
      created: data.created,
      lastAccess: data.last_access,
      status: data.status
    };
  } catch (error) {
    console.error('Error al obtener información de cuenta:', error);
    throw new Error(error.message || 'Error al obtener información de la cuenta');
  }
};

/**
 * 📊 Obtener historial de operaciones
 * @param {number} login - Login de la cuenta
 * @param {string} fromDate - Fecha inicial (YYYY-MM-DD)
 * @param {string} toDate - Fecha final (YYYY-MM-DD)
 * @returns {Promise<Array>} Lista de operaciones
 */
export const getAccountHistory = async (login, fromDate, toDate) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/accounts/history`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        login: parseInt(login),
        from_date: fromDate,
        to_date: toDate
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error('No se pudo obtener el historial de operaciones');
    }

    return data.operations.map(op => ({
      ticket: op.ticket,
      openTime: op.openTime,
      closeTime: op.closeTime,
      type: op.type,
      volume: parseFloat(op.volume),
      symbol: op.symbol,
      openPrice: parseFloat(op.openPrice),
      closePrice: parseFloat(op.closePrice),
      stopLoss: parseFloat(op.stopLoss) || 0,
      takeProfit: parseFloat(op.takeProfit) || 0,
      profit: parseFloat(op.profit)
    }));
  } catch (error) {
    console.error('Error al obtener historial:', error);
    throw new Error(error.message || 'Error al obtener historial de operaciones');
  }
};

/**
 * 💰 Crear nueva cuenta de trading
 * @param {Object} accountData - Datos de la cuenta a crear
 * @returns {Promise<Object>} Resultado de la creación
 */
export const createTradingAccount = async (accountData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await makeRequest('/accounts/create', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: accountData.name,
        email: accountData.email,
        phone: accountData.phone || '',
        group: accountData.group || 'challenge\\level1',
        leverage: accountData.leverage || 100,
        deposit: parseFloat(accountData.deposit) || 10000,
        challenge_type: accountData.challenge_type || 'level1',
        purchase_id: accountData.purchase_id || '',
        firebase_uid: accountData.firebase_uid || ''
      })
    });

    if (response.status !== 'success') {
      throw new Error(response.message || 'No se pudo crear la cuenta');
    }

    return response.data;
  } catch (error) {
    console.error('Error al crear cuenta:', error);
    throw new Error(error.message || 'Error al crear cuenta de trading');
  }
};

/**
 * 💸 Depositar fondos en una cuenta
 * @param {number} login - Login de la cuenta
 * @param {number} amount - Cantidad a depositar
 * @param {string} comment - Comentario opcional
 * @returns {Promise<Object>} Resultado del depósito
 */
export const depositFunds = async (login, amount, comment = 'Depósito') => {
  try {
    const headers = await getAuthHeaders();
    const response = await makeRequest('/accounts/deposit', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        login: parseInt(login),
        amount: parseFloat(amount),
        comment
      })
    });

    if (!response.success) {
      throw new Error('No se pudo realizar el depósito');
    }

    return response;
  } catch (error) {
    console.error('Error al depositar fondos:', error);
    throw new Error(error.message || 'Error al depositar fondos');
  }
};

/**
 * 📈 Obtener datos financieros de todas las cuentas
 * @returns {Promise<Object>} Datos financieros agregados
 */
export const getFinancialData = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await makeRequest('/fetch_financial_data', {
      method: 'GET',
      headers
    });

    return response.accounts_data || [];
  } catch (error) {
    console.error('Error al obtener datos financieros:', error);
    throw new Error(error.message || 'Error al obtener datos financieros');
  }
};

/**
 * 🔍 Detectar estrategias de trading
 * @param {number} accountId - ID de cuenta específica (opcional)
 * @returns {Promise<Object>} Datos de estrategias detectadas
 */
export const detectStrategies = async (accountId = null) => {
  try {
    const headers = await getAuthHeaders();
    let url = '/detect_strategies';
    if (accountId) {
      url += `?account_id=${accountId}`;
    }
    
    const response = await makeRequest(url, {
      method: 'GET',
      headers
    });

    return response;
  } catch (error) {
    console.error('Error al detectar estrategias:', error);
    throw new Error(error.message || 'Error al detectar estrategias');
  }
};

/**
 * 📋 Listar todas las cuentas
 * @param {string} group - Filtro de grupo opcional
 * @returns {Promise<Array>} Lista de cuentas
 */
export const listAccounts = async (group = null) => {
  try {
    const headers = await getAuthHeaders();
    let url = '/accounts/list';
    if (group) {
      url += `?group=${encodeURIComponent(group)}`;
    }
    
    const response = await makeRequest(url, {
      method: 'GET',
      headers
    });

    return response.accounts || [];
  } catch (error) {
    console.error('Error al listar cuentas:', error);
    throw new Error(error.message || 'Error al listar cuentas');
  }
};

/**
 * 🔄 Cambiar grupo de una cuenta
 * @param {number} login - Login de la cuenta
 * @param {string} newGroup - Nuevo grupo
 * @returns {Promise<Object>} Resultado del cambio
 */
export const changeAccountGroup = async (login, newGroup) => {
  try {
    const headers = await getAuthHeaders();
    const response = await makeRequest('/accounts/group', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        login: parseInt(login),
        new_group: newGroup
      })
    });

    if (!response.success) {
      throw new Error('No se pudo cambiar el grupo de la cuenta');
    }

    return response;
  } catch (error) {
    console.error('Error al cambiar grupo:', error);
    throw new Error(error.message || 'Error al cambiar grupo de cuenta');
  }
};

// 📦 Export default del servicio completo
export default {
  checkApiHealth,
  getAccountInfo,
  getAccountHistory,
  createTradingAccount,
  depositFunds,
  getFinancialData,
  detectStrategies,
  listAccounts,
  changeAccountGroup
}; 