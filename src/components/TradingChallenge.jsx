import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, HelpCircle, Info } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';
import { createTradingAccount } from '../services/mt5Service';
import PaymentService from '../services/PaymentService';

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
    '$5.000': 75,
    '$10.000': 130,
    '$25.000': 250,
    '$50.000': 350,
    '$100.000': 580,
    '$200.000': 1050,
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
    // Sin complementos, el precio es simplemente el precio base
    let subtotal = basePrice;
    let discountValue = 0;
    
    // Aquí se pueden agregar otros cupones en el futuro, pero no AGM20
    // if (appliedCoupon === 'OTRO_CUPON') {
    //   discountValue = subtotal * 0.1; // ejemplo
    // }
    
    const totalPrice = subtotal - discountValue;
    setPrice(`$${totalPrice.toFixed(2).replace('.', ',')}`);
    setPriceBreakdown({
      base: basePrice,
      profitTargetF1: 0,
      profitTargetF2: 0,
      profitSplit: 0,
      discount: discountValue,
      total: totalPrice
    });
  }, [challengeAmount, appliedCoupon]);

  // Enlaces de Stripe organizados por tamaño de cuenta y descuento
  const stripeLinks = {
    normal: {
      '$5.000': 'https://buy.stripe.com/dRmcN56YE0lR1Nz08f9sk0E',
      '$10.000': 'https://buy.stripe.com/8x24gzbeU8Sncsdg7d9sk0F',
      '$25.000': 'https://buy.stripe.com/fZuaEXer67Ojbo9g7d9sk0G',
      '$50.000': 'https://buy.stripe.com/bJefZh4Qw7OjgIt3kr9sk0H',
      '$100.000': 'https://buy.stripe.com/4gMdR93Ms6Kf1Nz1cj9sk0I',
      '$200.000': 'https://buy.stripe.com/14A8wP0Agd8D9g12gn9sk0J'
    },
    discount: {
      '$5.000': 'https://buy.stripe.com/bJefZh3Ms4C7gIt1cj9sk0y',
      '$10.000': 'https://buy.stripe.com/eVq4gz1Ek0lR8bX5sz9sk0z',
      '$25.000': 'https://buy.stripe.com/9B65kD6YE6Kf3VHg7d9sk0A',
      '$50.000': 'https://buy.stripe.com/fZudR93Msc4zcsd7AH9sk0B',
      '$100.000': 'https://buy.stripe.com/3cI5kD82I5Gb4ZL3kr9sk0C',
      '$200.000': 'https://buy.stripe.com/8x28wP1Ek5Gbak5aMT9sk0D'
    }
  };

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

  // Función para obtener el enlace de Stripe correcto
  const getStripeLink = (challengeAmount, hasDiscount) => {
    const linkCategory = hasDiscount ? 'discount' : 'normal';
    return stripeLinks[linkCategory][challengeAmount];
  };

  // Función para enviar email de confirmación
  const sendConfirmationEmail = async (userEmail, userName) => {
    try {
      console.log('📧 Enviando email de confirmación a:', userEmail);
      
      const emailData = {
        email: userEmail,
        type: 'mt5_credentials',
        username: userName || 'Usuario'
      };

      // Verificar si estamos en desarrollo
      const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
      
      if (isDevelopment) {
        // En desarrollo, simular el envío exitoso y mostrar el contenido del email
        console.log('🔧 MODO DESARROLLO - Simulando envío de email');
        console.log('📧 Destinatario:', userEmail);
        console.log('👤 Usuario:', userName);
        console.log('📝 Contenido del email:');
        console.log(`
=== EMAIL DE CONFIRMACIÓN ===
Para: ${userEmail}
Asunto: Credenciales de acceso a MetaTrader 5

Estimado ${userName}:

Una vez completada la compra de su cuenta, recibirá las credenciales de acceso en un plazo máximo de 12 horas.

Dichas credenciales estarán disponibles tanto en la sección de "Cuentas" dentro del área de cliente, como también se le enviarán directamente por correo electrónico.

Agradecemos su paciencia y le deseamos un excelente trading junto a Alpha Global Market.

Para cualquier duda o consulta, puede ponerse en contacto con nosotros a través de WhatsApp en el siguiente enlace:
👉 https://wa.me/971585260429
o escribiendo a: support@alphaglobalmarket.io

Atentamente,
Equipo de Alpha Global Market
=============================
        `);
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Email simulado enviado exitosamente en desarrollo');
        return true;
      }

      // En producción, usar el endpoint real
      try {
        const apiUrl = `${window.location.origin}/.netlify/functions/send-email`;
        
        console.log('🔗 URL del API:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData)
        });

        console.log('📡 Respuesta del servidor:', response.status, response.statusText);

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Email de confirmación enviado exitosamente:', result);
          return true;
        } else {
          const errorText = await response.text();
          console.error('❌ Error enviando email de confirmación:', response.status, errorText);
          return false;
        }
      } catch (fetchError) {
        console.error('❌ Error de red al enviar email:', fetchError);
        return false;
      }
    } catch (error) {
      console.error('❌ Error enviando email de confirmación:', error);
      return false;
    }
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
          // Usar el nuevo servicio integrado en lugar de la API externa
          const cryptoPayment = await PaymentService.generateCryptoPayment(
            purchasePriceNumber,
            'USDT',  // Moneda predeterminada
            'Tron',   // Red predeterminada
            currentUser.displayName || 'Usuario'
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
      } else if (selectedPaymentMethod === 'creditCard') {
        try {
          // NUEVO FLUJO PARA TARJETA DE CRÉDITO CON STRIPE
          console.log('💳 Procesando pago con tarjeta de crédito via Stripe');
          console.log('👤 Usuario actual:', currentUser);
          console.log('📧 Email del usuario:', currentUser?.email);
          console.log('🏷️ Nombre del usuario:', currentUser?.displayName);
          
          // Verificar si hay descuento aplicado (sin AGM20)
          const hasDiscount = priceBreakdown.discount > 0;
          
          // Obtener el enlace de Stripe correcto
          const stripeLink = getStripeLink(challengeAmount, hasDiscount);
          console.log('💵 Tamaño de cuenta:', challengeAmount);
          console.log('🔗 Enlace de Stripe seleccionado:', stripeLink);
          
          if (!stripeLink) {
            throw new Error('No se encontró enlace de pago para esta configuración');
          }
          
          console.log('📧 Iniciando envío de email de confirmación...');
          
          // Enviar email de confirmación ANTES de redirigir
          const emailSent = await sendConfirmationEmail(
            currentUser.email,
            currentUser.displayName || 'Usuario'
          );
          
          console.log('📬 Resultado del envío de email:', emailSent);
          
          // CREAR DOCUMENTO EN FIREBASE PARA TARJETA DE CRÉDITO
          console.log('💾 Creando documento de compra con tarjeta de crédito...');
          const creditCardPurchaseData = {
            userId: currentUser.uid,
            email: currentUser.email,
            userName: currentUser.displayName || 'Usuario',
            challengeAmount: challengeAmount,
            challengeAmountNumber: parseCurrencyToNumber(challengeAmount),
            challengeType: challengeType,
            challengeTypeValue: challengeTypeValue,
            priceTotal: priceBreakdown.total,
            priceString: `$${priceBreakdown.total.toFixed(2)}`,
            hasDiscount: hasDiscount,
            appliedCoupon: appliedCoupon || null,
            discountAmount: priceBreakdown.discount,
            stripeLink: stripeLink,
            paymentMethod: 'creditCard',
            status: 'pending_payment',
            createdAt: serverTimestamp(),
            purchaseId: Date.now().toString(),
            // Datos adicionales para seguimiento
            language: language,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          };
          
          try {
            const docRef = await addDoc(collection(db, 'creditCardPurchases'), creditCardPurchaseData);
            console.log('✅ Documento de compra creado con ID:', docRef.id);
            console.log('📄 Datos guardados:', creditCardPurchaseData);
          } catch (error) {
            console.error('❌ Error creando documento de compra:', error);
            // Continuar con el flujo aunque falle el guardado
          }
          
          if (emailSent) {
            console.log('✅ Email de confirmación enviado exitosamente');
          } else {
            console.warn('⚠️ No se pudo enviar el email de confirmación, pero continuamos con el pago');
          }
          
          // Pequeña pausa para que se vea el log del email
          console.log('⏳ Esperando 2 segundos antes de redirigir...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Redirigir a Stripe
          console.log('🚀 Redirigiendo a Stripe...');
          window.location.href = stripeLink;
          
          return; // Detener la ejecución aquí
          
        } catch (error) {
          console.error("Error en el procesamiento del pago con tarjeta:", error);
          alert(`Error al procesar el pago: ${error.message}`);
          setIsPurchasing(false);
          setProcessingStep('');
          return;
        }
      } else {
        // Simulación de procesamiento de pago para otros métodos (mantener código existente)
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

  // Handler para aplicar cupón (sin AGM20)
  const handleApplyCoupon = () => {
    const couponCode = coupon.trim().toUpperCase();
    
    // Aquí se pueden agregar otros cupones válidos en el futuro
    // Por ahora, no hay cupones válidos (AGM20 removido)
    if (couponCode === '') {
      setCouponError('Por favor ingresa un código');
      return;
    }
    
    // Ejemplo para futuros cupones:
    // if (couponCode === 'NUEVO_CUPON') {
    //   setAppliedCoupon('NUEVO_CUPON');
    //   setCouponError('');
    // } else {
    
    // Por ahora, todos los cupones son inválidos
    setAppliedCoupon('');
    setCouponError('Código de cupón inválido');
  };

  return (
    <div className="bg-[#232323] text-white h-full overflow-y-auto -webkit-overflow-scrolling-touch">
      {/* Main Content Wrapper */}
      <div className="p-2 sm:p-3 md:p-4 lg:p-8 rounded-2xl border border-[#333] max-w-full overflow-hidden">
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

        <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-8">
          {/* Left Column */}
          <div className="lg:w-2/3 w-full p-3 sm:p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-2xl border border-[#333] min-w-0">
            {/* Tipo Desafío Section */}
            <div className="mb-4 sm:mb-6 md:mb-10">
              <div className="flex items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-medium flex-1">
                  {t('tradingChallenge_label_challengeType')}
                  <span className="block sm:inline text-xs sm:text-sm text-gray-400 font-normal mt-1 sm:mt-0">
                    {challengeType === 'Estándar' 
                      ? t('tradingChallenge_leverage_info') 
                      : t('tradingChallenge_leverage_info_swing')}
                  </span>
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-4 mb-3 sm:mb-4 md:mb-6">
                <button 
                  className={`text-white px-4 sm:px-6 py-2 rounded-full text-sm focus:outline-none bg-[#2c2c2c] border ${challengeType === 'Estándar' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeType('Estándar')}
                >
                  {t('tradingChallenge_button_standard', 'Estándar')}
                </button>
                <button 
                  className={`text-white px-4 sm:px-6 py-2 rounded-full text-sm focus:outline-none bg-[#2c2c2c] border ${challengeType === 'Swing' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeType('Swing')}
                >
                  {t('tradingChallenge_button_swim', 'Swing')}
                </button>
              </div>
              
              {/* Monto del desafío Section */}
              <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
                <h2 className="text-base sm:text-lg md:text-xl font-medium flex-1">{t('tradingChallenge_label_challengeAmount', 'Tamaño De Cuenta')}</h2>
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-2">
                <button 
                  className={`w-full px-2 sm:px-3 py-2 sm:py-3 rounded-full text-xs sm:text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$5.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$5.000')}
                >
                  $5.000
                </button>
                <button 
                  className={`w-full px-2 sm:px-3 py-2 sm:py-3 rounded-full text-xs sm:text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$10.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$10.000')}
                >
                  $10.000
                </button>
                <button 
                  className={`w-full px-2 sm:px-3 py-2 sm:py-3 rounded-full text-xs sm:text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$25.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$25.000')}
                >
                  $25.000
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 sm:mb-6 md:mb-10">
                <button 
                  className={`w-full px-2 sm:px-3 py-2 sm:py-3 rounded-full text-xs sm:text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$50.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$50.000')}
                >
                  $50.000
                </button>
                <button 
                  className={`w-full px-2 sm:px-3 py-2 sm:py-3 rounded-full text-xs sm:text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$100.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$100.000')}
                >
                  $100.000
                </button>
                <button 
                  className={`w-full px-2 sm:px-3 py-2 sm:py-3 rounded-full text-xs sm:text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$200.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$200.000')}
                >
                  $200.000
                </button>
              </div>
              
              {/* Complementos Section - TEMPORALMENTE COMENTADO */}
              {/* 
              <div className="mb-3">
                <div className="flex items-center mb-2">
                  <h2 className="text-xl md:text-2xl font-medium flex-1">{t('tradingChallenge_label_complements')}</h2>
                </div>
                <p className="text-white font-thin text-xs md:text-sm mb-4 md:mb-6">
                  {t('tradingChallenge_subtitle_complements', 'Selecciona complementos por tipo de trader')}
                </p>

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
              */}
              
              {/* Price, Platform, Currency Section */}
              <div className="space-y-3 text-base md:text-lg">
                <div className="flex flex-col gap-1">
                  {/* Desglose detallado - TEMPORALMENTE COMENTADO */}
                  {/* 
                  <div className="flex justify-between items-center">
                    <span>{t('tradingChallenge_price_base')}</span>
                    <span className="font-medium">${priceBreakdown.base}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('tradingChallenge_price_adjust_f1')}</span>
                    <span className="font-medium">{priceBreakdown.profitTargetF1 >= 0 ? '+' : ''}${priceBreakdown.profitTargetF1}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('tradingChallenge_price_adjust_f2')}</span>
                    <span className="font-medium">{priceBreakdown.profitTargetF2 >= 0 ? '+' : ''}${priceBreakdown.profitTargetF2}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('tradingChallenge_price_adjust_split')}</span>
                    <span className="font-medium">{priceBreakdown.profitSplit >= 0 ? '+' : ''}${priceBreakdown.profitSplit}</span>
                  </div>
                  */}
                  
                  {/* Mostrar descuento si aplica (sin AGM20) */}
                  {priceBreakdown.discount > 0 && (
                    <div className="flex justify-between items-center text-green-400">
                      <span>Descuento aplicado</span>
                      <span className="font-medium">- ${priceBreakdown.discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Solo mostrar el total */}
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>{t('tradingChallenge_label_price')}</span>
                    <span>${priceBreakdown.total.toFixed(2)}</span>
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
          <div className="lg:w-1/3 w-full p-3 sm:p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-2xl border border-[#333] min-w-0 max-w-full">
            <div className="mb-4 sm:mb-6 md:mb-10">
              <h2 className="text-sm sm:text-base md:text-lg font-medium mb-2 sm:mb-3">{t('tradingChallenge_label_promoCode')}</h2>
              <div className="space-y-2">
                <input
                  className="w-full bg-[#2c2c2c] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  placeholder={t('tradingChallenge_placeholder_enterCode')}
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                />
                <button 
                  className="w-full border border-cyan-500 bg-[#2c2c2c] hover:bg-[#3a3a3a] text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  onClick={handleApplyCoupon}
                  type="button"
                >
                  {t('tradingChallenge_button_apply')}
                </button>
              </div>
              {couponError && <div className="text-red-500 text-xs mt-2">{couponError}</div>}
              {appliedCoupon && <div className="text-green-500 text-xs mt-2">Cupón aplicado: {appliedCoupon}</div>}
            </div>
            
            <div className="mb-4 sm:mb-6 md:mb-10">
              <h2 className="text-sm sm:text-base md:text-lg font-medium mb-2 sm:mb-3">{t('tradingChallenge_label_paymentMethod')}</h2>
              <div className="relative">
                <select
                  className="w-full bg-[#2c2c2c] border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:border-cyan-600 appearance-none text-sm focus:outline-none focus:border-cyan-500"
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                >
                  <option value="crypto">{t('paymentMethod_crypto')}</option>
                  <option value="creditCard">{t('paymentMethod_creditCard')}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
            
            <button 
              className="w-full bg-[#2c2c2c] border border-cyan-500 hover:bg-[#3a3a3a] text-white py-2.5 sm:py-3 px-4 rounded-lg mb-3 text-sm font-medium disabled:opacity-50"
              onClick={handlePurchaseChallenge}
              disabled={isPurchasing}
            >
              {isPurchasing ? t('tradingChallenge_button_processing') : t('tradingChallenge_button_proceedToPayment')}
            </button>
            
            {/* WhatsApp Info Box - Solo mostrar para criptomonedas */}
            {selectedPaymentMethod === 'crypto' && (
              <div className="bg-gradient-to-br from-[#232323] to-[#2b2b2b] border border-[#333] rounded-2xl p-3 sm:p-4 mb-3 flex flex-col items-center text-center w-full overflow-hidden">
                <p className="text-white text-xs sm:text-sm mb-2 sm:mb-3 px-1" dangerouslySetInnerHTML={{__html: t('tradingChallenge_whatsapp_text')}}>
                </p>
                <a
                  href="https://wa.me/+971585437140"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-gradient-to-r from-cyan-600 to-cyan-800 hover:from-cyan-700 hover:to-cyan-900 text-white font-semibold px-3 sm:px-6 py-2 rounded-full shadow transition-all text-xs sm:text-sm whitespace-nowrap"
                >
                  {t('tradingChallenge_whatsapp_button')}
                </a>
              </div>
            )}

            {/* Info Box para Tarjeta de Crédito */}
            {selectedPaymentMethod === 'creditCard' && (
              <div className="bg-gradient-to-br from-[#232323] to-[#2b2b2b] border border-[#333] rounded-2xl p-3 sm:p-4 mb-3 flex flex-col items-center text-center w-full overflow-hidden">
                <p className="text-white text-xs sm:text-sm mb-2 sm:mb-3 px-1">
                  Al proceder al pago, serás redirigido a <span className="font-semibold text-cyan-400">Stripe</span> para completar tu compra de forma segura.
                </p>
                <p className="text-gray-400 text-xs">
                  Recibirás un email con las instrucciones para acceder a tu cuenta MT5.
                </p>
              </div>
            )}
            
            <p className="text-xs text-gray-500 text-center">
              {t('tradingChallenge_disclaimer_acceptance')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}