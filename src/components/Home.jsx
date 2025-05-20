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
    // Print complete account data for debugging
    console.log("Account phase for display:", account.id, {
      phase: account.challengePhase,
      type: account.challengeType,
      numberOfPhases: account.numberOfPhases,
      allProperties: Object.keys(account)
    });
    
    // Check if account has a challengePhase - use it directly if it exists
    if (account.challengePhase) {
      console.log(`Using explicit challengePhase for ${account.id}:`, account.challengePhase);
      
      // Spanish formats
      if (account.challengePhase === '1 FASE' || 
          account.challengePhase === '2 FASES') {
        return account.challengePhase;
      }
      
      // English formats 
      if (account.challengePhase === 'ONE STEP' || 
          account.challengePhase === 'TWO STEPS') {
        return account.challengePhase;
      }
      
      // Legacy format with underscore
      if (account.challengePhase === 'ONE_STEP') {
        return t('home_account_oneStepLabel');
      }
      if (account.challengePhase === 'TWO_STEP') {
        return t('home_account_twoStepLabel');
      }

      // For any other value, try to determine from the content
      const phase = account.challengePhase.toLowerCase();
      if (phase.includes('two') || phase.includes('2')) {
        return t('home_account_twoStepLabel');
      }
      if (phase.includes('one') || phase.includes('1') || phase.includes('fase')) {
        return t('home_account_oneStepLabel');
      }
    } else {
      console.log(`No challengePhase for ${account.id}, falling back to challengeType:`, account.challengeType);
    }
    
    // Fall back to determining from challengeType (for accounts without challengePhase)
    if (account.challengeType === 'two_step' || account.challengeType === 'Swing') {
      return t('home_account_twoStepLabel');
    }
    if (account.challengeType === 'one_step' || account.challengeType === 'Estándar') {
      return t('home_account_oneStepLabel');
    }
    
    // Another fallback based on numberOfPhases if that exists
    if (account.numberOfPhases === 2) {
      console.log(`Using numberOfPhases fallback for ${account.id}:`, account.numberOfPhases);
      return t('home_account_twoStepLabel');
    }
    
    // Ultimate fallback - if no reliable info, default to ONE STEP (most common)
    console.log(`No reliable phase info for ${account.id}, defaulting to ONE STEP`);
    return t('home_account_oneStepLabel');
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
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const now = new Date();
    const dayName = days[now.getDay()];
    const dayOfMonth = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    return `${dayName}, ${dayOfMonth} de ${monthName} de ${year}`;
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

        <div className="mb-3 sm:mb-0">
        <h1 className="text-xl md:text-2xl font-semibold">{t('greeting')}, {getUserName()}</h1>
        <p className="text-sm md:text-base text-gray-400">{getCurrentFormattedDate()}</p>
      </div>
        <div className="flex items-center space-x-3 md:space-x-4 w-full sm:w-auto justify-end">
  <button 
    className="relative rounded-full bg-transparent focus:outline-none p-2 hover:ring-1 hover:ring-cyan-400 transition-all duration-200"
    onClick={toggleNotifications}
  >
    <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  </button>
  <button 
    className="relative rounded-full bg-transparent p-2 hover:ring-1 hover:ring-cyan-400 transition-all duration-200"
    style={{ outline: 'none' }}
    onClick={() => onSettingsClick && onSettingsClick()}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  </button>
  <div className="flex items-center space-x-2 relative">
    <button 
      onClick={toggleUserInfo}
      className="focus:outline-none bg-transparent p-1 hover:ring-1 hover:ring-cyan-400 rounded-full transition-all duration-200"
    >
      <img 
        src={currentUser?.photoURL || "/Perfil.png"} 
        alt="Avatar" 
        className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover" 
        onError={(e) => {
          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23555'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='white'%3ES%3C/text%3E%3C/svg%3E";
        }}
      />
    </button>
  </div>
  <div className="flex items-center space-x-1 md:space-x-2 relative">
    <button 
      onClick={toggleLanguageMenu}
      className="flex items-center space-x-1 focus:outline-none bg-transparent p-1 hover:ring-1 hover:ring-cyan-400 rounded-full transition-all duration-200"
    >
      <img 
        src={resolvedImagePath} 
        alt="Language" 
        className="w-6 h-6 md:w-8 md:h-8 rounded-full" 
        onError={(e) => {
          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23555'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='white'%3ES%3C/text%3E%3C/svg%3E";
        }}
      />
      <span className="text-sm md:text-base text-gray-300">{languageTextDisplay}</span>
    </button>
    
    {showLanguageMenu && (
      <div className="absolute top-full right-0 mt-2 bg-black bg-opacity-20 border-t border-cyan-500 rounded-md overflow-hidden z-20 min-w-[90px] fading-borders">
        <button 
          className="focus:outline-none flex items-center space-x-2 px-4 py-2 w-full text-left bg-transparent hover:ring-1 hover:border-cyan-400 transition-all duration-200"
          onClick={() => changeLanguage('es')}
        >
          <img src="/IdiomaES.png" className="w-6 h-6 rounded-full" alt="Spanish" />
          <span className="text-sm md:text-base text-white text-opacity-90">ES</span>
        </button>
        <button 
          className="focus:outline-none flex items-center space-x-2 px-4 py-2 w-full text-left bg-transparent hover:ring-1 hover:border-cyan-400 transition-all duration-200"
          onClick={() => changeLanguage('en')}
        >
          <img src="/IdiomaEN.png" className="w-6 h-6 rounded-full" alt="English" />
          <span className="text-sm md:text-base text-white text-opacity-90">EN</span>
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
          <h2 className="text-2xl md:text-4xl font-semibold mb-2 sm:mb-0">{t('yourAccountsTitle')}</h2>
          <button 
          className="text-white bg-[#232323] rounded-full py-1 md:py-2 px-3 md:px-4 text-base md:text-lg font-regular border border-gray-700 w-full sm:w-auto sm:min-w-24 hover:bg-gray-800 transition"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 flex-grow">
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
                <div key={account.id} className="bg-gradient-to-br from-[#232323] to-[#2d2d2d] p-5 rounded-3xl border border-[#333] flex flex-col h-[300px] md:h-[320px] max-w-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-xl md:text-2xl">
                      {getPhaseDisplayLabel(account)}<br />
                      {t('home_account_challengeLabel')} {displayAmount}
                    </h3>
                    <span className="text-gray-400 text-sm">#{account.accountNumber}</span>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-400 text-sm">Balance Actual</p>
                    <p className="text-2xl font-medium">{formatBalance(amount)}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-6">
                    <div>
                      <p className="text-gray-400">PNL Hoy</p>
                      <p className={`${(account.pnlToday || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(account.pnlToday || 0) >= 0 ? '+' : ''}{((account.pnlToday || 0) / (amount || 1) * 100).toFixed(2)}%<br />
                        {(account.pnlToday || 0) >= 0 ? '+' : ''}{formatBalance(account.pnlToday || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">PNL 7 días</p>
                      <p className={`${(account.pnl7Days || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(account.pnl7Days || 0) >= 0 ? '+' : ''}{((account.pnl7Days || 0) / (amount || 1) * 100).toFixed(2)}%<br />
                        {(account.pnl7Days || 0) >= 0 ? '+' : ''}{formatBalance(account.pnl7Days || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">PNL 30 días</p>
                      <p className={`${(account.pnl30Days || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(account.pnl30Days || 0) >= 0 ? '+' : ''}{((account.pnl30Days || 0) / (amount || 1) * 100).toFixed(2)}%<br />
                        {(account.pnl30Days || 0) >= 0 ? '+' : ''}{formatBalance(account.pnl30Days || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button 
                      className="border border-cyan-500 border-opacity-50 text-white py-1.5 px-6 rounded-full hover:bg-gray-800 transition text-sm"
                      style={{ outline: 'none' }}
                      onClick={() => {
                        onViewDetails && onViewDetails(account.id);
                      }}
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              );
            })}
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