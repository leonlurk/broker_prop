import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';
import { Loader, AlertCircle, Copy, RefreshCw, ArrowLeft, Clock } from 'lucide-react';

/**
 * Componente para mostrar la página de pago con el código QR
 */
const PaymentPage = () => {
  const { uniqueId } = useParams();
  const navigate = useNavigate();
  const { language } = useAuth();
  const t = getTranslator(language);
  
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  
  // Función para obtener datos del pago
  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      
      // Buscar en la colección de pagos
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, where('uniqueId', '==', uniqueId), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setError(t('paymentPage_not_found'));
        setLoading(false);
        return;
      }
      
      const paymentData = snapshot.docs[0].data();
      setPayment(paymentData);
      
      // Calcular tiempo restante
      if (paymentData.paymentData && paymentData.paymentData.expiresAt) {
        const expiresAt = paymentData.paymentData.expiresAt.toDate ? 
          paymentData.paymentData.expiresAt.toDate() : paymentData.paymentData.expiresAt;
        
        const now = new Date();
        const diff = Math.max(0, Math.floor((expiresAt - now) / 1000)); // Diferencia en segundos
        setTimeLeft(diff);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener datos del pago:', err);
      setError(err.message || t('paymentPage_error_generic', 'Error al obtener datos del pago'));
      setLoading(false);
    }
  };
  
  // Efecto inicial para cargar datos
  useEffect(() => {
    fetchPaymentData();
  }, [uniqueId]);
  
  // Efecto para actualizar el contador de tiempo
  useEffect(() => {
    if (timeLeft === null) return;
    
    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [timeLeft]);
  
  // Función para copiar dirección al portapapeles
  const copyToClipboard = () => {
    if (!payment || !payment.paymentData || !payment.paymentData.mainWallet) return;
    
    const address = payment.paymentData.mainWallet.address;
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Error al copiar dirección:', err);
      });
  };
  
  // Función para formatear el tiempo restante
  const formatTimeLeft = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Renderizar pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-[#232323] flex items-center justify-center">
        <div className="text-center">
          <Loader size={64} className="text-cyan-500 mb-4 animate-spin mx-auto" />
          <h2 className="text-xl font-semibold text-white mb-2">{t('paymentPage_loading')}</h2>
        </div>
      </div>
    );
  }
  
  // Renderizar pantalla de error
  if (error || !payment) {
    return (
      <div className="min-h-screen bg-[#232323] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 bg-[#2b2b2b] rounded-xl border border-[#333] shadow-lg">
          <div className="text-center">
            <AlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
            <h2 className="text-xl font-semibold text-white mb-2">{t('paymentPage_error_title')}</h2>
            <p className="text-gray-300 mb-6">{error || t('paymentPage_not_found')}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition"
            >
              {t('paymentPage_button_dashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Obtener datos del pago
  const { paymentData } = payment;
  const { amount, currency, network, qrCode } = paymentData;
  const walletAddress = paymentData.mainWallet?.address || '';
  
  // Renderizar página de pago
  return (
    <div className="min-h-screen bg-[#232323] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#2b2b2b] rounded-xl border border-[#333] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-700 to-cyan-600 p-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-white mb-4 hover:text-gray-200 transition"
          >
            <ArrowLeft size={16} className="mr-2" />
            {t('paymentPage_button_cancel')}
          </button>
          
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">{t('paymentPage_title')}</h1>
            
            <div className="bg-[#232323] bg-opacity-30 text-white text-sm py-1.5 px-3 rounded-full flex items-center">
              <Clock size={14} className="mr-1.5" />
              <span>{formatTimeLeft(timeLeft)}</span>
            </div>
          </div>
          <p className="text-gray-100 mt-2 text-sm">{t('paymentPage_subtitle')}</p>
        </div>
        
        {/* Contenido */}
        <div className="p-6">
          {/* Detalles del pago */}
          <div className="mb-6 bg-[#333] p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-300">{t('paymentPage_amount')}:</span>
              <span className="text-white font-medium">{amount} {currency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">{t('paymentPage_network')}:</span>
              <span className="text-white font-medium">{network}</span>
            </div>
          </div>
          
          {/* QR Code */}
          <div className="flex flex-col items-center mb-6">
            <p className="text-gray-300 text-sm mb-3">{t('paymentPage_scan_qr')}</p>
            <div className="bg-white p-4 rounded-lg mb-3 shadow-lg">
              {qrCode ? (
                <img src={qrCode} alt="Payment QR Code" className="w-56 h-56" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center bg-gray-200">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
              )}
            </div>
          </div>
          
          {/* Dirección de pago */}
          <div className="mb-6">
            <p className="text-gray-300 text-sm mb-2">{t('paymentPage_wallet_address')}:</p>
            <div className="flex items-center bg-[#333] p-3 rounded-lg">
              <input
                type="text"
                readOnly
                value={walletAddress}
                className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none overflow-hidden font-mono"
              />
              <button
                onClick={copyToClipboard}
                className="ml-2 bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-md transition-colors"
                aria-label="Copy wallet address"
              >
                {copySuccess ? (
                  <span className="text-white text-xs px-1">{t('paymentPage_copied')}</span>
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          </div>
          
          {/* Instrucciones */}
          <div className="bg-[#333] bg-opacity-50 rounded-lg p-4 mb-6">
            <h3 className="text-white font-medium mb-3">{t('paymentPage_instructions_title')}</h3>
            <ol className="text-gray-300 text-sm space-y-3 list-decimal pl-5">
              <li>{t('paymentPage_instruction_1')}</li>
              <li>{t('paymentPage_instruction_2', { amount, currency })}</li>
              <li>{t('paymentPage_instruction_3')}</li>
              <li>{t('paymentPage_instruction_4')}</li>
            </ol>
          </div>
          
          {/* Botones */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => navigate(`/payment-status/${uniqueId}`)}
              className="w-full px-6 py-3 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition font-medium"
            >
              {t('paymentPage_button_check_status')}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-3 bg-transparent border border-gray-600 text-gray-300 rounded-full hover:bg-[#333] transition"
            >
              {t('paymentPage_button_dashboard')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 