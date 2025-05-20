import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useAuth } from '../contexts/AuthContext'; // Importar el contexto de autenticación
import { getTranslator } from '../utils/i18n'; // Added
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Helper function to format the date
const formatDate = (date, locale, t) => {
  const days = [
    t('date_short_sunday'), 
    t('date_short_monday'), 
    t('date_short_tuesday'), 
    t('date_short_wednesday'), 
    t('date_short_thursday'), 
    t('date_short_friday'), 
    t('date_short_saturday')
  ];
  const months = [
    t('month_january'), 
    t('month_february'), 
    t('month_march'), 
    t('month_april'), 
    t('month_may'), 
    t('month_june'), 
    t('month_july'), 
    t('month_august'), 
    t('month_september'), 
    t('month_october'), 
    t('month_november'), 
    t('month_december')
  ];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  return `${dayName}, ${date.getDate()} ${monthName}`;
};

const TradingDashboard = ({ accountId, onBack, previousSection }) => {
  // Obtener información del usuario desde Firebase
  const { currentUser, language } = useAuth();
  const t = getTranslator(language); // Added
  const [currentDate, setCurrentDate] = useState('');
  const [drawdownType, setDrawdownType] = useState('daily'); // 'daily' or 'total'
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [balanceData, setBalanceData] = useState([]);
  const [operationsData, setOperationsData] = useState([]);

  useEffect(() => {
    const today = new Date();
    setCurrentDate(formatDate(today, language, t));
  }, [language, t]);

  // Fetch account data from Firebase
  useEffect(() => {
    if (!accountId) {
      setIsLoading(false);
      return;
    }

    const fetchAccountData = async () => {
      setIsLoading(true);
      try {
        // Get main account document
        const accountDocRef = doc(db, 'tradingAccounts', accountId);
        const accountDocSnap = await getDoc(accountDocRef);
        
        if (accountDocSnap.exists()) {
          const accountData = { id: accountDocSnap.id, ...accountDocSnap.data() };
          console.log("Fetched account data:", accountData);
          setAccount(accountData);
          
          // Fetch operations for this account
          const operationsQuery = query(
            collection(db, 'operations'), 
            where('accountId', '==', accountId)
          );
          
          const operationsSnapshot = await getDocs(operationsQuery);
          const operations = [];
          
          operationsSnapshot.forEach(doc => {
            operations.push({ id: doc.id, ...doc.data() });
          });
          
          console.log("Fetched operations:", operations);
          setOperationsData(operations);
          
          // Generate balance history data (if you have historical data in Firestore)
          // For now, we'll use placeholder data that could be replaced with real data if available
          // This would typically come from a separate collection like 'accountHistory'
          generateBalanceData(accountData);
        } else {
          console.error("Account document not found");
        }
      } catch (error) {
        console.error("Error fetching account data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountData();
  }, [accountId]);

  // Generate placeholder balance data (replace with real data when available)
  const generateBalanceData = (account) => {
    // This would be replaced with real balance history data from Firestore
    // For now, create simulated data based on the current balance
    const initialBalance = account.challengeAmountNumber || 100000;
    const currentBalance = account.balance || initialBalance;
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep"];
    
    // Create a growth trend from initial to current balance
    const data = months.map((month, index) => {
      const progress = index / (months.length - 1);
      // Add some randomness for realism
      const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
      const value = initialBalance + (currentBalance - initialBalance) * progress * randomFactor;
      return { name: month, value: Math.round(value) };
    });
    
    setBalanceData(data);
  };

  // Helper functions for formatting values
  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '$0.00';
    }
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPercentage = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00%';
    }
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Get the challenge amount in the correct format
  const getChallengeAmount = (account) => {
    if (!account) return 0;
    
    let amount = account.challengeAmountNumber;
    
    // Handle missing or invalid amount
    if (typeof amount !== 'number' || isNaN(amount)) {
      if (account.challengeAmountString) {
        try {
          // Using the parsing logic from TradingChallenge.jsx for consistency
          let valueString = account.challengeAmountString.replace(/[$\\s]/g, '');
          valueString = valueString.replace(/\\./g, '').replace(/,/g, '.');
          
          amount = parseFloat(valueString);
          if (isNaN(amount)) {
            return 0;
          }
        } catch (e) {
          return 0;
        }
      } else {
        return 0;
      }
    }
    
    // Correct for small values (likely stored in thousands)
    if (amount > 0 && amount < 1000) {
      amount = amount * 1000;
    }
    
    return amount;
  };
  
  // Get phase display label
  const getPhaseDisplayLabel = (account) => {
    if (!account) return '';
    
    // If account has a challengePhase, use it directly
    if (account.challengePhase) {
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
    }
    
    // Fall back to challengeType
    if (account.challengeType === 'two_step' || account.challengeType === 'Swing') {
      return t('home_account_twoStepLabel');
    }
    if (account.challengeType === 'one_step' || account.challengeType === 'Estándar') {
      return t('home_account_oneStepLabel');
    }
    
    // Another fallback based on numberOfPhases
    if (account.numberOfPhases === 2) {
      return t('home_account_twoStepLabel');
    }
    
    // Default to ONE STEP
    return t('home_account_oneStepLabel');
  };

  // Function to get account type display label
  const getAccountTypeLabel = (account) => {
    if (!account) return t('tradingChallenge_button_standard');
    
    // Debug: log relevant account type properties
    console.log("Account type debug:", {
      challengeType: account.challengeType,
      accountType: account.accountType,
      accountStyle: account.accountStyle,
      originalChallengeType: account.originalChallengeType,
      selectedProfitTargetP1: account.selectedProfitTargetP1,
      selectedProfitTargetP2: account.selectedProfitTargetP2
    });
    
    // First priority: Check originalChallengeType (direct user selection from UI)
    if (account.originalChallengeType === 'Estándar') {
      return t('tradingChallenge_button_standard');
    }
    if (account.originalChallengeType === 'Swing') {
      return t('tradingChallenge_button_swim');
    }
    
    // Second priority: Check Spanish challengeType strings
    if (account.challengeType === 'Estándar') {
      return t('tradingChallenge_button_standard');
    }
    if (account.challengeType === 'Swing') {
      return t('tradingChallenge_button_swim');
    }
    
    // Third priority: Check lowercase accountType/accountStyle
    if (account.accountType === 'swing' || account.accountStyle === 'swing') {
      return t('tradingChallenge_button_swim');
    }
    if (account.accountType === 'standard' || account.accountStyle === 'standard') {
      return t('tradingChallenge_button_standard');
    }
    
    // Fourth priority: Identify based on two_step/one_step and additional properties
    if (account.challengeType === 'two_step') {
      // For two_step accounts, we need to determine if it's Swing or Standard
      // Check if there's evidence this is a Swing account
      if (
        // If it has Phase 2 profit target but not Phase 1, it's likely Swing
        (account.selectedProfitTargetP2 && !account.selectedProfitTargetP1) ||
        // Any other swing indicators
        String(account.challengePhase).toLowerCase().includes('swing')
      ) {
        return t('tradingChallenge_button_swim');
      }
      // Default two_step without swing indicators is still Standard
      return t('tradingChallenge_button_standard');
    }
    
    // If explicitly one_step, it's Standard
    if (account.challengeType === 'one_step') {
      return t('tradingChallenge_button_standard');
    }
    
    // Final checks based on profit targets
    if (account.selectedProfitTargetP2 && !account.selectedProfitTargetP1) {
      return t('tradingChallenge_button_swim');
    }
    if (account.selectedProfitTargetP1 && !account.selectedProfitTargetP2) {
      return t('tradingChallenge_button_standard');
    }
    
    // Default fallback: Standard
    return t('tradingChallenge_button_standard');
  };

  // Function to get status badge class
  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-800';
    
    switch (status) {
      case 'Activa':
      case 'Active':
        return 'bg-gradient-to-br from-cyan-500 to-cyan-800/30';
      case 'Aprobada':
      case 'Approved':
        return 'bg-gradient-to-br from-[#3a5311] to-[#2b2b2b]';
      case 'Perdida':
      case 'Lost':
        return 'bg-gradient-to-br from-red-500/40 to-[#2b2b2b]';
      default:
        return 'bg-gray-800';
    }
  };

  // Get translated status text
  const getStatusTranslation = (status) => {
    if (!status) return t('tradingDashboard_status_unknown');
    
    switch (status) {
      case 'Activa':
      case 'Active':
        return t('tradingDashboard_statusActive');
      case 'Aprobada':
      case 'Approved':
        return t('tradingDashboard_status_approved');
      case 'Perdida':
      case 'Lost':
        return t('tradingDashboard_status_lost');
      default:
        return status;
    }
  };

  const getUserName = () => {
    if (currentUser && currentUser.displayName) {
      return currentUser.displayName.split(' ')[0]; // Obtener solo el primer nombre
    } else if (currentUser && currentUser.email) {
      // Si no hay displayName, usar la primera parte del email
      return currentUser.email.split('@')[0];
    }
    return t('tradingDashboard_defaultUserName'); // Changed
  };

  const getBackText = () => {
    if (previousSection === "Cuentas") {
      return t('tradingDashboard_backToAccounts'); // Changed
    } else if (previousSection === "Dashboard") {
      return t('tradingDashboard_backToHome'); // Changed
    } else {
      return t('tradingDashboard_backDefault'); // Changed
    }
  };

  // Add a helper function to format operation dates
  const formatOperationDate = (timestamp, fullMonth = false) => {
    if (!timestamp) return '';
    
    // Handle different timestamp formats
    let date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (typeof timestamp === 'number') {
      // Unix timestamp in milliseconds
      date = new Date(timestamp);
    } else if (typeof timestamp === 'string') {
      // ISO string or other string format
      date = new Date(timestamp);
    } else {
      return '';
    }
    
    // Format as day and month
    const monthFormat = fullMonth ? 'long' : 'short';
    const month = date.toLocaleString(language, { month: monthFormat });
    const year = date.getFullYear();
    // Figma format: 12:00 20 Feb
    // My formatOperationTime will give 12:00:23
    // So here I will return day month
    return `${date.getDate()} ${month}`;
  };
  
  // Add a helper function to format operation time
  const formatOperationTime = (timestamp) => {
    if (!timestamp) return '';
    
    // Handle different timestamp formats
    let date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (typeof timestamp === 'number') {
      // Unix timestamp in milliseconds
      date = new Date(timestamp);
    } else if (typeof timestamp === 'string') {
      // ISO string or other string format
      date = new Date(timestamp);
    } else {
      return '';
    }
    
    // Format as HH:MM:SS
    return date.toLocaleTimeString(language, { 
      hour: '2-digit', 
      minute: '2-digit',
      // Figma shows only HH:MM for open/close, and HH:MM:SS for time inside the date cell
      // For now, let's always return HH:MM as per Figma table example, the seconds are in the small text below date
      // Update: Figma example shows HH:MM for open/close times on top of the cell, and HH:MM:SS within the cell as secondary info.
      // Let's provide full HH:MM:SS for detailed view and allow truncation in UI if needed.
      // The Figma image actually has HH:MM AM/PM for the main time, and HH:MM:SS for the smaller time under the date.
      // Let's use HH:MM for the main display as per figma image for the column title and then HH:MM:SS for the sub-text.
      // The request is to match the image, the image has HH:MM:SS under the date.
      // The header for open/close times in figma is implicit from the main time shown, let's provide HH:MM:SS for the detail line.
      second: '2-digit',
      hour12: false // Figma shows 24h format for the small time
    });
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack(); 
    } else {
      // Fallback or default behavior if onBack is not provided
      // This might involve navigating to a default route, e.g., using useNavigate if in a React Router context
      // For now, just log or do nothing if a more specific app-wide navigation isn't set up here
      console.log("Back action, but no onBack prop defined");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500 border-opacity-50 mx-auto mb-4"></div>
          <p>{t('tradingDashboard_loadingMessage', 'Loading account data...')}</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">{t('tradingDashboard_accountNotFound', 'Account details could not be loaded.')}</p>
          <button
            onClick={handleBackClick}
            className="text-white bg-[#2c2c2c] hover:bg-[#252525] rounded-full p-2 border border-cyan-500 focus:outline-none transition-colors"
          >
            {getBackText()}
          </button>
        </div>
      </div>
    );
  }

  // Create a safe account object with default values
  const safeAccount = {
    // Basic account info
    id: account.id || '',
    status: account.status || 'Active',
    login: account.login || account.accountNumber || '(No Login)',
    serverType: account.serverType || 'MT5',
    investorPassword: account.investorPassword || '',
    masterPassword: account.masterPassword || '********',
    
    // Balance and performance data
    balance: getChallengeAmount(account) || 0,
    balanceGrowth: account.balanceGrowth || 0,
    profit: account.profit || account.pnlToday || 0,
    profitGrowth: account.profitGrowth || account.pnlToday ? (account.pnlToday / getChallengeAmount(account) * 100) : 0,
    
    // Drawdown data
    dailyDrawdown: account.dailyDrawdown || 0,
    dailyDrawdownPercentage: account.dailyDrawdownPercentage || 0,
    totalDrawdown: account.totalDrawdown || 0,
    totalDrawdownPercentage: account.totalDrawdownPercentage || 0,
    
    // Trading metrics
    avgLossPerOperation: account.avgLossPerOperation || 0,
    avgLossPercentage: account.avgLossPercentage || -25.0,
    avgProfitPerOperation: account.avgProfitPerOperation || 0,
    avgProfitPercentage: account.avgProfitPercentage || 25.0,
    avgLotPerOperation: account.avgLotPerOperation || 0,
    avgTradeDuration: account.avgTradeDuration || '00:00:00',
    riskRewardRatio: account.riskRewardRatio || 1,
    winRate: account.winRate || 0,
    
    // Objectives data
    maxLossLimit: account.maxLossLimit || getChallengeAmount(account) * 0.05, // Default 5% of account balance
    allowedLossToday: account.allowedLossToday || getChallengeAmount(account) * 0.02, // Default 2% of account balance
    tradingDays: {
      min: account.tradingDays?.min || 5,
      current: account.tradingDays?.current || 0
    },
    minProfitTarget: account.minProfitTarget || getChallengeAmount(account) * 0.08, // Default 8% of account balance
    currentProfit: account.currentProfit || account.profit || account.pnlToday || 0
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] text-white min-h-screen flex flex-col">
      {/* Botón de regreso */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={handleBackClick}
            className="text-white bg-[#2c2c2c] hover:bg-[#252525] rounded-full p-2 border border-cyan-500 focus:outline-none transition-colors"
            aria-label={t('common_back')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>
      {/* Header con saludo y detalles */}
      <div className="p-4 md:p-6 rounded-2xl relative bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <div className="flex items-start mb-4 md:mb-0 md:w-1/2">
            <div className="w-16 h-16 bg-[#333] rounded-full flex items-center justify-center text-2xl mr-4 overflow-hidden">
              <img 
                src={currentUser?.photoURL || "/IconoPerfil.png"} 
                alt={t('tradingDashboard_avatarAlt')} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full">
              <h1 className="text-xl md:text-2xl font-semibold">{t('tradingDashboard_greetingPrefix')}{getUserName()}</h1>
              <p className="text-sm md:text-base text-gray-400">
                {t('tradingDashboard_currentAccountInfo', { accountSize: formatCurrency(safeAccount.balance) })}
              </p>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center">
                  <div className="mr-3">
                    <img src="/lightning_ring.png" alt={t('tradingDashboard_iconAlt_lightning')} className="w-6 h-6" onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 6L9 13H12V18L15 11H12V6Z' fill='white'/%3E%3C/svg%3E";
                    }} />
                  </div>
                  <span className="text-gray-400 mr-2">{t('tradingDashboard_initialBalanceLabel')}</span>
                  <span className="font-medium">{formatCurrency(safeAccount.balance)}</span>
                </div>
                
                <div className="flex items-center">
                  <div className="mr-3">
                    <img src="/lightning_ring.png" alt={t('tradingDashboard_iconAlt_lightning')} className="w-6 h-6" onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 6L9 13H12V18L15 11H12V6Z' fill='white'/%3E%3C/svg%3E";
                    }} />
                  </div>
                  <span className="text-gray-400 mr-2">{t('tradingDashboard_planTypeLabel')}</span>
                  <span className="font-medium">{getPhaseDisplayLabel(account)}</span>
                </div>
                
                <div className="flex items-center">
                  <div className="mr-3">
                    <img src="/lightning_ring.png" alt={t('tradingDashboard_iconAlt_lightning')} className="w-6 h-6" onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 6L9 13H12V18L15 11H12V6Z' fill='white'/%3E%3C/svg%3E";
                    }} />
                  </div>
                  <span className="text-gray-400 mr-2">{t('tradingDashboard_accountTypeLabel')}</span>
                  <span className="font-medium">{getAccountTypeLabel(account)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:w-1/2 md:border-l md:border-gray-700 md:pl-6">
            <div className="flex items-center mb-4">
              <div className="mr-3">
                <img src="/Chield_check.png" alt={t('tradingDashboard_iconAlt_shield')} className="w-6 h-6" onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' fill='%23555'/%3E%3C/svg%3E";
                }} />
              </div>
              <h3 className="text-xl font-medium mr-3">{t('tradingDashboard_accountDetailsTitle')}</h3>
              <div className={`${getStatusBadgeClass(account.status)} ml-auto rounded-full py-2 px-6 text-sm text-white`}>
                {getStatusTranslation(account.status)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="border border-gray-700 rounded p-2">
                <div className="flex items-center justify-between">
                  <span className="text-s text-gray-400">{t('tradingDashboard_loginLabel')}</span>
                  <div className="flex items-center">
                    <span className="text-s mr-2">{safeAccount.login}</span>
                    <img src="/Copy.png" alt={t('tradingDashboard_iconAlt_copy', 'Copy')} className="w-4 h-4" onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' fill='%23555'/%3E%3C/svg%3E";
                    }} />
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-700 rounded p-2">
                <div className="flex items-center justify-between">
                  <span className="text-s text-gray-400">{t('tradingDashboard_investorPassLabel')}</span>
                  <span className="text-s text-gray-300 underline">{t('tradingDashboard_setPasswordButton')}</span>
                </div>
              </div>
              
              <div className="border border-gray-700 rounded p-2">
                <div className="flex items-center justify-between">
                  <span className="text-s text-gray-400">{t('tradingDashboard_masterPassLabel')}</span>
                  <div className="flex items-center">
                    <span className="text-s mr-2">{safeAccount.masterPassword}</span>
                    <img src="/Visibilidad.png" alt={t('tradingDashboard_iconAlt_visibility', 'Visibility')} className="w-4 h-4" onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' fill='%23555'/%3E%3C/svg%3E";
                    }} />
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-700 rounded p-2">
                <div className="flex items-center justify-between">
                  <span className="text-s text-gray-400">{t('tradingDashboard_mt5ServerLabel')}</span>
                  <span className="text-s">{safeAccount.serverType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de balance y métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#434242] border border-[#333] rounded-xl">
          <h2 className="text-xl md:text-3xl font-bold mb-4">{t('tradingDashboard_balanceChartTitle')}</h2>
          <div className="flex items-center mb-6">
            <span className="text-2xl md:text-4xl font-bold mr-3">{formatCurrency(safeAccount.balance)}</span>
            <span className="bg-green-800 bg-opacity-30 text-green-400 px-2 py-1 rounded text-sm">{formatPercentage(safeAccount.balanceGrowth)}</span>
          </div>
          
          <div className="w-full aspect-square max-h-[500px]">
            {balanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={balanceData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0a84ff" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0a84ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={['0', 'dataMax + 50000']}
                    ticks={[0, 50000, 100000, 150000, 200000, 250000]} 
                    tickFormatter={(value) => value === 0 ? '0k' : `${value/1000}k`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    width={40}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">{t('tradingDashboard_loading_charts', 'Loading charts...')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <h2 className="text-xl font-bold mb-2">{t('tradingDashboard_profitLossWidgetTitle')}</h2>
            <div className="flex items-center mb-1">
              <span className="text-2xl font-bold mr-3">{formatCurrency(safeAccount.profit)}</span>
              <span className="bg-green-800 bg-opacity-30 text-green-400 px-2 py-1 rounded text-sm">{formatPercentage(safeAccount.profitGrowth)}</span>
            </div>
            <p className="text-sm text-gray-400">{currentDate}</p>
          </div> 
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">{t('tradingDashboard_drawdownWidgetTitle')}</h2>
              <div className="flex text-sm">
                <button 
                  onClick={() => setDrawdownType('total')} 
                  className={`px-3 py-1 rounded-md transition-colors
                    ${drawdownType === 'total' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-transparent text-gray-400 hover:text-gray-200'}
                  `}
                >
                  {t('tradingDashboard_drawdownTypeTotal')}
                </button>
                <div className="border-r border-gray-600 mx-1 h-4 self-center"></div>
                <button 
                  onClick={() => setDrawdownType('daily')} 
                  className={`px-3 py-1 rounded-md transition-colors
                    ${drawdownType === 'daily' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-transparent text-gray-400 hover:text-gray-200'}
                  `}
                >
                  {t('tradingDashboard_drawdownTypeDaily')}
                </button>
              </div>
            </div>
            <div className="flex items-center mb-1">
              <span className="text-2xl font-bold mr-3">
                {drawdownType === 'daily' ? formatCurrency(safeAccount.dailyDrawdown) : formatCurrency(safeAccount.totalDrawdown)} 
              </span>
              <span className="bg-green-800 bg-opacity-30 text-green-400 px-2 py-1 rounded text-sm">
                {drawdownType === 'daily' ? formatPercentage(safeAccount.dailyDrawdownPercentage) : formatPercentage(safeAccount.totalDrawdownPercentage)} 
              </span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <h2 className="text-xl font-bold mb-2">{t('tradingDashboard_tradingDaysWidgetTitle')}</h2>
            <div className="text-2xl font-bold">{safeAccount.tradingDays.current} {t('tradingDashboard_daysLabel')}</div>
          </div>
        </div>
      </div>

      {/* Sección de métricas detalladas (Pérdida Promedio, Ganancia Promedio, etc.) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Pérdida Promedio Por Operación */}
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-medium mb-1">{t('tradingDashboard_avgLossPerOperation')}</h3>
            <div className="flex items-baseline">
              <span className="text-xl md:text-2xl font-bold mr-2">{formatCurrency(safeAccount.avgLossPerOperation)}</span>
              <span className="bg-red-800 bg-opacity-30 text-red-400 px-2 py-1 rounded text-xs">{formatPercentage(safeAccount.avgLossPercentage)}</span>
            </div>
          </div>
          <div className="bg-[#2d2d2d] p-2 rounded-full">
            <img src="/loss.png" alt={t('tradingDashboard_iconAlt_loss')} onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M7 17L17 7M17 7H11M17 7V13' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"; }} />
          </div>
        </div>

        {/* Ganancia Promedio Por Operación */}
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-medium mb-1">{t('tradingDashboard_avgProfitPerOperation')}</h3>
            <div className="flex items-baseline">
              <span className="text-xl md:text-2xl font-bold mr-2">{formatCurrency(safeAccount.avgProfitPerOperation)}</span>
              <span className="text-green-400 text-xs bg-green-800 bg-opacity-30 px-2 py-1 rounded">{formatPercentage(safeAccount.avgProfitPercentage)}</span>
            </div>
          </div>
          <div className="bg-[#2d2d2d] p-2 rounded-full">
            <img src="/gain.png" alt={t('tradingDashboard_iconAlt_coins')} onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 6L12 18M9 10L15 10M9 14L15 14' stroke='white' stroke-width='2'/%3E%3C/svg%3E"; }} />
          </div>
        </div>

        {/* Lotaje Promedio Por Operación */}
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-medium mb-1">{t('tradingDashboard_avgLotPerOperation')}</h3>
            <span className="text-xl md:text-2xl font-bold">{safeAccount.avgLotPerOperation.toFixed(2)}</span>
          </div>
          <div className="bg-[#2d2d2d] p-2 rounded-full">
            <img src="/graph.png" alt={t('tradingDashboard_iconAlt_lot')} onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M4 12L12 4L20 12L12 20L4 12Z' stroke='white' stroke-width='2'/%3E%3Cpath d='M8 12L12 8L16 12L12 16L8 12Z' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E"; }} />
          </div>
        </div>
        
        {/* Duración Promedio Por Operación */}
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-medium mb-1">{t('tradingDashboard_avgTradeDuration')}</h3>
            <span className="text-xl md:text-2xl font-bold">{safeAccount.avgTradeDuration}</span>
          </div>
          <div className="bg-[#2d2d2d] p-2 rounded-full">
            <img src="/clock.png" alt={t('tradingDashboard_iconAlt_clock')} onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 6v6l4 2' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"; }} />
          </div>
        </div>

        {/* Relación Riesgo Beneficio */}
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-medium mb-1">{t('tradingDashboard_riskRewardRatio')}</h3>
            <span className="text-xl md:text-2xl font-bold">{safeAccount.riskRewardRatio.toFixed(2)}:1</span>
          </div>
          <div className="bg-[#2d2d2d] p-2 rounded-full">
            <img src="/victory.png" alt={t('tradingDashboard_iconAlt_ratio')} onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z' fill='white'/%3E%3C/svg%3E"; }} />
          </div>
        </div>

        {/* Ratio De Ganancia */}
        <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-medium mb-1">{t('tradingDashboard_winRate')}</h3>
            <span className="text-xl md:text-2xl font-bold">{safeAccount.winRate.toFixed(2)}%</span>
          </div>
          <div className="bg-[#2d2d2d] p-2 rounded-full">
            <img src="/coins.png" alt={t('tradingDashboard_iconAlt_winRate')} onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M12 4V12H20A8 8 0 0 1 12 20V12H4A8 8 0 0 1 12 4Z' fill='white'/%3E%3C/svg%3E"; }} />
          </div>
        </div>
      </div>

      {/* Sección de Objetivos */}
      <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4">{t('tradingDashboard_objectivesTitle')}</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{t('tradingDashboard_dailyLossLimitTitle')}</h3>
              <span className={`px-2 py-1 rounded text-xs ${
                safeAccount.dailyDrawdown > safeAccount.maxLossLimit
                  ? 'bg-red-800 bg-opacity-30 text-red-400'
                  : safeAccount.dailyDrawdown > safeAccount.maxLossLimit * 0.7
                  ? 'bg-yellow-800 bg-opacity-30 text-yellow-400'
                  : 'bg-green-800 bg-opacity-30 text-green-400'
              }`}>
                {safeAccount.dailyDrawdown > safeAccount.maxLossLimit 
                  ? t('tradingDashboard_status_lost')
                  : safeAccount.dailyDrawdown > safeAccount.maxLossLimit * 0.7
                  ? t('tradingDashboard_status_inProgress') 
                  : t('tradingDashboard_status_surpassed')}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">{t('tradingDashboard_maxLossLimitLabel')}</span>
              <span>{formatCurrency(safeAccount.maxLossLimit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{t('tradingDashboard_allowedLossTodayLabel')}</span>
              <span>{formatCurrency(safeAccount.allowedLossToday)}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {t('tradingDashboard_daily_loss_explanation')}
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{t('tradingDashboard_globalLossLimitTitle')}</h3>
              <span className={`px-2 py-1 rounded text-xs ${
                safeAccount.totalDrawdown > safeAccount.maxLossLimit
                  ? 'bg-red-800 bg-opacity-30 text-red-400'
                  : safeAccount.totalDrawdown > safeAccount.maxLossLimit * 0.7
                  ? 'bg-yellow-800 bg-opacity-30 text-yellow-400'
                  : 'bg-green-800 bg-opacity-30 text-green-400'
              }`}>
                {safeAccount.totalDrawdown > safeAccount.maxLossLimit 
                  ? t('tradingDashboard_status_lost')
                  : safeAccount.totalDrawdown > safeAccount.maxLossLimit * 0.7
                  ? t('tradingDashboard_status_inProgress') 
                  : t('tradingDashboard_status_surpassed')}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">{t('tradingDashboard_maxLossLimitLabel')}</span>
              <span>{formatCurrency(safeAccount.maxLossLimit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{t('tradingDashboard_allowedLossTodayLabel')}</span>
              <span>{formatCurrency(safeAccount.allowedLossToday)}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {t('tradingDashboard_global_loss_explanation')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{t('tradingDashboard_minTradingDaysTitle')}</h3>
              <span className={`px-2 py-1 rounded text-xs ${
                safeAccount.tradingDays.current >= safeAccount.tradingDays.min
                  ? 'bg-green-800 bg-opacity-30 text-green-400'
                  : 'bg-yellow-800 bg-opacity-30 text-yellow-400'
              }`}>
                {safeAccount.tradingDays.current >= safeAccount.tradingDays.min
                  ? t('tradingDashboard_status_surpassed')
                  : t('tradingDashboard_status_inProgress')}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">{t('tradingDashboard_minimumLabel')}</span>
              <span>{safeAccount.tradingDays.min} {t('tradingDashboard_daysLabel')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{t('tradingDashboard_currentResultLabel')}</span>
              <span>{safeAccount.tradingDays.current} {t('tradingDashboard_daysLabel')}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {t('tradingDashboard_min_days_explanation')}
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{t('tradingDashboard_profitTargetTitle')}</h3>
              <span className={`px-2 py-1 rounded text-xs ${
                safeAccount.currentProfit >= safeAccount.minProfitTarget
                  ? 'bg-green-800 bg-opacity-30 text-green-400'
                  : 'bg-yellow-800 bg-opacity-30 text-yellow-400'
              }`}>
                {safeAccount.currentProfit >= safeAccount.minProfitTarget
                  ? t('tradingDashboard_status_surpassed')
                  : t('tradingDashboard_status_inProgress')}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">{t('tradingDashboard_minimumLabel')}</span>
              <span>{formatCurrency(safeAccount.minProfitTarget)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{t('tradingDashboard_currentResultLabel')}</span>
              <span>{formatCurrency(safeAccount.currentProfit)}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {t('tradingDashboard_profit_target_explanation')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de operaciones */}
      <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex-1 flex flex-col">
        <h2 className="text-xl md:text-2xl font-bold mb-6">{t('tradingDashboard_operationsSummaryTitle')}</h2>
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 text-xs text-gray-400 uppercase">
                <th className="p-3 font-normal">{t('tradingDashboard_tableHeader_fechaApertura')}</th>
                <th className="p-3 font-normal">{t('tradingDashboard_tableHeader_instrumento')}</th>
                <th className="p-3 font-normal text-right">{t('tradingDashboard_tableHeader_precioApertura')}</th>
                <th className="p-3 font-normal text-right">{t('tradingDashboard_tableHeader_stopLoss')}</th>
                <th className="p-3 font-normal text-right">{t('tradingDashboard_tableHeader_takeProfit')}</th>
                <th className="p-3 font-normal text-center">{t('tradingDashboard_tableHeader_idPosicion')}</th>
                <th className="p-3 font-normal text-center">{t('tradingDashboard_tableHeader_type')}</th>
                <th className="p-3 font-normal text-center">{t('tradingDashboard_tableHeader_lotaje')}</th>
                <th className="p-3 font-normal">{t('tradingDashboard_tableHeader_fechaCierre')}</th>
                <th className="p-3 font-normal text-right">{t('tradingDashboard_tableHeader_precioCierre')}</th>
                <th className="p-3 font-normal text-right">{t('tradingDashboard_tableHeader_resultado')}</th>
              </tr>
            </thead>
            <tbody>
              {operationsData.length > 0 ? (
                operationsData.map((operation) => (
                  <tr key={operation.id} className="border-b border-gray-800 hover:bg-gray-700/10 transition-colors text-sm">
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-2 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div>{formatOperationDate(operation.openTimestamp || operation.timestamp || operation.date || operation.fechaApertura, true)}</div>
                          <div className="text-xs text-gray-500">{formatOperationTime(operation.openTimestamp || operation.timestamp || operation.date || operation.fechaApertura)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <img 
                          src={operation.instrumentLogo || (() => {
                            const symbol = operation.symbol?.toLowerCase() || operation.instrumento?.toLowerCase();
                            const opIndex = operationsData.findIndex(op => op.id === operation.id); // Get index for alternating logic
                            if (symbol === 'eurusd') {
                              return opIndex % 2 === 0 ? '/us.png' : '/eur.png';
                            } else if (symbol === 'usdchf') {
                              return '/us.png'; // Default to US flag for USDCHF or choose '/chf.png'
                            } else if (symbol?.includes('eur')) {
                              return '/eur.png';
                            } else if (symbol?.includes('gbp')) {
                              return '/gbp.png';
                            } else if (symbol?.includes('aud')) {
                              return '/aud.png';
                            } else if (symbol?.includes('cad')) {
                              return '/cad.png';
                            } else if (symbol?.includes('chf')) {
                              return '/chf.png';
                            } else if (symbol?.includes('usd')) { // Catch other USD pairs
                              return '/us.png';
                            } 
                            return '/elements.png'; // A generic fallback icon if none match, or keep as is to hide
                          })()} 
                          alt={operation.symbol || operation.instrumento} 
                          className="w-5 h-5 mr-2 rounded-full"
                          onError={(e) => { e.target.src = '/elements.png'; e.target.onerror = null; }} // Fallback to a generic icon on error
                        />
                        {operation.symbol || operation.instrumento}
                      </div>
                    </td>
                    <td className="p-3 text-right">{formatCurrency(operation.openPrice || operation.precioApertura)}</td>
                    <td className="p-3 text-right">
                        {formatCurrency(operation.stopLoss)}
                        {operation.stopLossPercentage && 
                            <span className={`ml-1 text-xs px-1 py-0.5 rounded ${operation.stopLossPercentage > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {operation.stopLossPercentage.toFixed(1)}%
                            </span>
                        }
                    </td>
                    <td className="p-3 text-right">
                        {formatCurrency(operation.takeProfit)}
                        {operation.takeProfitPercentage && 
                            <span className={`ml-1 text-xs px-1 py-0.5 rounded ${operation.takeProfitPercentage > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {operation.takeProfitPercentage.toFixed(1)}%
                            </span>
                        }
                    </td>
                    <td className="p-3 text-center">{operation.positionId || operation.idPosicion || operation.id}</td>
                    <td className="p-3 text-center">
                      {(operation.type === 'buy' || operation.type === 'Compra' || operation.tipo === 'Compra' || operation.tipo === 'buy')
                        ? <span className="text-green-400">{t('tradingDashboard_operationType_buy')}</span>
                        : (operation.type === 'sell' || operation.type === 'Venta' || operation.tipo === 'Venta' || operation.tipo === 'sell')
                          ? <span className="text-red-400">{t('tradingDashboard_operationType_sell')}</span>
                          : operation.type || operation.tipo}
                    </td>
                    <td className="p-3 text-center">{operation.volume || operation.lotaje}</td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center">
                         <div className="mr-2 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                           <div>{formatOperationDate(operation.closeTimestamp || operation.timestampCierre || operation.fechaCierre, true)}</div>
                           <div className="text-xs text-gray-500">{formatOperationTime(operation.closeTimestamp || operation.timestampCierre || operation.fechaCierre)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right">{formatCurrency(operation.closePrice || operation.precioCierre)}</td>
                    <td className="p-3 text-right">
                        <div className={`flex items-center justify-end ${operation.resultAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {operation.resultAmount >= 0 ? '+' : ''}{formatCurrency(operation.resultAmount || operation.resultado)}
                            {operation.resultPercentage && 
                                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-md ${operation.resultAmount >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                   {operation.resultPercentage.toFixed(1)}% 
                                   {operation.resultAmount >= 0 ? 
                                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 inline-block ml-1">
                                       <path fillRule="evenodd" d="M14 4.5a.75.75 0 00-1.06-.02L8.53 8.5H5.75a.75.75 0 000 1.5h3.5a.75.75 0 00.53-.22l4.5-4.25a.75.75 0 00-.28-1.03z" clipRule="evenodd" />
                                     </svg> : 
                                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 inline-block ml-1">
                                       <path fillRule="evenodd" d="M2 11.5a.75.75 0 001.06.02L7.47 7.5h2.78a.75.75 0 000-1.5h-3.5a.75.75 0 00-.53.22l-4.5 4.25a.75.75 0 00-.28 1.03z" clipRule="evenodd" />
                                     </svg>
                                   }
                                </span>
                            }
                        </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center py-8 text-gray-500">
                    {t('tradingDashboard_emptyTable_noOperations')}
                  </td>
                </tr>
              )}
            </tbody>
            {operationsData.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-700 bg-gray-800/30">
                  <td colSpan="10" className="p-3 text-right font-bold text-lg">Total</td>
                  <td className="p-3 text-right font-bold text-lg">
                    <div className={`flex items-center justify-end ${safeAccount.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {safeAccount.profit >= 0 ? '+' : ''}{formatCurrency(safeAccount.profit)}
                        {safeAccount.profitGrowth !== undefined && 
                            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-md ${safeAccount.profit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                               {safeAccount.profitGrowth.toFixed(1)}% 
                               {safeAccount.profit >= 0 ? 
                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 inline-block ml-1">
                                   <path fillRule="evenodd" d="M14 4.5a.75.75 0 00-1.06-.02L8.53 8.5H5.75a.75.75 0 000 1.5h3.5a.75.75 0 00.53-.22l4.5-4.25a.75.75 0 00-.28-1.03z" clipRule="evenodd" />
                                 </svg> : 
                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 inline-block ml-1">
                                   <path fillRule="evenodd" d="M2 11.5a.75.75 0 001.06.02L7.47 7.5h2.78a.75.75 0 000-1.5h-3.5a.75.75 0 00-.53.22l-4.5 4.25a.75.75 0 00-.28 1.03z" clipRule="evenodd" />
                                 </svg>
                               }
                            </span>
                        }
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;