import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * Crea un snapshot histórico de la cuenta con todos los KPIs calculados
 * @param {string} accountId - ID del documento de tradingAccounts
 * @param {Object} updatedData - Datos actualizados que contienen el nuevo balance
 * @returns {Promise<string>} - ID del documento histórico creado
 */
export const createBalanceSnapshot = async (accountId, updatedData = {}) => {
  try {
    // Obtener datos completos de la cuenta
    const accountRef = doc(db, 'tradingAccounts', accountId);
    const accountSnap = await getDoc(accountRef);
    
    if (!accountSnap.exists()) {
      throw new Error(`Account ${accountId} not found`);
    }
    
    const accountData = { ...accountSnap.data(), ...updatedData };
    
    // Configuración del challenge según la fase
    const challengeConfig = getChallengeConfig(accountData);
    
    // Calcular métricas automáticamente
    const metrics = calculateAutoMetrics(accountData, null);
    
    // Crear snapshot histórico
    const historySnapshot = {
      // Referencias
      accountId: accountId,
      userId: accountData.userId,
      timestamp: serverTimestamp(),
      snapshotDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      
      // Datos del balance
      balanceActual: accountData.balanceActual || 0,
      challengeAmountNumber: accountData.challengeAmountNumber || 0,
      
      // KPIs calculados automáticamente
      totalProfit: metrics.totalProfit,
      profitPercentage: metrics.profitGrowth,
      dailyDrawdown: metrics.dailyDrawdown,
      totalDrawdown: metrics.totalDrawdown,
      drawdownPercentage: metrics.drawdownPercentage,
      
      // Límites y objetivos
      dailyLossLimit: challengeConfig.dailyLossLimit,
      globalLossLimit: challengeConfig.maxLossLimit, 
      profitTarget: challengeConfig.profitTarget,
      allowedLossToday: challengeConfig.dailyLossLimit - metrics.dailyDrawdown,
      allowedLossTotal: challengeConfig.maxLossLimit - metrics.totalDrawdown,
      
      // Días de trading (necesitaríamos calcular desde el primer snapshot)
      tradingDays: await calculateTradingDays(accountId),
      
      // Estado de objetivos
      dailyLossExceeded: metrics.dailyDrawdown >= challengeConfig.dailyLossLimit,
      globalLossExceeded: metrics.totalDrawdown >= challengeConfig.maxLossLimit,
      profitTargetReached: metrics.totalProfit >= challengeConfig.profitTarget,
      minimumTradingDaysReached: await calculateTradingDays(accountId) >= challengeConfig.minimumTradingDays,
      
      // Metadata de la cuenta
      challengePhase: accountData.challengePhase || '',
      challengeType: accountData.challengeType || '',
      status: accountData.status || 'Activa',
      
      // Fuente de la actualización
      updateSource: updatedData.updateSource || 'manual',
      updateReason: updatedData.updateReason || 'balance_update'
    };
    
    // Guardar en la colección accountHistory
    const docRef = await addDoc(collection(db, 'accountHistory'), historySnapshot);
    
    console.log('✅ Balance snapshot created:', {
      accountId,
      historyId: docRef.id,
      balance: accountData.balanceActual,
      profit: metrics.totalProfit,
      tradingDays: await calculateTradingDays(accountId)
    });
    
    return docRef.id;
    
  } catch (error) {
    console.error('❌ Error creating balance snapshot:', error);
    throw error;
  }
};

/**
 * Configuración del challenge según la fase
 */
const getChallengeConfig = (account) => {
  const initialBalance = account.challengeAmountNumber || 100000;
  let config = {};
  
  const challengePhase = account.challengePhase?.toUpperCase() || '';
  
  if (challengePhase.includes('1') || challengePhase.includes('ONE')) {
    // 1 FASE - Reglas más estrictas
    config = {
      dailyLossLimit: initialBalance * 0.05,    // 5% pérdida diaria
      maxLossLimit: initialBalance * 0.10,      // 10% pérdida total  
      profitTarget: initialBalance * 0.10,      // 10% ganancia objetivo
      minimumTradingDays: 5
    };
  } else if (challengePhase.includes('2') || challengePhase.includes('TWO')) {
    // 2 FASE - Reglas más relajadas
    config = {
      dailyLossLimit: initialBalance * 0.05,    // 5% pérdida diaria
      maxLossLimit: initialBalance * 0.10,      // 10% pérdida total
      profitTarget: initialBalance * 0.05,      // 5% ganancia objetivo  
      minimumTradingDays: 5
    };
  } else if (challengePhase.includes('FUNDED') || challengePhase.includes('REAL')) {
    // CUENTA FONDEADA - Reglas de cuenta real
    config = {
      dailyLossLimit: initialBalance * 0.05,    // 5% pérdida diaria
      maxLossLimit: initialBalance * 0.10,      // 10% pérdida total
      profitTarget: Infinity,                   // Sin límite de ganancia
      minimumTradingDays: 0                     // Sin mínimo de días
    };
  } else {
    // Default para casos no identificados
    config = {
      dailyLossLimit: initialBalance * 0.05,
      maxLossLimit: initialBalance * 0.10, 
      profitTarget: initialBalance * 0.10,
      minimumTradingDays: 5
    };
  }
  
  return config;
};

/**
 * Calcula métricas automáticamente desde balance inicial vs actual
 */
const calculateAutoMetrics = (account, accountMt5Info) => {
  const initialBalance = account.challengeAmountNumber || 100000;
  const currentBalance = accountMt5Info?.balance ?? account.balanceActual ?? initialBalance;
  
  // Calcular diferencia total
  const totalProfit = currentBalance - initialBalance;
  const profitGrowth = initialBalance > 0 ? (totalProfit / initialBalance) * 100 : 0;
  
  // Para este ejemplo, asumimos que todo el drawdown es "diario" 
  // En una implementación real, necesitarías comparar con el snapshot anterior
  const totalDrawdown = Math.max(0, initialBalance - currentBalance);
  const dailyDrawdown = totalDrawdown; // Simplificado
  const drawdownPercentage = initialBalance > 0 ? (totalDrawdown / initialBalance) * 100 : 0;
  
  return {
    initialBalance,
    currentBalance,
    totalProfit,
    profitGrowth,
    totalDrawdown,
    dailyDrawdown, 
    drawdownPercentage
  };
};

/**
 * Calcula los días de trading desde el primer snapshot
 */
const calculateTradingDays = async (accountId) => {
  try {
    // En una implementación real, consultarías la colección accountHistory
    // y contarías los días únicos con actividad
    
    // Por ahora retornamos un valor por defecto
    return 1; // Primer día
    
    /* Implementación futura:
    const historyQuery = query(
      collection(db, 'accountHistory'),
      where('accountId', '==', accountId),
      orderBy('timestamp', 'asc')
    );
    
    const historySnap = await getDocs(historyQuery);
    const uniqueDates = new Set();
    
    historySnap.forEach(doc => {
      const date = doc.data().snapshotDate;
      uniqueDates.add(date);
    });
    
    return uniqueDates.size;
    */
    
  } catch (error) {
    console.error('Error calculating trading days:', error);
    return 1;
  }
};

/**
 * Función helper para actualizar balance y crear snapshot automáticamente
 * @param {string} accountId - ID de la cuenta
 * @param {number} newBalance - Nuevo balance
 * @param {string} updateSource - Fuente de la actualización ('mt5', 'manual', 'api')
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const updateBalanceWithHistory = async (accountId, newBalance, updateSource = 'manual') => {
  try {
    // Actualizar el documento principal
    const accountRef = doc(db, 'tradingAccounts', accountId);
    const updateData = {
      balanceActual: newBalance,
      lastUpdated: serverTimestamp(),
      updateSource: updateSource
    };
    
    await updateDoc(accountRef, updateData);
    
    // Crear snapshot histórico
    const historyId = await createBalanceSnapshot(accountId, {
      balanceActual: newBalance,
      updateSource,
      updateReason: 'balance_update'
    });
    
    console.log('✅ Balance updated with history:', {
      accountId,
      newBalance,
      historyId
    });
    
    return {
      success: true,
      accountId,
      newBalance,
      historyId,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error updating balance with history:', error);
    throw error;
  }
};

export default {
  createBalanceSnapshot,
  updateBalanceWithHistory
}; 