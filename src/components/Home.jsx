import React, { useState, useEffect } from 'react';
import Settings from './Settings';
import UserInformationContent from './UserInformationContent';
import NotificationsModal from './NotificationsModal';
import { ChevronDown, Calendar, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Importar el contexto de autenticación
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { getTranslator } from '../utils/i18n'; // Import the new getTranslator

// Constants for standardizing phase values across the application
const PHASE_ONE_STEP = 'ONE_STEP';
const PHASE_TWO_STEP = 'TWO_STEP';

const fondoTarjetaUrl = "/fondoTarjeta2.png";


const Home = ({ onViewDetails, onSettingsClick, setSelectedOption }) => {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { currentUser, language, setLanguage } = useAuth();
  const [dashboardAccounts, setDashboardAccounts] = useState([]);
  const [isLoadingDashboardAccounts, setIsLoadingDashboardAccounts] = useState(true);

  const t = getTranslator(language); // Get the translator function for the current language

  // Simple helper function to determine if an account is one_step or two_step
  const getAccountPhaseType = (account) => {
    // Check existing properties in order of reliability
    if (account.challengeType === 'one_step' || account.challengeType === 'Estándar') 
      return 'one_step';
    if (account.challengeType === 'two_step' || account.challengeType === 'Swing') 
      return 'two_step';
    
    // Handle older accounts with challengePhase
    if (account.challengePhase) {
      const phase = account.challengePhase.toLowerCase();
      if (phase.includes('one') || phase.includes('1') || phase.includes('fase'))
        return 'one_step';
      if (phase.includes('two') || phase.includes('2'))
        return 'two_step';
    }
    
    // Default fallback based on numberOfPhases
    return account.numberOfPhases === 2 ? 'two_step' : 'one_step';
  };

  // Helper to get display phase label for UI 
  const getPhaseDisplayLabel = (account) => {
    const amount = getChallengeAmount(account);
    const formattedAmount = amount >= 1000 ? `${amount/1000}K` : amount;
    
    // Check if account has a challengePhase - use it directly if it exists
    if (account.challengePhase) {
      console.log(`Using explicit challengePhase for ${account.id}:`, account.challengePhase);
      
      // Spanish formats
      if (account.challengePhase === '1 FASE' || account.challengePhase === 'ONE STEP' || account.challengePhase === 'ONE_STEP' ||
          (account.challengeType === 'one_step' || account.challengeType === 'Estándar')) {
        return `AGM Account Fase 1 ${formattedAmount}`;
      }
      if (account.challengePhase === '2 FASES' || account.challengePhase === 'TWO STEPS' || account.challengePhase === 'TWO_STEP' ||
          (account.challengeType === 'two_step' || account.challengeType === 'Swing')) {
        return `AGM Account Swing ${formattedAmount}`;
      }
    }
    
    // Fall back to determining from challengeType (for accounts without challengePhase)
    if (account.challengeType === 'two_step' || account.challengeType === 'Swing') {
      return `AGM Account Swing ${formattedAmount}`;
    }
    if (account.challengeType === 'one_step' || account.challengeType === 'Estándar') {
      return `AGM Account Fase 1 ${formattedAmount}`;
    }
    
    // Another fallback based on numberOfPhases if that exists
    if (account.numberOfPhases === 2) {
      return `AGM Account Swing ${formattedAmount}`;
    }
    
    // Ultimate fallback - if no reliable info, default to ONE STEP (most common)
    return `AGM Account Fase 1 ${formattedAmount}`;
  };

  // useEffect for fetching dashboard accounts MUST be called before any conditional returns
  useEffect(() => {
    if (!currentUser) {
      setDashboardAccounts([]);
      setIsLoadingDashboardAccounts(false);
      return; // This early return inside useEffect is fine
    }

    setIsLoadingDashboardAccounts(true);
    const q = query(
      collection(db, 'tradingAccounts'), 
      where('userId', '==', currentUser.uid),
      // where('status', '==', 'Activa'), // You might want to filter by status
      orderBy('createdAt', 'desc'),
      limit(3) // Show up to 3 accounts on the dashboard
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const accountsData = [];
      querySnapshot.forEach((doc) => {
        accountsData.push({ id: doc.id, ...doc.data() });
      });
      setDashboardAccounts(accountsData);
      setIsLoadingDashboardAccounts(false);
    }, (error) => {
      console.error("Error fetching dashboard accounts: ", error);
      setIsLoadingDashboardAccounts(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [currentUser]);

  const getCurrentFormattedDate = () => {
    const dayKeys = ["day_domingo", "day_lunes", "day_martes", "day_miercoles", "day_jueves", "day_viernes", "day_sabado"];
    const monthKeys = ["month_enero", "month_febrero", "month_marzo", "month_abril", "month_mayo", "month_junio", "month_julio", "month_agosto", "month_septiembre", "month_octubre", "month_noviembre", "month_diciembre"];
    
    const now = new Date();
    const dayName = t(dayKeys[now.getDay()]);
    const dayOfMonth = now.getDate();
    const monthName = t(monthKeys[now.getMonth()]);
    const year = now.getFullYear();
    
    // For English, we don't need the "de" prepositions
    if (language === 'en') {
      return `${dayName}, ${monthName} ${dayOfMonth}, ${year}`;
    } else {
      return `${dayName}, ${dayOfMonth} de ${monthName} de ${year}`;
    }
  };

  const getUserName = () => {
    if (currentUser && currentUser.displayName) {
      return currentUser.displayName.split(' ')[0]; // Obtener solo el primer nombre
    } else if (currentUser && currentUser.email) {
      // Si no hay displayName, usar la primera parte del email
      return currentUser.email.split('@')[0];
    }
    return 'Usuario'; // Valor por defecto
  };

  const toggleLanguageMenu = () => {
    setShowLanguageMenu(!showLanguageMenu);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setShowLanguageMenu(false);
  };
  
  const toggleUserInfo = () => {
    setShowUserInfo(!showUserInfo);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Handle going back from user information
  const handleBackFromUserInfo = () => {
    setShowUserInfo(false);
  };

  // Conditional return for UserInformationContent is now AFTER all top-level hooks
  if (showUserInfo) {
    return (
      <UserInformationContent onBack={handleBackFromUserInfo} />
    );
  }

  // Helper to format PNL values (example)
  const formatPnl = (value, isPercentage = false) => {
    if (typeof value !== 'number') return isPercentage ? '0.00%' : '$0.00';
    const fixedValue = value.toFixed(2);
    return isPercentage ? `${fixedValue}%` : `$${fixedValue}`;
  };

  const formatBalance = (value) => {
    if (typeof value !== 'number') return '$0,000.00';
    
    // Verificamos si el valor debería ser tratado como miles
    // Si el desafío es por montos grandes (típicamente $5000+) pero el balance es mucho menor
    // es probable que el valor esté en miles y necesite ser corregido
    // Por ejemplo, $200 para un desafío de $200.000 debería mostrarse como $200,000.00
    console.log(`Formatting balance value: ${value}`);
    
    // Si el valor es demasiado pequeño para ser un saldo real de trading, multiplicamos por 1000
    // Típicamente los saldos reales deberían estar en miles o decenas de miles
    if (value > 0 && value < 1000) {
      value = value * 1000;
      console.log(`Adjusted balance value to: ${value}`);
    }
    
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper para obtener el monto del desafío en el formato correcto
  const getChallengeAmount = (account) => {
    const amount = account.challengeAmountNumber;
    
    // Si el valor es demasiado pequeño (< 1000) pero la cadena sugiere un valor mayor
    // Esto ocurre cuando, por ejemplo, "$200.000" se convierte incorrectamente a 200
    if (amount < 1000 && account.challengeAmountString) {
      const stringAmount = account.challengeAmountString;
      if (stringAmount.includes('.')) {
        // Intenta corregir el valor basado en la cadena original
        const correctedAmount = parseFloat(stringAmount.replace(/[$\s]/g, '').replace(/\./g, '').replace(/,/g, '.'));
        if (!isNaN(correctedAmount) && correctedAmount > amount) {
          console.log(`Corrected challenge amount from ${amount} to ${correctedAmount}`);
          return correctedAmount;
        }
      }
    }
    
    // Si después de los intentos anteriores el monto sigue siendo pequeño (menor a 1000),
    // asumimos que está en miles y multiplicamos por 1000
    if (amount > 0 && amount < 1000) {
      const scaledAmount = amount * 1000;
      console.log(`Scaled up challenge amount from ${amount} to ${scaledAmount}`);
      return scaledAmount;
    }
    
    return amount;
  };

  console.log('[Home.jsx] Rendering with language:', language);

  const resolvedImagePath = `/Idioma${language.toUpperCase()}.png`;
  const languageTextDisplay = language.toUpperCase();
  console.log('[Home.jsx] Image path to render:', resolvedImagePath);
  console.log('[Home.jsx] Text to render:', languageTextDisplay);

  return (
    <div className="p-4 md:p-6 bg-[#232323] border border-[#333] rounded-3xl text-white min-h-screen flex flex-col">
      {/* Header con saludo y fecha */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-br from-[#232323] to-[#202020] border border-[#333] rounded-xl relative">
        <div className="absolute inset-0 border-solid border-t-2 border-l border-r border-cyan-300 border-opacity-50 rounded-xl"></div>

        <div className="mb-3 sm:mb-0 w-full sm:w-auto">
        <h1 className="text-xl md:text-2xl font-semibold">{t('greeting')}, {getUserName()}</h1>
        <p className="text-sm md:text-base text-gray-400">{getCurrentFormattedDate()}</p>
      </div>
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 w-full sm:w-auto justify-end mt-2 sm:mt-0">
          {/* Botón de notificaciones oculto temporalmente
  <button 
    className="relative rounded-full bg-transparent focus:outline-none p-1.5 sm:p-2 hover:ring-1 hover:ring-cyan-400 transition-all duration-200"
    onClick={toggleNotifications}
  >
    <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  </button>
          */}
  <button 
    className="relative rounded-full bg-transparent p-1.5 sm:p-2 hover:ring-1 hover:ring-cyan-400 transition-all duration-200"
    style={{ outline: 'none' }}
    onClick={() => onSettingsClick && onSettingsClick()}
  >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  </button>
  <div className="flex items-center space-x-2 relative">
    <button 
      onClick={toggleUserInfo}
              className="focus:outline-none bg-transparent p-1.5 sm:p-2 hover:ring-1 hover:ring-cyan-400 rounded-full transition-all duration-200"
    >
      <img 
        src={currentUser?.photoURL || "/Perfil.png"} 
        alt="Avatar" 
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full object-cover" 
        onError={(e) => {
          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23555'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='white'%3ES%3C/text%3E%3C/svg%3E";
        }}
      />
    </button>
  </div>
  <div className="flex items-center space-x-1 md:space-x-2 relative">
    <button 
      onClick={toggleLanguageMenu}
              className="flex items-center space-x-1 focus:outline-none bg-transparent p-1.5 sm:p-2 hover:ring-1 hover:ring-cyan-400 rounded-full transition-all duration-200"
    >
      <img 
        src={resolvedImagePath} 
        alt="Language" 
        className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full" 
        onError={(e) => {
          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23555'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='white'%3ES%3C/text%3E%3C/svg%3E";
        }}
      />
      <span className="text-xs sm:text-sm md:text-base text-gray-300">{languageTextDisplay}</span>
    </button>
    
    {showLanguageMenu && (
      <div className="absolute top-full right-0 mt-2 bg-black bg-opacity-20 border-t border-cyan-500 rounded-md overflow-hidden z-20 min-w-[90px] fading-borders">
        <button 
          className="focus:outline-none flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 w-full text-left bg-transparent hover:ring-1 hover:border-cyan-400 transition-all duration-200"
          onClick={() => changeLanguage('es')}
        >
          <img src="/IdiomaES.png" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" alt="Spanish" />
          <span className="text-xs sm:text-sm md:text-base text-white text-opacity-90">ES</span>
        </button>
        <button 
          className="focus:outline-none flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 w-full text-left bg-transparent hover:ring-1 hover:border-cyan-400 transition-all duration-200"
          onClick={() => changeLanguage('en')}
        >
          <img src="/IdiomaEN.png" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" alt="English" />
          <span className="text-xs sm:text-sm md:text-base text-white text-opacity-90">EN</span>
        </button>
      </div>
    )}
  </div>
</div>
      </div>

      {/* Tarjeta principal con fondo de imagen */}
      <div 
        className="mb-4 md:mb-6 p-4 md:p-6 rounded-2xl relative h-auto md:h-[430px] flex flex-col justify-center border-solid border-t-2 border-l border-r border-cyan-300 border-opacity-50"
      >
        <div 
          className="absolute inset-0 rounded-md"
          style={{ 
            backgroundImage: `url(${fondoTarjetaUrl})`,
            backgroundSize: '95%',
            backgroundPositionY: '-80px',
            backgroundPositionX: 'right',
            backgroundPosition: 'right',
            backgroundRepeat: 'no-repeat',
            opacity: 0.3,
            zIndex: 0
          }}
        ></div>
        <div className="max-w-lg relative z-10 py-8 md:py-0">
          <h2 className="text-xl md:text-5xl font-base mb-3 md:mb-4">{t('pageTitle')}</h2>
          <p className="text-regular md:text-2xl mb-4 md:mb-6">{t('pageSubtitle')}</p>
          <button 
          className="bg-gradient-to-r from-[#0F7490] to-[#0A5A72] text-white py-2 px-4 md:px-6 rounded-md hover:opacity-90 transition"
          style={{ outline: 'none' }}
          onClick={() => setSelectedOption && setSelectedOption("Desafio")}
        >
          {t('startButton')}
        </button>
        </div>
      </div>
      
      {/* Sección de cuentas */}
      <div className="mb-4 md:mb-6 border border-[#333] p-3 md:p-4 rounded-xl flex-grow flex flex-col bg-gradient-to-br from-[#232323] to-[#202020]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-semibold mb-2 sm:mb-0">{t('yourAccountsTitle')}</h2>
          <button 
          className="text-white bg-[#232323] rounded-full py-1.5 md:py-2 px-3 md:px-4 text-sm sm:text-base md:text-lg font-regular border border-gray-700 w-full sm:w-auto sm:min-w-24 hover:bg-gray-800 transition"
          style={{ outline: 'none' }}
          onClick={() => setSelectedOption && setSelectedOption("Cuentas")}>
            {t('seeAllButton')}
          </button>
        </div>
        
        {/* Tarjetas de cuentas */}
        {isLoadingDashboardAccounts && <p className="text-center py-4">Cargando cuentas del dashboard...</p>}
        {!isLoadingDashboardAccounts && dashboardAccounts.length === 0 && (
          <p className="text-center py-4">No tienes cuentas activas para mostrar en el dashboard.</p>
        )}
        {console.log('[Home.jsx] Dashboard Accounts Data:', dashboardAccounts)}
        {!isLoadingDashboardAccounts && dashboardAccounts.length > 0 && (
          <div className="w-full flex justify-start pr-4 sm:pr-8">
            <div className="flex gap-4 sm:gap-8 lg:gap-20 w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300">
            {dashboardAccounts.map((account) => {
              const amount = getChallengeAmount(account);
              let displayAmount;
              if (typeof amount === 'number' && !isNaN(amount)) {
                displayAmount = amount.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                });
              } else {
                displayAmount = t('home_account_amountNotAvailable');
              }

              return (
                <div key={account.id} className="relative bg-gradient-to-br from-[rgba(34,34,34,0.5)] to-[rgba(53,53,53,0.5)] border border-[#373737] rounded-[30px] sm:rounded-[30px] flex-shrink-0 w-[280px] sm:w-[350px] lg:w-[452px] h-[240px] sm:h-[280px] lg:h-[320px]">
                  
                  {/* Título Principal */}
                  <div className="absolute left-[16px] sm:left-[20px] top-[16px] sm:top-[22px] w-[200px] sm:w-[250px] lg:w-[270px] h-[45px] sm:h-[55px] lg:h-[60px] overflow-hidden">
                    <h3 className="font-['Poppins'] font-semibold text-[18px] sm:text-[22px] lg:text-[28px] leading-[20px] sm:leading-[26px] lg:leading-[32px] text-white uppercase flex items-start break-words">
                      {getPhaseDisplayLabel(account)}
                    </h3>
                  </div>

                  {/* Badge del número de cuenta */}
                  <div className="absolute right-[16px] sm:right-[20px] lg:left-[312px] top-[38px] sm:top-[70px] lg:top-[25px] w-[80px] sm:w-[110px] lg:w-[121px] h-[28px] sm:h-[42px] lg:h-[48px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[rgba(31,31,31,0.2)] to-[rgba(35,35,35,0.2)] border border-[rgba(255,255,255,0.2)] rounded-[40px]"></div>
                    <div className="absolute left-[8px] sm:left-[12px] lg:left-[14px] top-[6px] sm:top-[14px] lg:top-[17px] w-[64px] sm:w-[86px] lg:w-[93px] h-[16px] sm:h-[12px] lg:h-[14px] flex items-center justify-center">
                      <span className="font-['Poppins'] font-normal text-[10px] sm:text-[12px] lg:text-[16px] leading-[12px] sm:leading-[18px] lg:leading-[20px] text-white text-center truncate">
                        #{account.accountNumber || account.login || '657237'}
                      </span>
                    </div>
                  </div>

                  {/* Balance Actual Label */}
                  <div className="absolute left-[16px] sm:left-[20px] top-[65px] sm:top-[75px] lg:top-[90px] w-[140px] sm:w-[150px] lg:w-[162px] h-[24px] sm:h-[28px] lg:h-[32px]">
                    <p className="font-['Poppins'] font-normal text-[14px] sm:text-[16px] lg:text-[20px] leading-[28px] sm:leading-[35px] lg:leading-[40px] text-[rgba(255,255,255,0.5)] flex items-center">
                      Balance Actual
                    </p>
                  </div>

                  {/* Balance Amount */}
                  <div className="absolute left-[16px] sm:left-[20px] top-[85px] sm:top-[100px] lg:top-[120px] w-[180px] sm:w-[190px] lg:w-[200px] h-[32px] sm:h-[36px] lg:h-[42px]">
                    <p className="font-['Poppins'] font-normal text-[20px] sm:text-[24px] lg:text-[28px] leading-[26px] sm:text-[30px] lg:leading-[36px] text-white flex items-center">
                      {formatBalance(account.currentBalance ?? amount)}
                    </p>
                  </div>

                  {/* PNL Section */}
                  <div className="absolute left-[16px] sm:left-[20px] top-[120px] sm:top-[140px] lg:top-[164px] w-[250px] sm:w-[320px] lg:w-[411px] h-[70px] sm:h-[80px] lg:h-[90px] flex flex-row items-center gap-[4px] sm:gap-[6px] lg:gap-[8px]">
                    
                    {/* PNL Hoy */}
                    <div className="flex flex-col items-start w-[80px] sm:w-[100px] lg:w-[130px] h-[70px] sm:h-[80px] lg:h-[90px]">
                      <div className="w-full h-[20px] sm:h-[24px] lg:h-[28px] font-['Poppins'] font-normal text-[12px] sm:text-[14px] lg:text-[18px] leading-[20px] sm:leading-[24px] lg:leading-[28px] text-[rgba(255,255,255,0.5)] flex items-center">
                        PNL Hoy
                      </div>
                      <div className={`w-full h-[20px] sm:h-[24px] lg:h-[28px] font-['Poppins'] font-normal text-[12px] sm:text-[14px] lg:text-[18px] leading-[20px] sm:leading-[24px] lg:leading-[28px] text-white flex items-center ${(account.pnlToday || 0) >= 0 ? 'text-white' : 'text-white'}`}>
                        {(account.pnlToday || 0) >= 0 ? '+' : ''}{((account.pnlToday || 0) / (amount || 1) * 100).toFixed(2)}%
                      </div>
                      <div className={`w-full h-[20px] sm:h-[24px] lg:h-[28px] font-['Poppins'] font-normal text-[10px] sm:text-[12px] lg:text-[16px] leading-[20px] sm:leading-[24px] lg:leading-[28px] text-white flex items-center ${(account.pnlToday || 0) >= 0 ? 'text-white' : 'text-white'}`}>
                        {(account.pnlToday || 0) >= 0 ? '+' : ''}{formatBalance(account.pnlToday || 0)}
                      </div>
                    </div>

                    {/* PNL 7 días */}
                    <div className="flex flex-col items-start w-[80px] sm:w-[100px] lg:w-[130px] h-[70px] sm:h-[80px] lg:h-[90px]">
                      <div className="w-full h-[20px] sm:h-[24px] lg:h-[28px] font-['Poppins'] font-normal text-[12px] sm:text-[14px] lg:text-[18px] leading-[20px] sm:leading-[24px] lg:leading-[28px] text-[rgba(255,255,255,0.5)] flex items-center">
                        PNL 7 días
                      </div>
                      <div className={`w-full h-[20px] sm:h-[24px] lg:h-[28px] font-['Poppins'] font-normal text-[12px] sm:text-[14px] lg:text-[18px] leading-[20px] sm:leading-[24px] lg:leading-[28px] text-white flex items-center ${(account.pnl7Days || 0) >= 0 ? 'text-white' : 'text-white'}`}>
                        {(account.pnl7Days || 0) >= 0 ? '+' : ''}{((account.pnl7Days || 0) / (amount || 1) * 100).toFixed(2)}%
                      </div>
                      <div className={`w-full h-[20px] sm:h-[24px] lg:h-[28px] font-['Poppins'] font-normal text-[10px] sm:text-[12px] lg:text-[16px] leading-[20px] sm:leading-[24px] lg:leading-[28px] text-white flex items-center ${(account.pnl7Days || 0) >= 0 ? 'text-white' : 'text-white'}`}>
                        {(account.pnl7Days || 0) >= 0 ? '+' : ''}{formatBalance(account.pnl7Days || 0)}
                      </div>
                    </div>

                    {/* PNL 30 días */}
                    <div className="flex flex-col items-start w-[80px] sm:w-[100px] lg:w-[130px] h-[70px] sm:h-[80px] lg:h-[90px]">
                      <div className="w-full h-[20px] sm:h-[24px] lg:h-[28px] font-['Poppins'] font-normal text-[12px] sm:text-[14px] lg:text-[18px] leading-[20px] sm:leading-[24px] lg:leading-[28px] text-[rgba(255,255,255,0.5)] flex items-center">
                        PNL 30 días
                      </div>
                      <div className={`w-full h-[20px] sm:h-[24px] lg:h-[28px] font-['Poppins'] font-normal text-[12px] sm:text-[14px] lg:text-[18px] leading-[20px] sm:leading-[24px] lg:leading-[28px] text-white flex items-center ${(account.pnl30Days || 0) >= 0 ? 'text-white' : 'text-white'}`}>
                        {(account.pnl30Days || 0) >= 0 ? '+' : ''}{((account.pnl30Days || 0) / (amount || 1) * 100).toFixed(2)}%
                      </div>
                      <div className={`w-full h-[20px] sm:h-[24px] lg:h-[28px] font-['Poppins'] font-normal text-[10px] sm:text-[12px] lg:text-[16px] leading-[20px] sm:leading-[24px] lg:leading-[28px] text-white flex items-center ${(account.pnl30Days || 0) >= 0 ? 'text-white' : 'text-white'}`}>
                        {(account.pnl30Days || 0) >= 0 ? '+' : ''}{formatBalance(account.pnl30Days || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Botón Ver Detalles */}
                  <div className="absolute left-[50%] transform -translate-x-1/2 sm:left-[80px] lg:left-[106px] sm:transform-none bottom-[16px] sm:bottom-[20px] lg:top-[267px] w-[180px] sm:w-[200px] lg:w-[240px] h-[32px] sm:h-[36px] lg:h-[42px]">
                    <button 
                      className="w-full h-full bg-gradient-to-br from-[#1F1F1F] to-[#232323] border border-[#1CC4F9] rounded-[40px] flex items-center justify-center hover:opacity-90 transition"
                      style={{ outline: 'none' }}
                      onClick={() => {
                        onViewDetails && onViewDetails(account.id);
                      }}
                    >
                      <span className="font-['Poppins'] font-normal text-[14px] sm:text-[16px] lg:text-[20px] leading-[20px] sm:leading-[24px] lg:leading-[30px] text-white capitalize">
                      Ver Detalles
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </div>
      {showNotifications && (
  <NotificationsModal onClose={() => setShowNotifications(false)} />
)}
    </div>
  );
};

export default Home;