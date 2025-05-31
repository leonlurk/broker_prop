import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, HelpCircle, Info } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';
import { createTradingAccount } from '../services/mt5Service';
import { generateCryptoPayment } from '../services/cryptoPaymentService';

// Constants for standardizing phase values across the application
const PHASE_ONE_STEP = 'ONE_STEP';
const PHASE_TWO_STEP = 'TWO_STEP';

export default function TradingChallengeUI() {
  const { currentUser, language } = useAuth();
  const t = getTranslator(language);
  const navigate = useNavigate();

  const [challengeAmount, setChallengeAmount] = useState('$5.000');
  // Estándar = 1 FASE (ONE STEP), Swing = 2 FASES (TWO STEPS)
  const [challengeType, setChallengeType] = useState('Estándar');
  
  // New states for complement selections
  const [selectedProfitTargetP1, setSelectedProfitTargetP1] = useState('10%'); // Default
  const [selectedProfitTargetP2, setSelectedProfitTargetP2] = useState('5%');  // Default
  const [selectedProfitSplit, setSelectedProfitSplit] = useState('80%');    // Default
  const [activePhaseForProfitTargetBonus, setActivePhaseForProfitTargetBonus] = useState('P1'); // New state, P1 is active by default
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('crypto'); // New state for payment method, default to crypto

  const [price, setPrice] = useState(''); // Will be calculated by useEffect
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [mt5AccountCreated, setMt5AccountCreated] = useState(null); // Para almacenar la información de la cuenta MT5 creada
  const [apiStatus, setApiStatus] = useState(null); // Para controlar el estado de la API
  const [processingStep, setProcessingStep] = useState(''); // Para mostrar el paso actual del proceso

  // Estado para cupón y descuento
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  // NUEVA MATRIZ DE PRECIOS DE COMPLEMENTOS SEGÚN TAMAÑO DE CUENTA
  const addOnPriceMatrix = {
    '$5.000': {
      profitTargetF1: { '9%': 10, '10%': 0, '11%': -3 },
      profitTargetF2: { '4%': 10, '5%': 0, '6%': -3 },
      profitSplit: { '70%': -3, '80%': 0, '90%': 10 }
    },
    '$10.000': {
      profitTargetF1: { '9%': 20, '10%': 0, '11%': -6 },
      profitTargetF2: { '4%': 20, '5%': 0, '6%': -6 },
      profitSplit: { '70%': -8, '80%': 0, '90%': 20 }
    },
    '$25.000': {
      profitTargetF1: { '9%': 50, '10%': 0, '11%': -15 },
      profitTargetF2: { '4%': 50, '5%': 0, '6%': -15 },
      profitSplit: { '70%': -15, '80%': 0, '90%': 50 }
    },
    '$50.000': {
      profitTargetF1: { '9%': 100, '10%': 0, '11%': -30 },
      profitTargetF2: { '4%': 100, '5%': 0, '6%': -30 },
      profitSplit: { '70%': -30, '80%': 0, '90%': 100 }
    },
    '$100.000': {
      profitTargetF1: { '9%': 200, '10%': 0, '11%': -60 },
      profitTargetF2: { '4%': 200, '5%': 0, '6%': -60 },
      profitSplit: { '70%': -60, '80%': 0, '90%': 200 }
    },
    '$200.000': {
      profitTargetF1: { '9%': 300, '10%': 0, '11%': -120 },
      profitTargetF2: { '4%': 300, '5%': 0, '6%': -120 },
      profitSplit: { '70%': -120, '80%': 0, '90%': 300 }
    }
  };

  // Opciones de complementos (sin ajuste fijo)
  const profitTargetP1Options = [
    { text: '9%', value: '9%' },
    { text: '10%', value: '10%' },
    { text: '11%', value: '11%' },
  ];
  const profitTargetP2Options = [
    { text: '4%', value: '4%' },
    { text: '5%', value: '5%' },
    { text: '6%', value: '6%' },
  ];
  const profitSplitOptions = [
    { text: '70%', value: '70%' },
    { text: '80%', value: '80%' },
    { text: '90%', value: '90%' },
  ];

  const baseChallengePrices = {
    '$5.000': 65,
    '$10.000': 115,
    '$25.000': 245,
    '$50.000': 345,
    '$100.000': 545,
    '$200.000': 1045,
  };

  // useEffect para calcular el precio y desglose
  const [priceBreakdown, setPriceBreakdown] = useState({
    base: 0,
    profitTargetF1: 0,
    profitTargetF2: 0,
    profitSplit: 0,
    discount: 0,
    total: 0
  });

  useEffect(() => {
    const basePrice = baseChallengePrices[challengeAmount] || 0;
    const matrix = addOnPriceMatrix[challengeAmount] || {};

    const p1PriceAdjustment = matrix.profitTargetF1?.[selectedProfitTargetP1] || 0;
    const p2PriceAdjustment = matrix.profitTargetF2?.[selectedProfitTargetP2] || 0;
    const splitAdjustment = matrix.profitSplit?.[selectedProfitSplit] || 0;

    let subtotal = basePrice + p1PriceAdjustment + p2PriceAdjustment + splitAdjustment;
    let discountValue = 0;
    if (appliedCoupon === 'AGM20') {
      discountValue = subtotal * 0.2;
    }
    const totalPrice = subtotal - discountValue;
    setPrice(`$${totalPrice.toFixed(2).replace('.', ',')}`);
    setPriceBreakdown({
      base: basePrice,
      profitTargetF1: p1PriceAdjustment,
      profitTargetF2: p2PriceAdjustment,
      profitSplit: splitAdjustment,
      discount: discountValue,
      total: totalPrice
    });
  }, [challengeAmount, selectedProfitTargetP1, selectedProfitTargetP2, selectedProfitSplit, appliedCoupon]);

  const parseCurrencyToNumber = (currencyString) => {
    // Primero quitamos el símbolo de moneda y cualquier espacio
    let valueString = currencyString.replace(/[$\s]/g, '');
    
    // En el formato español/latinoamericano, el punto se usa como separador de miles
    // y la coma como separador decimal: $200.000,00
    // Quitamos todos los puntos y reemplazamos comas por puntos para formato numérico
    valueString = valueString.replace(/\./g, '').replace(/,/g, '.');
    
    // Convertir a número con parseFloat
    const numericValue = parseFloat(valueString);
    
    // Comprobar si el número se pudo convertir correctamente
    if (isNaN(numericValue)) {
      console.error(`Error parsing currency value: ${currencyString}`);
      return 0; // Valor por defecto en caso de error
    }
    
    console.log(`Parsed currency: ${currencyString} -> ${numericValue}`);
    return numericValue;
  };

  const handlePurchaseChallenge = async () => {
    if (!currentUser) {
      alert(t('tradingChallenge_alert_loginToPurchase'));
      return;
    }
    
    setIsPurchasing(true);
    setProcessingStep(t('tradingChallenge_processing_init', 'Iniciando compra...'));
    setMt5AccountCreated(null);
    
    try {
      // Determinación del tipo de desafío (mantener código existente)
      console.log("Raw challengeType selected:", challengeType);
      
      const isOneStep = challengeType === 'Estándar'; 
      const challengeTypeValue = isOneStep ? 'one_step' : 'two_step';
      
      const oneStepDisplay = t('home_account_oneStepLabel');
      const twoStepDisplay = t('home_account_twoStepLabel');
      
      let challengePhaseValue;
      if (challengeType === 'Estándar') {
        challengePhaseValue = oneStepDisplay; // "1 FASE" in Spanish
      } else if (challengeType === 'Swing') {
        challengePhaseValue = twoStepDisplay; // "2 FASES" in Spanish
      } else {
        challengePhaseValue = isOneStep ? oneStepDisplay : twoStepDisplay;
      }
      
      console.log("Creating new account with:", {
        selectedChallengeType: challengeType,
        phase: challengePhaseValue,
        type: challengeTypeValue,
        language: language,
        isOneStep: isOneStep,
        oneStepTranslation: oneStepDisplay,
        twoStepTranslation: twoStepDisplay,
        numberOfPhases: isOneStep ? 1 : 2
      });
      
      const currentAccountNumber = Date.now().toString();
      const purchasePriceNumber = parseCurrencyToNumber(price);
      const challengeAmountNumber = parseCurrencyToNumber(challengeAmount);

      // NUEVA LÓGICA: Procesar pago según el método seleccionado
      setProcessingStep(t('tradingChallenge_processing_payment', 'Procesando pago...'));
      
      let paymentData = null;
      let paymentUniqueId = '';
      
      if (selectedPaymentMethod === 'crypto') {
        try {
          // Generar página de pago con criptomonedas
          const cryptoPayment = await generateCryptoPayment(
            purchasePriceNumber,
            'USDT',  // Moneda predeterminada
            'Tron'   // Red predeterminada
          );
          
          paymentUniqueId = cryptoPayment.uniqueId;
          
          // Guardar referencia al pago en Firestore para seguimiento
          const paymentRef = {
            userId: currentUser.uid,
            uniqueId: paymentUniqueId,
            amount: purchasePriceNumber,
            currency: 'USDT',
            network: 'Tron',
            status: 'pending',
            createdAt: serverTimestamp(),
            expiresAt: cryptoPayment.expiresAt,
            challengeType: challengeTypeValue,
            challengeAmount: challengeAmount,
            paymentUrl: cryptoPayment.url
          };
          
          await addDoc(collection(db, 'cryptoPayments'), paymentRef);
          
          // Redirigir a la página de estado de pago
          navigate(`/payment-status/${paymentUniqueId}`);
          
          // Abrir la página de pago en una nueva ventana
          window.open(cryptoPayment.url, '_blank');
          
          return; // Detener la ejecución aquí, el resto se manejará cuando se confirme el pago
          
        } catch (error) {
          console.error("Error en el procesamiento del pago con criptomonedas:", error);
          alert(t('tradingChallenge_alert_paymentError', { error: error.message }));
          setIsPurchasing(false);
          setProcessingStep('');
          return; // Detener el proceso si hay error en el pago
        }
      } else {
        // Simulación de procesamiento de pago para tarjeta (mantener código existente)
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // El resto del código se mantiene igual para crear la cuenta MT5...
      setProcessingStep(t('tradingChallenge_processing_creatingAccount', 'Creando cuenta en MT5...'));
      
      // Datos para crear la cuenta en MT5
      const mt5AccountData = {
        name: currentUser.displayName || 'Trader',
        email: currentUser.email,
        leverage: 100,  // Apalancamiento por defecto
        deposit: challengeAmountNumber,  // Depósito inicial igual al tamaño del desafío
        challenge_type: challengeTypeValue,
        group: `challenge\\${isOneStep ? 'onestep' : 'twostep'}`,
        purchase_id: currentAccountNumber,
        phone: currentUser.phoneNumber || '',
      };
      
      // Llamar a la API de MT5Manager para crear la cuenta real
      let mt5Account = null;
      try {
        mt5Account = await createTradingAccount(mt5AccountData);
        setMt5AccountCreated(mt5Account);
        console.log("MT5 Account created successfully:", mt5Account);
        setApiStatus('success');
      } catch (error) {
        console.error("Error creating MT5 account:", error);
        setApiStatus('error');
        if (error.message) {
          alert(t('tradingChallenge_alert_mt5Error', { error: error.message }));
        }
      }

      // Guardar datos en Firebase (mantener código existente)
      const accountData = {
        userId: currentUser.uid,
        challengeType: challengeTypeValue,
        originalChallengeType: challengeType,
        accountType: challengeType.toLowerCase(),
        accountStyle: challengeType.toLowerCase(),
        challengePhase: challengePhaseValue,
        numberOfPhases: isOneStep ? 1 : 2,
        challengeAmountString: challengeAmount,
        challengeAmountNumber: challengeAmountNumber,
        selectedProfitTargetP1: selectedProfitTargetP1,
        selectedProfitTargetP2: selectedProfitTargetP2,
        selectedProfitSplit: selectedProfitSplit,
        priceString: price,
        priceNumber: purchasePriceNumber,
        status: 'Activa',
        createdAt: serverTimestamp(),
        serverType: 'MT5',
        accountNumber: currentAccountNumber,
        pnlToday: 0,
        pnl7Days: 0,
        pnl30Days: 0,
        balanceActual: challengeAmountNumber,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: 'completed', // Para pagos con tarjeta que se procesan inmediatamente
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
        // Datos del pago con criptomonedas (si aplica)
        ...(paymentData && {
          paymentUniqueId: paymentUniqueId,
          paymentTransactionHash: paymentData?.transactionHash,
          paymentCurrency: paymentData?.currency,
          paymentNetwork: paymentData?.network,
          paymentReceivedAmount: paymentData?.receivedAmount
        })
      };

      setProcessingStep(t('tradingChallenge_processing_savingData', 'Guardando datos...'));

      const docRef = await addDoc(collection(db, 'tradingAccounts'), accountData);
      console.log("Account created successfully:", docRef.id, accountData);

      // Registrar operación en el historial
      const operationData = {
        userId: currentUser.uid,
        timestamp: serverTimestamp(),
        status: 'Terminado',
        orderNumber: currentAccountNumber,
        operationType: 'Purchase Challenge',
        details: `${challengeAmount} ${challengeType}`,
        paymentMethod: selectedPaymentMethod === 'crypto' ? 'Criptomoneda' : 'Tarjeta',
        amount: purchasePriceNumber,
        currency: 'USD',
        relatedAccountId: docRef.id,
        mt5AccountCreated: !!mt5Account,
        ...(mt5Account && { mt5Login: mt5Account.login })
      };
      await addDoc(collection(db, 'operations'), operationData);

      setProcessingStep(t('tradingChallenge_processing_complete', '¡Compra completada!'));
      
      // Mostrar mensaje diferente según si se creó la cuenta MT5
      if (mt5Account) {
        alert(t('tradingChallenge_alert_purchaseSuccessWithMT5', { 
          accountId: docRef.id,
          login: mt5Account.login,
          password: mt5Account.password 
        }));
      } else {
        alert(t('tradingChallenge_alert_purchaseSuccess', { accountId: docRef.id }));
      }
    } catch (error) {
      console.error("Error al comprar el desafío: ", error);
      setApiStatus('error');
      alert(t('tradingChallenge_alert_purchaseError'));
    } finally {
      setIsPurchasing(false);
      setProcessingStep('');
    }
  };

  // Handler para aplicar cupón
  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'AGM20') {
      setAppliedCoupon('AGM20');
      setCouponError('');
    } else {
      setAppliedCoupon('');
      setCouponError('Cupón inválido');
    }
  };

  return (
    <div className="bg-[#232323] text-white min-h-screen">
      {/* Main Content Wrapper */}
      <div className="p-4 md:p-8 rounded-2xl border border-[#333]">
        {/* Back Button Placeholder */}
        {/* 
        <div className="mb-4">
          <button className="text-white bg-[#2c2c2c] rounded-full p-2 hover:bg-[#3a3a3a]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>
        */}

        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
          {/* Left Column */}
          <div className="lg:w-2/3 w-full p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-2xl border border-[#333]">
            {/* Tipo Desafío Section */}
            <div className="mb-6 md:mb-10">
              <div className="flex items-center mb-4">
                <h2 className="text-xl md:text-2xl font-medium flex-1">
                  {t('tradingChallenge_label_challengeType')}
                  <span className="text-sm text-gray-400 font-normal">
                    {challengeType === 'Estándar' 
                      ? t('tradingChallenge_leverage_info') 
                      : t('tradingChallenge_leverage_info_swing')}
                  </span>
                </h2>
              </div>
              <div className="flex space-x-3 md:space-x-4 mb-4 md:mb-6">
                <button 
                  className={`text-white px-6 py-2 rounded-full text-sm focus:outline-none bg-[#2c2c2c] border ${challengeType === 'Estándar' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeType('Estándar')}
                >
                  {t('tradingChallenge_button_standard', 'Estándar')}
                </button>
                <button 
                  className={`text-white px-6 py-2 rounded-full text-sm focus:outline-none bg-[#2c2c2c] border ${challengeType === 'Swing' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeType('Swing')}
                >
                  {t('tradingChallenge_button_swim', 'Swing')}
                </button>
              </div>
              
              {/* Monto del desafío Section */}
              <div className="flex items-center mb-3 md:mb-4">
                <h2 className="text-lg md:text-xl font-medium flex-1">{t('tradingChallenge_label_challengeAmount', 'Tamaño De Cuenta')}</h2>
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-2">
                <button 
                  className={`w-full px-3 py-3 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$5.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$5.000')}
                >
                  $5.000
                </button>
                <button 
                  className={`w-full px-3 py-3 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$10.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$10.000')}
                >
                  $10.000
                </button>
                <button 
                  className={`w-full px-3 py-3 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$25.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$25.000')}
                >
                  $25.000
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-10">
                <button 
                  className={`w-full px-3 py-3 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$50.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$50.000')}
                >
                  $50.000
                </button>
                <button 
                  className={`w-full px-3 py-3 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$100.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$100.000')}
                >
                  $100.000
                </button>
                <button 
                  className={`w-full px-3 py-3 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$200.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$200.000')}
                >
                  $200.000
                </button>
              </div>
              
              {/* Complementos Section */}
              <div className="mb-3">
                <div className="flex items-center mb-2">
                  <h2 className="text-xl md:text-2xl font-medium flex-1">{t('tradingChallenge_label_complements')}</h2>
                </div>
                <p className="text-white font-thin text-xs md:text-sm mb-4 md:mb-6">
                  {t('tradingChallenge_subtitle_complements', 'Selecciona complementos por tipo de trader')}
                </p>

                {/* Profit Target Fase 1 options - SIEMPRE HABILITADO */}
                <div className="mb-6 md:mb-8">
                  <h3 className="text-lg font-medium mb-3">
                    {t('tradingChallenge_label_profitTargetP1', 'Profit Target Fase 1')}
                  </h3>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {profitTargetP1Options.map(option => (
                      <button 
                        key={option.value}
                        className={`flex-1 text-center px-4 py-2 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] hover:bg-[#3a3a3a] ${selectedProfitTargetP1 === option.value ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                        onClick={() => setSelectedProfitTargetP1(option.value)}
                      >
                        <div className="font-medium">{option.text}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Profit Target Fase 2 options - SIEMPRE HABILITADO */}
                <div className="mb-6 md:mb-8">
                  <h3 className="text-lg font-medium mb-3">
                    {t('tradingChallenge_label_profitTargetP2', 'Profit Target Fase 2')}
                  </h3>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {profitTargetP2Options.map(option => (
                      <button
                        key={option.value}
                        className={`flex-1 text-center px-4 py-2 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] hover:bg-[#3a3a3a] ${selectedProfitTargetP2 === option.value ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                        onClick={() => setSelectedProfitTargetP2(option.value)}
                      >
                        <div className="font-medium">{option.text}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Profit Split options */}
                <div className="mb-6 md:mb-10">
                  <h3 className="text-lg font-medium mb-3">{t('tradingChallenge_label_profitSplit', 'Profit Split')}</h3>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {profitSplitOptions.map(option => (
                      <button
                        key={option.value}
                        className={`flex-1 text-center px-4 py-2 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] hover:bg-[#3a3a3a] ${selectedProfitSplit === option.value ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                        onClick={() => setSelectedProfitSplit(option.value)}
                      >
                        <div className="font-medium">{option.text}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Price, Platform, Currency Section */}
              <div className="space-y-3 text-base md:text-lg">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span>Precio base</span>
                    <span className="font-medium">${priceBreakdown.base}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ajuste Profit Target F1</span>
                    <span className="font-medium">{priceBreakdown.profitTargetF1 >= 0 ? '+' : ''}${priceBreakdown.profitTargetF1}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ajuste Profit Target F2</span>
                    <span className="font-medium">{priceBreakdown.profitTargetF2 >= 0 ? '+' : ''}${priceBreakdown.profitTargetF2}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ajuste Profit Split</span>
                    <span className="font-medium">{priceBreakdown.profitSplit >= 0 ? '+' : ''}${priceBreakdown.profitSplit}</span>
                  </div>
                  {priceBreakdown.discount > 0 && (
                    <div className="flex justify-between items-center text-green-400">
                      <span>Descuento AGM20 (20%)</span>
                      <span className="font-medium">- ${priceBreakdown.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-700 my-2"></div>
                  <div className="flex justify-between items-center text-lg">
                    <span>Total</span>
                    <span className="font-bold">${priceBreakdown.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-gray-700 pt-3 mt-3">
                  <span>{t('tradingChallenge_label_platform')}</span>
                  <span className="font-medium">Metatrader 5</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-700 pt-3 mt-3">
                  <span>{t('tradingChallenge_label_currency')}</span>
                  <span className="font-medium">{t('tradingChallenge_label_currencyUsd')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:w-1/3 w-full p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-2xl border border-[#333]">
            <div className="mb-6 md:mb-10">
              <h2 className="text-base md:text-lg font-medium mb-3">{t('tradingChallenge_label_promoCode')}</h2>
              <div className="flex space-x-2">
                <input
                  className="flex-1 bg-[#2c2c2c] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  placeholder={t('tradingChallenge_placeholder_enterCode')}
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                />
                <button className="border border-cyan-500 bg-[#2c2c2c] hover:bg-[#3a3a3a] text-white px-6 py-2 rounded-lg text-sm"
                  onClick={handleApplyCoupon}
                  type="button"
                >
                  {t('tradingChallenge_button_apply')}
                </button>
              </div>
              {couponError && <div className="text-red-500 text-xs mt-1">{couponError}</div>}
              {appliedCoupon === 'AGM20' && <div className="text-green-500 text-xs mt-1">Cupón AGM20 aplicado: 20% OFF</div>}
            </div>
            
            <div className="mb-6 md:mb-10">
              <h2 className="text-base md:text-lg font-medium mb-3">{t('tradingChallenge_label_paymentMethod')}</h2>
              <div className="relative">
                <select
                  className="w-full bg-[#2c2c2c] border border-gray-700 rounded-lg px-4 py-3 cursor-pointer hover:border-cyan-600 appearance-none text-sm focus:outline-none focus:border-cyan-500"
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                >
                  <option value="crypto">{t('paymentMethod_crypto')}</option>
                  <option value="card">{t('paymentMethod_card')}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
            
            <button 
              className="w-full bg-[#2c2c2c] border border-cyan-500 hover:bg-[#3a3a3a] text-white py-3 px-4 rounded-lg mb-3 text-sm font-medium disabled:opacity-50"
              onClick={handlePurchaseChallenge}
              disabled={isPurchasing}
            >
              {isPurchasing ? t('tradingChallenge_button_processing') : t('tradingChallenge_button_proceedToPayment')}
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              {t('tradingChallenge_disclaimer_acceptance')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}