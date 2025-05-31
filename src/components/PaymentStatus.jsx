import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { checkPaymentStatus } from '../services/cryptoPaymentService';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';
import { Loader, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const PaymentStatus = () => {
  const { uniqueId } = useParams();
  const navigate = useNavigate();
  const { currentUser, language } = useAuth();
  const t = getTranslator(language);
  
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 segundos
  
  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Función para obtener el estado del pago
    const fetchPaymentStatus = async () => {
      try {
        const status = await checkPaymentStatus(uniqueId);
        setPaymentData(status);
        
        // Si el pago está completado, expirado o con error, detenemos la actualización
        if (['completed', 'expired', 'error'].includes(status.status)) {
          setRefreshInterval(null);
        }
      } catch (err) {
        console.error('Error al verificar el estado del pago:', err);
        setError(err.message || 'Error al verificar el estado del pago');
        setRefreshInterval(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Obtener el estado del pago al cargar la página
    fetchPaymentStatus();
    
    // Configurar intervalo de actualización
    let intervalId;
    if (refreshInterval) {
      intervalId = setInterval(fetchPaymentStatus, refreshInterval);
    }
    
    // Limpiar intervalo al desmontar
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [uniqueId, currentUser, navigate, refreshInterval]);
  
  const getStatusIcon = () => {
    if (!paymentData) return null;
    
    switch (paymentData.status) {
      case 'completed':
        return <CheckCircle size={64} className="text-green-500 mb-4" />;
      case 'pending':
        return <Loader size={64} className="text-yellow-500 mb-4 animate-spin" />;
      case 'expired':
        return <XCircle size={64} className="text-red-500 mb-4" />;
      case 'error':
        return <AlertCircle size={64} className="text-red-500 mb-4" />;
      default:
        return <Loader size={64} className="text-cyan-500 mb-4 animate-spin" />;
    }
  };
  
  const getStatusText = () => {
    if (!paymentData) return '';
    
    switch (paymentData.status) {
      case 'completed':
        return t('paymentStatus_completed');
      case 'pending':
        return t('paymentStatus_pending');
      case 'expired':
        return t('paymentStatus_expired');
      case 'error':
        return t('paymentStatus_error');
      default:
        return paymentData.status;
    }
  };
  
  const handleContinue = () => {
    navigate('/dashboard');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <Loader size={64} className="text-cyan-500 mb-4 animate-spin mx-auto" />
          <h2 className="text-xl font-semibold text-white mb-2">{t('paymentStatus_loading')}</h2>
          <p className="text-gray-400">{t('paymentStatus_checking')}</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <AlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-white mb-2">{t('paymentStatus_error_title')}</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleContinue}
            className="px-6 py-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition"
          >
            {t('paymentStatus_button_continue')}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="max-w-md w-full p-6 bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
          {getStatusIcon()}
          <h2 className="text-2xl font-semibold text-white mb-2">{getStatusText()}</h2>
          
          {paymentData && (
            <div className="mb-6 text-left">
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">{t('paymentStatus_amount')}:</span>
                  <span className="text-white">{paymentData.expectedAmount} {paymentData.currency}</span>
                </div>
                {paymentData.receivedAmount && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">{t('paymentStatus_received')}:</span>
                    <span className="text-white">{paymentData.receivedAmount} {paymentData.currency}</span>
                  </div>
                )}
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">{t('paymentStatus_network')}:</span>
                  <span className="text-white">{paymentData.network}</span>
                </div>
                {paymentData.transactionHash && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">{t('paymentStatus_transaction')}:</span>
                    <span className="text-white truncate max-w-[200px]">{paymentData.transactionHash}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <button
            onClick={handleContinue}
            className="w-full px-6 py-3 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition"
          >
            {t('paymentStatus_button_continue')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus; 