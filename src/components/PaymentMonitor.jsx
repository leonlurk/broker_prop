import React, { useEffect, useState } from 'react';
import PaymentService from '../services/PaymentService';

/**
 * Componente que monitorea pagos pendientes en segundo plano
 * No renderiza nada visible, solo ejecuta la lógica de monitoreo
 */
const PaymentMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const CHECK_INTERVAL = 30000; // 30 segundos entre verificaciones
  
  // Función para verificar pagos pendientes
  const checkPendingPayments = async () => {
    if (isMonitoring) return; // Evitar ejecuciones concurrentes
    
    try {
      setIsMonitoring(true);
      console.log('[PaymentMonitor] Verificando pagos pendientes...');
      
      // Obtener pagos pendientes
      const pendingPayments = await PaymentService.getPendingPayments(5);
      
      if (pendingPayments.length === 0) {
        console.log('[PaymentMonitor] No hay pagos pendientes');
        return;
      }
      
      console.log(`[PaymentMonitor] Encontrados ${pendingPayments.length} pagos pendientes`);
      
      // Verificar cada pago
      for (const payment of pendingPayments) {
        try {
          console.log(`[PaymentMonitor] Verificando pago ${payment.uniqueId}`);
          await PaymentService.checkPaymentStatus(payment.uniqueId);
        } catch (error) {
          console.error(`[PaymentMonitor] Error al verificar pago ${payment.uniqueId}:`, error);
        }
      }
      
    } catch (error) {
      console.error('[PaymentMonitor] Error al verificar pagos pendientes:', error);
    } finally {
      setIsMonitoring(false);
    }
  };
  
  // Configurar el intervalo de verificación
  useEffect(() => {
    // Primera verificación al montar el componente (después de 10 segundos)
    const initialTimeout = setTimeout(() => {
      checkPendingPayments();
    }, 10000);
    
    // Configurar intervalo regular
    const intervalId = setInterval(checkPendingPayments, CHECK_INTERVAL);
    
    // Limpiar al desmontar
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, []);
  
  // Este componente no renderiza nada visible
  return null;
};

export default PaymentMonitor; 