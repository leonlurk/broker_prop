import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';
import { Loader, CheckCircle, AlertCircle, XCircle, ArrowUpRight, ArrowLeft } from 'lucide-react';
import PaymentService from '../services/PaymentService';
import { createTradingAccount } from '../services/mt5Service';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';

/**
 * Componente para mostrar el estado de un pago
 */
const PaymentStatusPage = () => {
  const { uniqueId } = useParams();
  const navigate = useNavigate();
  const { currentUser, language } = useAuth();
  const t = getTranslator(language);
  
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 segundos
  const [processingAccount, setProcessingAccount] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [mt5AccountData, setMt5AccountData] = useState(null);
  const [accountId, setAccountId] = useState(null);
  
  // Función para obtener el estado del pago
  const fetchPaymentStatus = async () => {
    try {
      console.log('Verificando estado del pago:', uniqueId);
      
      const paymentData = await PaymentService.checkPaymentStatus(uniqueId);
      setPayment(paymentData);
      
      // Si el pago está completado y todavía no hemos procesado la cuenta
      if (paymentData.status === 'completed' && !accountCreated && !processingAccount) {
        handlePaymentCompleted(paymentData);
      }
      
      // Si el pago está en estado final, detenemos la actualización
      if (['completed', 'expired', 'error', 'underpaid', 'overpaid'].includes(paymentData.status)) {
        console.log(`Pago en estado final: ${paymentData.status}, deteniendo actualizaciones`);
        setRefreshInterval(null);
      }
    } catch (err) {
      console.error('Error al verificar estado del pago:', err);
      setError(err.message || t('paymentStatus_error_generic', 'Error al verificar el estado del pago'));
      setRefreshInterval(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Efecto para verificar el estado del pago
  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
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
  
  // Función para manejar el pago completado
  const handlePaymentCompleted = async (paymentData) => {
    try {
      setProcessingAccount(true);
      console.log('Procesando cuenta para pago completado:', paymentData);
      
      // Buscar el pago original en cryptoPayments para obtener los datos del desafío
      const paymentsRef = collection(db, 'cryptoPayments');
      const q = query(paymentsRef, where('uniqueId', '==', uniqueId), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.error('No se encontró el registro original del pago');
        setError(t('paymentStatus_error_payment_not_found', 'No se pudo encontrar la información del desafío'));
        setProcessingAccount(false);
        return;
      }
      
      const paymentRef = snapshot.docs[0].data();
      const {
        challengeType,
        challengeAmount,
        amount: purchasePriceNumber
      } = paymentRef;
      
      // Parsear el monto del desafío
      const challengeAmountNumber = parseCurrencyToNumber(challengeAmount);
      
      // Crear cuenta en MT5
      const currentAccountNumber = Date.now().toString();
      
      // Determinar si es one_step o two_step
      const isOneStep = challengeType === 'one_step';
      
      // Datos para crear la cuenta en MT5
      const mt5AccountData = {
        name: currentUser.displayName || 'Trader',
        email: currentUser.email,
        leverage: 100,  // Apalancamiento por defecto
        deposit: challengeAmountNumber,  // Depósito inicial igual al tamaño del desafío
        challenge_type: challengeType,
        group: `challenge\\${isOneStep ? 'onestep' : 'twostep'}`,
        purchase_id: currentAccountNumber,
        phone: currentUser.phoneNumber || '',
      };
      
      // Llamar a la API de MT5Manager para crear la cuenta real
      console.log('Creando cuenta MT5:', mt5AccountData);
      let mt5Account = null;
      try {
        mt5Account = await createTradingAccount(mt5AccountData);
        setMt5AccountData(mt5Account);
        console.log("MT5 Account created successfully:", mt5Account);
      } catch (error) {
        console.error("Error creating MT5 account:", error);
      }
      
      // Determinar valores para tradingAccounts
      const challengePhaseValue = isOneStep ? 
        t('home_account_oneStepLabel') : t('home_account_twoStepLabel');
      
      // Guardar datos en Firebase
      const accountData = {
        userId: currentUser.uid,
        challengeType: challengeType,
        accountType: isOneStep ? 'estándar' : 'swing',
        accountStyle: isOneStep ? 'estándar' : 'swing',
        challengePhase: challengePhaseValue,
        numberOfPhases: isOneStep ? 1 : 2,
        challengeAmountString: challengeAmount,
        challengeAmountNumber: challengeAmountNumber,
        priceString: `$${purchasePriceNumber.toFixed(2)}`,
        priceNumber: purchasePriceNumber,
        status: 'Activa',
        createdAt: serverTimestamp(),
        serverType: 'MT5',
        accountNumber: currentAccountNumber,
        pnlToday: 0,
        pnl7Days: 0,
        pnl30Days: 0,
        balanceActual: challengeAmountNumber,
        paymentMethod: 'crypto',
        paymentStatus: 'completed',
        paymentUniqueId: uniqueId,
        paymentTransactionHash: paymentData.transactionHash,
        // Si se creó la cuenta en MT5, agregamos los datos
        ...(mt5Account && {
          mt5Login: mt5Account.login,
          mt5Password: mt5Account.password,
          mt5PasswordInvestor: mt5Account.password_investor,
          mt5Status: mt5Account.status,
          mt5CreatedAt: mt5Account.created_at,
          mt5AccountCreated: true
        }),
        // Si no se pudo crear en MT5, marcamos para seguimiento
        ...(!mt5Account && {
          mt5AccountCreated: false,
          mt5CreationError: 'API error',
          needsManualCreation: true
        }),
      };
      
      console.log('Guardando datos de cuenta:', accountData);
      const docRef = await addDoc(collection(db, 'tradingAccounts'), accountData);
      setAccountId(docRef.id);
      
      // Registrar operación en el historial
      const operationData = {
        userId: currentUser.uid,
        timestamp: serverTimestamp(),
        status: 'Terminado',
        orderNumber: currentAccountNumber,
        operationType: 'Purchase Challenge',
        details: `${challengeAmount} ${isOneStep ? 'Estándar' : 'Swing'}`,
        paymentMethod: 'Criptomoneda',
        amount: purchasePriceNumber,
        currency: 'USD',
        relatedAccountId: docRef.id,
        mt5AccountCreated: !!mt5Account,
        ...(mt5Account && { mt5Login: mt5Account.login })
      };
      await addDoc(collection(db, 'operations'), operationData);
      
      setAccountCreated(true);
      setProcessingAccount(false);
      
    } catch (error) {
      console.error('Error al procesar cuenta:', error);
      setError(t('paymentStatus_error_account_creation', `Error al crear cuenta: ${error.message}`));
      setProcessingAccount(false);
    }
  };
  
  // Función para parsear valores monetarios
  const parseCurrencyToNumber = (currencyString) => {
    if (typeof currencyString !== 'string') return 0;
    
    // Primero quitamos el símbolo de moneda y cualquier espacio
    let valueString = currencyString.replace(/[$\s]/g, '');
    
    // En el formato español/latinoamericano, el punto se usa como separador de miles
    // y la coma como separador decimal: $200.000,00
    // Quitamos todos los puntos y reemplazamos comas por puntos para formato numérico
    valueString = valueString.replace(/\./g, '').replace(/,/g, '.');
    
    // Convertir a número
    const numericValue = parseFloat(valueString);
    
    // Comprobar si el número se pudo convertir correctamente
    if (isNaN(numericValue)) {
      console.error(`Error parsing currency value: ${currencyString}`);
      return 0; // Valor por defecto en caso de error
    }
    
    return numericValue;
  };
  
  // Función para obtener el icono según el estado
  const getStatusIcon = () => {
    if (!payment) return <Loader size={64} className="text-cyan-500 mb-4 animate-spin" />;
    
    switch (payment.status) {
      case 'completed':
        return <CheckCircle size={64} className="text-green-500 mb-4" />;
      case 'pending':
        return <Loader size={64} className="text-yellow-500 mb-4 animate-spin" />;
      case 'expired':
        return <XCircle size={64} className="text-red-500 mb-4" />;
      case 'error':
        return <AlertCircle size={64} className="text-red-500 mb-4" />;
      case 'underpaid':
        return <AlertCircle size={64} className="text-orange-500 mb-4" />;
      case 'overpaid':
        return <CheckCircle size={64} className="text-blue-500 mb-4" />;
      default:
        return <Loader size={64} className="text-cyan-500 mb-4 animate-spin" />;
    }
  };
  
  // Función para obtener el texto según el estado
  const getStatusText = () => {
    if (!payment) return t('paymentStatus_checking');
    
    if (accountCreated) {
      return t('paymentStatus_account_created', 'Cuenta creada con éxito');
    }
    
    if (processingAccount) {
      return t('paymentStatus_creating_account', 'Creando cuenta...');
    }
    
    switch (payment.status) {
      case 'completed':
        return t('paymentStatus_completed');
      case 'pending':
        return t('paymentStatus_pending');
      case 'expired':
        return t('paymentStatus_expired');
      case 'error':
        return t('paymentStatus_error');
      case 'underpaid':
        return t('paymentStatus_underpaid', 'Pago insuficiente');
      case 'overpaid':
        return t('paymentStatus_overpaid', 'Pago excedente');
      default:
        return payment.status;
    }
  };
  
  // Función para obtener descripción detallada según el estado
  const getStatusDescription = () => {
    if (!payment) return '';
    
    if (accountCreated) {
      return t('paymentStatus_account_created_desc', 'Tu cuenta ha sido creada exitosamente y está lista para usar.');
    }
    
    if (processingAccount) {
      return t('paymentStatus_creating_account_desc', 'Estamos creando tu cuenta. Por favor espera un momento...');
    }
    
    switch (payment.status) {
      case 'completed':
        return t('paymentStatus_completed_desc', 'Tu pago ha sido procesado correctamente. ¡Gracias por tu compra!');
      case 'pending':
        return t('paymentStatus_pending_desc', 'Estamos esperando la confirmación de tu pago. Esto puede tomar unos minutos.');
      case 'expired':
        return t('paymentStatus_expired_desc', 'El tiempo para realizar el pago ha expirado. Por favor, inicia un nuevo proceso de compra.');
      case 'error':
        return t('paymentStatus_error_desc', 'Ha ocurrido un error durante el proceso de pago. Por favor, contacta a soporte.');
      case 'underpaid':
        return t('paymentStatus_underpaid_desc', 'El monto recibido es menor al esperado. Por favor, contacta a soporte para resolver esta situación.');
      case 'overpaid':
        return t('paymentStatus_overpaid_desc', 'El monto recibido es mayor al esperado. El excedente será procesado según nuestras políticas.');
      default:
        return '';
    }
  };
  
  // Función para manejar la navegación según el estado del pago
  const handleContinue = () => {
    if (accountCreated && accountId) {
      // Si la cuenta fue creada con éxito, llevamos al usuario a ver los detalles de su cuenta
      navigate(`/accounts/${accountId}`);
    } else if (payment && payment.status === 'completed') {
      // Si el pago está completado pero la cuenta no está creada aún, vamos al dashboard
      navigate('/dashboard');
    } else if (payment && payment.status === 'pending') {
      // Si está pendiente, permitimos al usuario volver a la página principal
      navigate('/dashboard');
    } else if (payment && ['expired', 'error', 'underpaid'].includes(payment.status)) {
      // Si hay algún error, lo llevamos a intentar una nueva compra
      navigate('/new-challenge');
    } else {
      // Por defecto, vamos al dashboard
      navigate('/dashboard');
    }
  };
  
  // Función para volver a la página de pago
  const handleReturnToPayment = () => {
    navigate(`/payment/${uniqueId}`);
  };

  // Función para volver a la página anterior
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // Renderizar pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-[#232323] flex items-center justify-center">
        <div className="text-center">
          <Loader size={64} className="text-cyan-500 mb-4 animate-spin mx-auto" />
          <h2 className="text-xl font-semibold text-white mb-2">{t('paymentStatus_loading', 'Cargando...')}</h2>
          <p className="text-gray-400">{t('paymentStatus_checking', 'Verificando el estado del pago')}</p>
        </div>
      </div>
    );
  }
  
  // Renderizar pantalla de error
  if (error) {
    return (
      <div className="min-h-screen bg-[#232323] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 bg-[#2b2b2b] rounded-xl border border-[#333] shadow-lg">
          <button 
            onClick={handleGoBack}
            className="flex items-center text-gray-300 mb-6 hover:text-cyan-500 transition"
          >
            <ArrowLeft size={16} className="mr-2" />
            {t('common_back', 'Volver')}
          </button>
          
          <div className="text-center">
            <AlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
            <h2 className="text-xl font-semibold text-white mb-2">{t('paymentStatus_error_title', 'Error')}</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="flex space-x-4">
              <button
                onClick={handleGoBack}
                className="flex-1 px-4 py-2 bg-[#2c2c2c] border border-gray-700 text-white rounded-full hover:bg-[#3a3a3a] transition"
              >
                {t('common_back', 'Volver')}
              </button>
              <button
                onClick={() => navigate('/new-challenge')}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition"
              >
                {t('paymentStatus_button_try_again', 'Intentar de nuevo')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#232323] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 bg-[#2b2b2b] rounded-xl border border-[#333] shadow-lg">
        <button 
          onClick={handleGoBack}
          className="flex items-center text-gray-300 mb-6 hover:text-cyan-500 transition"
        >
          <ArrowLeft size={16} className="mr-2" />
          {t('common_back', 'Volver')}
        </button>
        
        <div className="text-center">
          {getStatusIcon()}
          
          <h2 className="text-2xl font-semibold text-white mb-2">{getStatusText()}</h2>
          <p className="text-gray-300 mb-6">{getStatusDescription()}</p>
          
          {payment && (
            <div className="mb-6 text-left">
              <div className="bg-[#2c2c2c] rounded-lg p-4 mb-4 border border-gray-700">
                {payment.paymentData && (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">{t('paymentStatus_amount', 'Monto')}:</span>
                      <span className="text-white">{payment.paymentData.amount} {payment.paymentData.currency}</span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">{t('paymentStatus_network', 'Red')}:</span>
                      <span className="text-white">{payment.paymentData.network}</span>
                    </div>
                  </>
                )}
                
                {payment.receivedAmount && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">{t('paymentStatus_received', 'Recibido')}:</span>
                    <span className="text-white">{payment.receivedAmount} {payment.paymentData?.currency}</span>
                  </div>
                )}
                
                {payment.transactionHash && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">{t('paymentStatus_transaction', 'Transacción')}:</span>
                    <div className="flex items-center">
                      <span className="text-white truncate max-w-[150px]">{payment.transactionHash}</span>
                      {payment.paymentData?.network === 'Tron' && (
                        <a
                          href={`https://tronscan.org/#/transaction/${payment.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-cyan-400 hover:text-cyan-300"
                        >
                          <ArrowUpRight size={14} />
                        </a>
                      )}
                      {payment.paymentData?.network === 'BSC' && (
                        <a
                          href={`https://bscscan.com/tx/${payment.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-cyan-400 hover:text-cyan-300"
                        >
                          <ArrowUpRight size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Información de cuenta MT5 */}
              {(accountCreated || mt5AccountData) && (
                <div className="bg-[#2c2c2c] rounded-lg p-4 mb-4 border border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-3">
                    {t('paymentStatus_mt5_account_info', 'Información de cuenta MT5')}
                  </h3>
                  
                  {mt5AccountData && (
                    <>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">{t('paymentStatus_mt5_login', 'Login')}:</span>
                        <span className="text-white font-mono">{mt5AccountData.login}</span>
                      </div>
                      
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">{t('paymentStatus_mt5_password', 'Contraseña')}:</span>
                        <span className="text-white font-mono">{mt5AccountData.password}</span>
                      </div>
                      
                      {mt5AccountData.password_investor && (
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">{t('paymentStatus_mt5_investor', 'Contraseña de Inversionista')}:</span>
                          <span className="text-white font-mono">{mt5AccountData.password_investor}</span>
                        </div>
                      )}
                      
                      <div className="bg-yellow-800 bg-opacity-40 p-3 rounded mt-3">
                        <p className="text-yellow-300 text-sm">
                          {t('paymentStatus_mt5_save_credentials', 'Guarda estas credenciales. No las compartiremos de nuevo.')}
                        </p>
                      </div>
                    </>
                  )}
                  
                  {!mt5AccountData && accountCreated && (
                    <div className="bg-yellow-800 bg-opacity-40 p-3 rounded">
                      <p className="text-yellow-300 text-sm">
                        {t('paymentStatus_mt5_manual_creation', 'Tu cuenta será creada manualmente por nuestro equipo. Recibirás las credenciales por correo electrónico.')}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Acciones según estado */}
              {payment.status === 'pending' && (
                <div className="bg-yellow-800 bg-opacity-30 rounded-lg p-4 mb-4">
                  <p className="text-yellow-300 text-sm">{t('paymentStatus_pendingInfo', 'Puedes esperar en esta página o volver más tarde. El estado se actualizará automáticamente.')}</p>
                  <button
                    onClick={handleReturnToPayment}
                    className="mt-3 w-full px-4 py-2 bg-yellow-700 text-white rounded-full hover:bg-yellow-600 transition text-sm"
                  >
                    {t('paymentStatus_button_return_to_payment', 'Volver a la página de pago')}
                  </button>
                </div>
              )}
              
              {payment.status === 'underpaid' && (
                <div className="bg-orange-800 bg-opacity-30 rounded-lg p-4 mb-4">
                  <p className="text-orange-300 text-sm">{t('paymentStatus_underpaidInfo', 'Se ha recibido menos de lo esperado. Contacta a soporte para más información.')}</p>
                </div>
              )}
              
              {payment.status === 'completed' && !accountCreated && !processingAccount && (
                <div className="bg-green-800 bg-opacity-30 rounded-lg p-4 mb-4">
                  <p className="text-green-300 text-sm">{t('paymentStatus_completedInfo', 'Pago confirmado. Procesando tu cuenta...')}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex space-x-4">
            {payment && payment.status === 'pending' && (
              <button
                onClick={handleGoBack}
                className="flex-1 px-6 py-3 bg-[#2c2c2c] border border-gray-700 text-white rounded-full hover:bg-[#3a3a3a] transition"
              >
                {t('common_back', 'Volver')}
              </button>
            )}
            
            <button
              onClick={handleContinue}
              className={`${payment && payment.status === 'pending' ? 'flex-1' : 'w-full'} px-6 py-3 ${accountCreated ? 'bg-green-600 hover:bg-green-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white rounded-full transition`}
            >
              {accountCreated 
                ? t('paymentStatus_button_view_account', 'Ver mi cuenta') 
                : payment && payment.status === 'expired'
                  ? t('paymentStatus_button_try_again', 'Intentar de nuevo')
                  : t('paymentStatus_button_continue', 'Continuar')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage; 