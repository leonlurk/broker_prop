/**
 * EJEMPLOS DE USO DEL SISTEMA DE HISTORIAL
 * 
 * Este archivo muestra diferentes formas de integrar y usar
 * el sistema de historial automático de balances y KPIs.
 */

import { updateBalanceWithHistory, createBalanceSnapshot } from '../utils/historyUtils';
import { useState, useCallback } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// ==========================================
// EJEMPLO 1: Actualización manual del balance
// ==========================================

/**
 * Cuando un administrador actualiza manualmente el balance de una cuenta
 */
export const handleManualBalanceUpdate = async (accountId, newBalance) => {
  try {
    const result = await updateBalanceWithHistory(
      accountId, 
      newBalance, 
      'manual_admin'
    );
    
    console.log('✅ Balance actualizado:', result);
    // El sistema automáticamente:
    // 1. Actualiza tradingAccounts.balanceActual
    // 2. Crea un snapshot en accountHistory
    // 3. Calcula todos los KPIs automáticamente
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

// ==========================================
// EJEMPLO 2: Integración con API de MT5
// ==========================================

/**
 * Cuando se reciben datos actualizados de MT5
 */
export const syncMT5Balance = async (accountId, mt5Data) => {
  try {
    const newBalance = mt5Data.balance;
    
    const result = await updateBalanceWithHistory(
      accountId,
      newBalance,
      'mt5_sync'
    );
    
    // También puedes crear snapshots adicionales con datos extra
    await createBalanceSnapshot(accountId, {
      balanceActual: newBalance,
      updateSource: 'mt5_api',
      updateReason: 'real_time_sync',
      // Datos adicionales de MT5
      mt5Equity: mt5Data.equity,
      mt5Margin: mt5Data.margin,
      mt5Profit: mt5Data.profit
    });
    
    return result;
  } catch (error) {
    console.error('❌ Error sincronizando MT5:', error);
    throw error;
  }
};

// ==========================================
// EJEMPLO 3: Webhook para actualizaciones externas
// ==========================================

/**
 * Endpoint webhook para recibir actualizaciones de balance
 */
export const webhookBalanceUpdate = async (req, res) => {
  try {
    const { accountId, newBalance, source, metadata } = req.body;
    
    // Validar datos
    if (!accountId || newBalance === undefined) {
      return res.status(400).json({ 
        error: 'accountId y newBalance son requeridos' 
      });
    }
    
    // Actualizar con historial
    const result = await updateBalanceWithHistory(
      accountId,
      newBalance,
      source || 'webhook'
    );
    
    // Si hay metadata adicional, crear snapshot extendido
    if (metadata) {
      await createBalanceSnapshot(accountId, {
        balanceActual: newBalance,
        updateSource: source,
        updateReason: 'webhook_update',
        ...metadata
      });
    }
    
    res.json({
      success: true,
      data: result,
      message: 'Balance actualizado correctamente'
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

// ==========================================
// EJEMPLO 4: Procesamiento batch de múltiples cuentas
// ==========================================

/**
 * Actualizar múltiples cuentas de forma masiva
 */
export const batchUpdateBalances = async (updates) => {
  const results = [];
  const errors = [];
  
  for (const update of updates) {
    try {
      const { accountId, newBalance, source = 'batch_update' } = update;
      
      const result = await updateBalanceWithHistory(
        accountId,
        newBalance,
        source
      );
      
      results.push({
        accountId,
        success: true,
        result
      });
      
    } catch (error) {
      errors.push({
        accountId: update.accountId,
        success: false,
        error: error.message
      });
    }
  }
  
  return {
    successful: results.length,
    failed: errors.length,
    results,
    errors
  };
};

// ==========================================
// EJEMPLO 5: Integración con componentes React
// ==========================================

/**
 * Hook personalizado para manejar historial en componentes
 */
export const useAccountHistory = (accountId) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Cargar historial
  const loadHistory = useCallback(async () => {
    if (!accountId) return;
    
    setLoading(true);
    try {
      const historyQuery = query(
        collection(db, 'accountHistory'),
        where('accountId', '==', accountId),
        orderBy('timestamp', 'desc'),
        limit(50) // Últimos 50 registros
      );
      
      const snapshot = await getDocs(historyQuery);
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [accountId]);
  
  // Actualizar balance con historial
  const updateBalance = useCallback(async (newBalance, source = 'component') => {
    try {
      await updateBalanceWithHistory(accountId, newBalance, source);
      await loadHistory(); // Recargar historial
      return true;
    } catch (error) {
      console.error('Error updating balance:', error);
      return false;
    }
  }, [accountId, loadHistory]);
  
  return {
    history,
    loading,
    loadHistory,
    updateBalance
  };
};

// ==========================================
// EJEMPLO 6: Análisis de tendencias
// ==========================================

/**
 * Análisis avanzado del historial para mostrar tendencias
 */
export const analyzeAccountTrends = (history) => {
  if (!history || history.length < 2) {
    return {
      trend: 'insufficient_data',
      performance: 0,
      volatility: 0,
      riskScore: 0
    };
  }
  
  // Calcular tendencia de balance
  const balances = history.map(h => h.balanceActual).filter(b => b !== undefined);
  const firstBalance = balances[balances.length - 1]; // Más antiguo
  const lastBalance = balances[0]; // Más reciente
  
  const performance = ((lastBalance - firstBalance) / firstBalance) * 100;
  
  // Calcular volatilidad
  const changes = [];
  for (let i = 1; i < balances.length; i++) {
    const change = ((balances[i-1] - balances[i]) / balances[i]) * 100;
    changes.push(Math.abs(change));
  }
  
  const volatility = changes.length > 0 
    ? changes.reduce((sum, change) => sum + change, 0) / changes.length 
    : 0;
  
  // Calcular score de riesgo
  const maxDrawdown = Math.max(...history.map(h => h.totalDrawdown || 0));
  const initialBalance = history[history.length - 1]?.challengeAmountNumber || 100000;
  const riskScore = (maxDrawdown / initialBalance) * 100;
  
  return {
    trend: performance > 0 ? 'positive' : performance < 0 ? 'negative' : 'neutral',
    performance: Math.round(performance * 100) / 100,
    volatility: Math.round(volatility * 100) / 100,
    riskScore: Math.round(riskScore * 100) / 100,
    totalSnapshots: history.length,
    tradingDays: new Set(history.map(h => h.snapshotDate)).size
  };
};

// ==========================================
// EJEMPLO 7: Alertas automáticas
// ==========================================

/**
 * Sistema de alertas basado en historial
 */
export const checkAccountAlerts = (accountHistory) => {
  const alerts = [];
  const latest = accountHistory[0]; // Más reciente
  
  if (!latest) return alerts;
  
  // Alerta de pérdida diaria excedida
  if (latest.dailyLossExceeded) {
    alerts.push({
      type: 'danger',
      title: 'Límite Diario Excedido',
      message: `La cuenta ha excedido el límite de pérdida diaria de ${latest.dailyLossLimit}`,
      accountId: latest.accountId,
      timestamp: latest.timestamp
    });
  }
  
  // Alerta de pérdida global excedida
  if (latest.globalLossExceeded) {
    alerts.push({
      type: 'critical',
      title: 'Límite Global Excedido',
      message: `La cuenta ha excedido el límite de pérdida global de ${latest.globalLossLimit}`,
      accountId: latest.accountId,
      timestamp: latest.timestamp
    });
  }
  
  // Alerta de objetivo alcanzado
  if (latest.profitTargetReached) {
    alerts.push({
      type: 'success',
      title: 'Objetivo Alcanzado',
      message: `¡La cuenta ha alcanzado el objetivo de ganancia de ${latest.profitTarget}!`,
      accountId: latest.accountId,
      timestamp: latest.timestamp
    });
  }
  
  return alerts;
};

export default {
  handleManualBalanceUpdate,
  syncMT5Balance,
  webhookBalanceUpdate,
  batchUpdateBalances,
  useAccountHistory,
  analyzeAccountTrends,
  checkAccountAlerts
}; 