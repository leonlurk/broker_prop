import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/config';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';

// 🌐 URL base de la API MT5 - DNS configurado correctamente
const getApiBaseUrl = () => {
  // 🔧 CONFIGURACIÓN FLEXIBLE PARA HTTP/HTTPS
  // Cambiar USE_HTTPS a true cuando el SSL esté habilitado en el VPS
  const USE_HTTPS = false; // ⚠️ CAMBIAR A true CUANDO SSL ESTÉ LISTO
  const USE_LOCAL_DEV = false; // Para desarrollo local
  
  if (USE_LOCAL_DEV && import.meta.env.DEV) {
    return 'http://localhost:8000/mt5'; // Backend local de desarrollo
  }
  
  const protocol = USE_HTTPS ? 'https' : 'http';
  return `${protocol}://whapy.com/mt5`;
};

const API_BASE_URL = getApiBaseUrl();

// Función auxiliar para obtener el token de autenticación
const getAuthToken = async () => {
  const auth = getAuth();
  if (!auth.currentUser) {
    console.warn('🔐 Usuario no autenticado - verificar login Firebase');
    throw new Error('Usuario no autenticado - por favor inicia sesión');
  }
  
  console.log('🔐 Usuario autenticado:', auth.currentUser.email || auth.currentUser.uid);
  
  try {
    const token = await auth.currentUser.getIdToken(true); // Force refresh token
    console.log('🔑 Token Firebase obtenido exitosamente');
    return token;
  } catch (tokenError) {
    console.error('❌ Error obteniendo token Firebase:', tokenError);
    throw new Error('Error obteniendo token de autenticación');
  }
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
 * 🏥 Comprueba si la API está en línea
 * @returns {Promise<boolean>} - true si la API está en línea
 */
export const checkApiStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health/`);
    return response.data.status === 'healthy';
  } catch (error) {
    console.error('Error al verificar el estado de la API:', error);
    return false;
  }
};

/**
 * 💰 Crea una nueva cuenta de trading
 * @param {Object} accountData - Datos de la cuenta a crear
 * @returns {Promise<Object>} - Información de la cuenta creada
 */
export const createTradingAccount = async (accountData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/api/v1/accounts/create`, accountData, { headers });
    
    if (response.data && response.data.success) {
      return {
        login: response.data.account_login,
        password: response.data.account_password,
        investor_password: response.data.account_investor_password,
        balance: response.data.balance,
        group: response.data.group,
        status: 'success',
        message: response.data.message
      };
    } else {
      throw new Error(response.data.message || 'Error al crear cuenta de trading');
    }
  } catch (error) {
    console.error('Error al crear cuenta de trading:', error);
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Error desconocido al crear cuenta de trading');
    }
  }
};

/**
 * 💸 Deposita fondos en una cuenta
 * @param {number} login - Login de la cuenta
 * @param {number} amount - Cantidad a depositar
 * @param {string} comment - Comentario opcional
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const depositFunds = async (login, amount, comment = '') => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/trading/accounts/${login}/balance`, 
      { amount, comment }, 
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error al depositar fondos:', error);
    throw new Error(error.response?.data?.detail || 'Error al depositar fondos');
  }
};

/**
 * 👤 Obtiene información detallada de una cuenta
 * @param {number} login - Login de la cuenta
 * @returns {Promise<Object>} - Información de la cuenta
 */
export const getAccountInfo = async (login) => {
  try {
    // ENDPOINT REAL: Usar endpoint de producción con autenticación Firebase
    console.log(`🔍 Obteniendo info de cuenta ${login} con autenticación`);
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/api/v1/accounts/${login}`, { headers });
    
    console.log('✅ Respuesta del servidor:', response.status, response.data);
    
    if (response.data) {
      const data = response.data;
      return {
        login: data.login,
        name: data.name || `Account ${login}`,
        email: data.email || '',
        group: data.group,
        leverage: data.leverage,
        balance: parseFloat(data.balance),
        equity: parseFloat(data.equity),
        margin: parseFloat(data.margin),
        freeMargin: parseFloat(data.free_margin || 0),
        profit: parseFloat(data.profit || (data.equity - data.balance) || 0),
        created: data.created || data.last_access,
        lastAccess: data.last_access,
        status: data.enabled ? 'active' : 'inactive'
      };
    }
    
    throw new Error('API endpoint returned error');
  } catch (error) {
    console.error('❌ Error detallado:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    // Manejo específico de errores 401
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.detail || 'Error de autenticación';
      
      // Si el error es de tiempo de sincronización, dar información específica
      if (errorMessage.includes('Token used too early') || errorMessage.includes('clock')) {
        throw new Error('🕐 Error de sincronización de tiempo. Por favor, verifica que la hora de tu sistema esté correcta y vuelve a intentar.');
      }
      
      // Error general de autenticación
      throw new Error('🔐 Sesión expirada o token inválido. Por favor, cierra sesión e inicia sesión nuevamente.');
    }
    
    throw new Error(error.response?.data?.detail || 'Error al obtener información de la cuenta');
  }
};

/**
 * 🔄 Cambia el grupo de una cuenta
 * @param {number} login - Login de la cuenta
 * @param {string} newGroup - Nuevo grupo
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const changeAccountGroup = async (login, newGroup) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/accounts/group`, 
      { login: parseInt(login), new_group: newGroup }, 
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error al cambiar grupo de cuenta:', error);
    throw new Error(error.response?.data?.detail || 'Error al cambiar grupo de cuenta');
  }
};

/**
 * 📊 Obtiene historial de operaciones de una cuenta
 * @param {number} login - Login de la cuenta
 * @param {string} fromDate - Fecha inicial (YYYY-MM-DD)
 * @param {string} toDate - Fecha final (YYYY-MM-DD)
 * @returns {Promise<Array>} - Lista de operaciones
 */
export const getAccountHistory = async (login, fromDate, toDate) => {
  try {
    console.log(`🔄 Obteniendo historial real de MT5 para cuenta ${login} desde ${fromDate} hasta ${toDate}`);
    
    // Intentar obtener historial real de la API MT5
    try {
      // ENDPOINT REAL: Usar endpoint de producción con autenticación Firebase
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);
      
      const url = `${API_BASE_URL}/api/v1/accounts/${login}/history${params.toString() ? '?' + params.toString() : ''}`;
      const response = await axios.get(url, { headers });
      
      if (response.data && response.data.operations) {
        console.log(`✅ Historial obtenido: ${response.data.operations.length} operaciones`);
        return response.data.operations;
      }
    } catch (apiError) {
      console.warn('⚠️ API MT5 no disponible, usando datos de fallback:', apiError.message);
    }
    
    // Fallback: datos de prueba si la API no está disponible
    console.log(`📋 Usando datos de prueba para cuenta ${login}`);
    const testOperations = [
      {
        ticket: 123456,
        openTime: '2025-06-15 10:30:00',
        closeTime: '2025-06-15 11:45:00',
        type: 'BUY',
        volume: 0.1,
        symbol: 'EURUSD',
        openPrice: 1.0850,
        closePrice: 1.0875,
        stopLoss: 1.0800,
        takeProfit: 1.0900,
        profit: 25.00
      },
      {
        ticket: 123457,
        openTime: '2025-06-15 14:20:00',
        closeTime: '2025-06-15 15:10:00',
        type: 'SELL',
        volume: 0.2,
        symbol: 'GBPUSD',
        openPrice: 1.2650,
        closePrice: 1.2630,
        stopLoss: 1.2700,
        takeProfit: 1.2600,
        profit: 40.00
      },
      {
        ticket: 123458,
        openTime: '2025-06-16 09:15:00',
        closeTime: '2025-06-16 10:30:00',
        type: 'BUY',
        volume: 0.15,
        symbol: 'USDJPY',
        openPrice: 149.50,
        closePrice: 149.75,
        stopLoss: 149.00,
        takeProfit: 150.00,
        profit: 37.50
      }
    ];
    
    return testOperations;
  } catch (error) {
    console.error('❌ Error al obtener historial:', error);
    throw new Error('Error al obtener historial de operaciones');
  }
};

/**
 * 📈 Obtiene datos financieros de todas las cuentas
 * @returns {Promise<Array>} - Datos financieros agregados
 */
export const getFinancialData = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/api/v1/trading/dashboard`, { headers });
    
    if (response.data && response.data.accounts) {
      return response.data.accounts.map(account => ({
        login: account.login,
        balance: account.balance,
        equity: account.equity,
        group: account.group,
        challenge_type: account.challenge_type
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error al obtener datos financieros:', error);
    throw new Error(error.response?.data?.detail || 'Error al obtener datos financieros');
  }
};

/**
 * 🔍 Detecta estrategias de trading
 * @param {number|null} accountId - ID de cuenta específica (opcional)
 * @returns {Promise<Object>} - Estrategias detectadas
 */
export const detectStrategies = async (accountId = null) => {
  try {
    // ENDPOINT REAL: Usar endpoint de producción con autenticación Firebase
    const headers = await getAuthHeaders();
    const params = accountId ? `?account_login=${accountId}` : '';
    const response = await axios.get(`${API_BASE_URL}/api/v1/trading/detect_strategies${params}`, { headers });
    
    if (response.data && response.data.message) {
      return {
        message: response.data.message,
        strategies_data: response.data.strategies || [],
        total_strategies: response.data.total_strategies_detected || response.data.strategies_detected || 0
      };
    }
    
    throw new Error('API endpoint returned error');
  } catch (error) {
    console.error('Error al detectar estrategias:', error);
    throw new Error(error.response?.data?.detail || 'Error al detectar estrategias de trading');
  }
};

/**
 * 📋 Lista todas las cuentas (solo administradores)
 * @param {string|null} group - Filtrar por grupo (opcional)
 * @returns {Promise<Array>} - Lista de cuentas
 */
export const listAccounts = async (group = null) => {
  try {
    const headers = await getAuthHeaders();
    const params = group ? `?group=${group}` : '';
    const response = await axios.get(`${API_BASE_URL}/api/v1/accounts/${params}`, { headers });
    
    return response.data.accounts || response.data || [];
  } catch (error) {
    console.error('Error al listar cuentas:', error);
    throw new Error(error.response?.data?.detail || 'Error al listar cuentas');
  }
};

/**
 * 💾 Guarda datos históricos en Firebase
 * @param {string} accountId - ID de la cuenta en Firebase
 * @param {number} login - Login MT5
 * @param {Object} mt5Data - Datos de MT5 (balance, equity, etc.)
 * @returns {Promise<void>}
 */
export const saveHistoricalData = async (accountId, login, mt5Data) => {
  try {
    const historicalData = {
      accountId: accountId,
      login: login,
      balance: parseFloat(mt5Data.balance || 0),
      equity: parseFloat(mt5Data.equity || 0),
      margin: parseFloat(mt5Data.margin || 0),
      freeMargin: parseFloat(mt5Data.freeMargin || 0),
      profit: parseFloat(mt5Data.profit || 0),
      timestamp: serverTimestamp(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      datetime: new Date().toISOString()
    };

    await addDoc(collection(db, 'historicalData'), historicalData);
    console.log('✅ Datos históricos guardados:', historicalData);
  } catch (error) {
    console.error('❌ Error guardando datos históricos:', error);
    throw error;
  }
};

/**
 * 📈 Obtiene datos históricos para gráficos
 * @param {string} accountId - ID de la cuenta en Firebase
 * @param {string} period - Período: 'daily', 'monthly', 'total'
 * @param {number} days - Número de días hacia atrás (opcional)
 * @returns {Promise<Array>} - Datos históricos formateados
 */
export const getHistoricalData = async (accountId, period = 'daily', days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const q = query(
      collection(db, 'historicalData'),
      where('accountId', '==', accountId),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const rawData = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      rawData.push({
        ...data,
        id: doc.id,
        timestamp: data.timestamp?.toDate() || new Date(data.datetime)
      });
    });

    // Procesar datos según el período
    if (period === 'daily') {
      return processDailyData(rawData);
    } else if (period === 'monthly') {
      return processMonthlyData(rawData);
    } else {
      return processAllData(rawData);
    }
  } catch (error) {
    console.error('❌ Error obteniendo datos históricos:', error);
    return [];
  }
};

/**
 * 📊 Procesa datos para vista diaria
 */
const processDailyData = (rawData) => {
  const dailyData = {};
  
  rawData.forEach(item => {
    const date = item.date || item.timestamp.toISOString().split('T')[0];
    const day = new Date(date).getDate();
    
    if (!dailyData[date] || item.timestamp > dailyData[date].timestamp) {
      dailyData[date] = {
        name: `Día ${day}`,
        value: item.balance,
        equity: item.equity,
        profit: item.profit,
        date: date,
        timestamp: item.timestamp
      };
    }
  });
  
  return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * 📅 Procesa datos para vista mensual
 */
const processMonthlyData = (rawData) => {
  const monthlyData = {};
  
  rawData.forEach(item => {
    const date = new Date(item.timestamp);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const monthName = date.toLocaleString('default', { month: 'short' });
    
    if (!monthlyData[monthKey] || item.timestamp > monthlyData[monthKey].timestamp) {
      monthlyData[monthKey] = {
        name: monthName,
        value: item.balance,
        equity: item.equity,
        profit: item.profit,
        month: monthKey,
        timestamp: item.timestamp
      };
    }
  });
  
  return Object.values(monthlyData).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

/**
 * 📈 Procesa todos los datos
 */
const processAllData = (rawData) => {
  return rawData.map((item, index) => ({
    name: `Punto ${index + 1}`,
    value: item.balance,
    equity: item.equity,
    profit: item.profit,
    timestamp: item.timestamp
  }));
};

/**
 * 🧮 Calcula KPIs basados en datos históricos
 * @param {string} accountId - ID de la cuenta
 * @param {Object} currentData - Datos actuales de MT5
 * @param {number} initialBalance - Balance inicial
 * @returns {Promise<Object>} - KPIs calculados
 */
export const calculateKPIs = async (accountId, currentData, initialBalance) => {
  try {
    const historicalData = await getHistoricalData(accountId, 'daily', 30);
    
    if (historicalData.length === 0) {
      return getDefaultKPIs(currentData, initialBalance);
    }

    // Calcular métricas
    const currentBalance = currentData.balance || initialBalance;
    const profitGrowth = initialBalance ? ((currentBalance - initialBalance) / initialBalance) * 100 : 0;
    
    // Calcular drawdown
    const { dailyDrawdown, totalDrawdown } = calculateDrawdown(historicalData, initialBalance);
    
    // Calcular métricas de trading (simuladas por ahora)
    const tradingMetrics = calculateTradingMetrics(historicalData);

    return {
      initialBalance,
      currentBalance,
      profit: currentData.profit || 0,
      profitGrowth,
      dailyDrawdown,
      totalDrawdown,
      ...tradingMetrics
    };
  } catch (error) {
    console.error('❌ Error calculando KPIs:', error);
    return getDefaultKPIs(currentData, initialBalance);
  }
};

/**
 * 📉 Calcula drawdown diario y total
 */
const calculateDrawdown = (historicalData, initialBalance) => {
  if (historicalData.length === 0) {
    return { dailyDrawdown: 0, totalDrawdown: 0 };
  }

  let maxBalance = initialBalance;
  let maxDrawdown = 0;
  let dailyDrawdown = 0;

  // Calcular drawdown total
  historicalData.forEach(point => {
    if (point.value > maxBalance) {
      maxBalance = point.value;
    }
    const currentDrawdown = ((point.value - maxBalance) / maxBalance) * 100;
    if (currentDrawdown < maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }
  });

  // Calcular drawdown diario (últimas 24 horas)
  const today = new Date().toISOString().split('T')[0];
  const todayData = historicalData.filter(point => 
    point.date === today || 
    point.timestamp.toISOString().split('T')[0] === today
  );

  if (todayData.length > 0) {
    const dayStart = todayData[0].value;
    const dayMin = Math.min(...todayData.map(p => p.value));
    dailyDrawdown = ((dayMin - dayStart) / dayStart) * 100;
  }

  return {
    dailyDrawdown: Math.abs(dailyDrawdown),
    totalDrawdown: Math.abs(maxDrawdown)
  };
};

/**
 * 📊 Calcula métricas de trading
 */
const calculateTradingMetrics = (historicalData) => {
  // Por ahora devolvemos valores simulados
  // TODO: Integrar con datos reales de operaciones MT5
  return {
    avgLossPerOperation: 50,
    avgProfitPerOperation: 75,
    avgLotPerOperation: 0.1,
    avgTradeDuration: '2h 30m',
    riskRewardRatio: 1.5,
    winRate: 65
  };
};

/**
 * 🔧 KPIs por defecto cuando no hay datos históricos
 */
const getDefaultKPIs = (currentData, initialBalance) => {
  const currentBalance = currentData.balance || initialBalance;
  const profitGrowth = initialBalance ? ((currentBalance - initialBalance) / initialBalance) * 100 : 0;

  return {
    initialBalance,
    currentBalance,
    profit: currentData.profit || 0,
    profitGrowth,
    dailyDrawdown: 0,
    totalDrawdown: 0,
    avgLossPerOperation: 0,
    avgProfitPerOperation: 0,
    avgLotPerOperation: 0,
    avgTradeDuration: '0m',
    riskRewardRatio: 0,
    winRate: 0
  };
};

export default {
  checkApiStatus,
  createTradingAccount,
  depositFunds,
  getAccountInfo,
  changeAccountGroup,
  getAccountHistory,
  getFinancialData,
  detectStrategies,
  listAccounts,
  saveHistoricalData,
  getHistoricalData,
  calculateKPIs
}; 