import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useAuth } from '../contexts/AuthContext'; // Importar el contexto de autenticación
import { getTranslator } from '../utils/i18n'; // Added
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import mt5Service from '../services/mt5Service';

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
  const [drawdownType, setDrawdownType] = useState('daily'); // 'daily' or 'total' - NOW ALSO FOR BALANCE CHART
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [balanceData, setBalanceData] = useState([]);
  const [operationsData, setOperationsData] = useState([]);
  const [error, setError] = useState(null); // Added error state
  const [copiedLogin, setCopiedLogin] = useState(false);
  const [copiedMasterPass, setCopiedMasterPass] = useState(false);

  useEffect(() => {
    const today = new Date();
    setCurrentDate(formatDate(today, language, t));
  }, [language, t]);

  // Fetch account data from API and Firebase
    const fetchAccountData = async () => {
      setIsLoading(true);
    setError(null);
      try {
      // 1. Primero obtener datos de Firebase para conseguir el login real
        const accountDocRef = doc(db, 'tradingAccounts', accountId);
        const accountDocSnap = await getDoc(accountDocRef);
        
      let firebaseData = {};
        if (accountDocSnap.exists()) {
        firebaseData = { id: accountDocSnap.id, ...accountDocSnap.data() };
        console.log("Fetched Firebase account data:", firebaseData);
      } else {
        throw new Error("Account not found in Firebase");
      }
      
      // 2. Obtener el login numérico real para la API
      const loginNumber = firebaseData.login || firebaseData.accountNumber || firebaseData.accountLogin;
      if (!loginNumber) {
        console.warn("No login number found, using Firebase data only");
        setAccount(firebaseData);
        generateRealBalanceData(firebaseData, [], drawdownType);
        return;
      }
      
      console.log("Using login number for MT5 API:", loginNumber);
      
      // 3. Obtener datos reales de MT5 via API usando el login numérico
      let mt5AccountData = {};
      try {
        mt5AccountData = await mt5Service.getAccountInfo(loginNumber);
        console.log("Fetched MT5 account data:", mt5AccountData);
      } catch (apiError) {
        console.warn("MT5 API failed, using Firebase data only:", apiError.message);
        // Continuar solo con datos de Firebase
             }
       
       // 4. Combinar datos reales (MT5) con datos de configuración (Firebase)
      const combinedAccount = {
        ...firebaseData,
        // Datos reales de MT5 toman prioridad sobre los simulados
        login: mt5AccountData.login || firebaseData.login,
        balance: mt5AccountData.balance || firebaseData.balance,
        equity: mt5AccountData.equity || firebaseData.equity,
        margin: mt5AccountData.margin || firebaseData.margin,
        free_margin: mt5AccountData.free_margin || firebaseData.free_margin,
        leverage: mt5AccountData.leverage || firebaseData.leverage,
        group: mt5AccountData.group || firebaseData.group,
        name: mt5AccountData.name || firebaseData.name,
        enabled: mt5AccountData.enabled !== undefined ? mt5AccountData.enabled : firebaseData.enabled,
        last_access: mt5AccountData.last_access || firebaseData.last_access,
        
        // Métricas calculadas reales
        profit: mt5AccountData.profit || firebaseData.profit || 0,
        profit_percentage: mt5AccountData.profit_percentage || firebaseData.profit_percentage || 0,
        drawdown: mt5AccountData.drawdown || firebaseData.drawdown || 0,
        
        // Datos de configuración de Firebase
        challengeAmountNumber: firebaseData.challengeAmountNumber,
        challengeType: firebaseData.challengeType,
        status: firebaseData.status || 'Active'
      };
      
             setAccount(combinedAccount);
       
       // 5. 🚀 NUEVO: Obtener historial de operaciones REAL de MT5 API
       let operations = [];
       try {
         console.log("🔄 Fetching MT5 operations history...");
         const historyResponse = await mt5Service.getAccountHistory(loginNumber);
         console.log("📊 MT5 History Response:", historyResponse);
         
         if (historyResponse && historyResponse.operations) {
           operations = historyResponse.operations.map(op => ({
             id: op.ticket || op.id,
             ticket: op.ticket || op.id,
             symbol: op.symbol,
             type: op.type,
             volume: op.volume,
             openPrice: op.open_price || op.openPrice,
             closePrice: op.close_price || op.closePrice,
             openTime: op.open_time || op.openTime,
             closeTime: op.close_time || op.closeTime,
             profit: op.profit,
             pnl: op.profit, // Alias para compatibilidad
             timestamp: new Date(op.close_time || op.closeTime || op.open_time || op.openTime),
             accountId: accountId
           }));
           
           console.log("✅ Processed MT5 operations:", operations);
         }
       } catch (historyError) {
         console.warn("⚠️ Failed to fetch MT5 history, falling back to Firebase:", historyError.message);
         
         // Fallback a Firebase si falla la API MT5
         try {
           const operationsQuery = query(
             collection(db, 'operations'), 
             where('accountId', '==', accountId)
           );
           
           const operationsSnapshot = await getDocs(operationsQuery);
           operations = [];
           
           operationsSnapshot.forEach(doc => {
             operations.push({ id: doc.id, ...doc.data() });
           });
           
           console.log("📊 Fallback Firebase operations:", operations);
         } catch (firebaseError) {
           console.error("❌ Both MT5 and Firebase operations failed:", firebaseError);
         }
       }
       
       setOperationsData(operations);
       
       // 6. Generar datos de balance reales basados en operaciones MT5
       generateRealBalanceData(combinedAccount, operations, drawdownType);
      
    } catch (error) {
      console.error("Error fetching account data:", error);
      
      // Fallback máximo a Firebase si todo falla
      try {
        const accountDocRef = doc(db, 'tradingAccounts', accountId);
        const accountDocSnap = await getDoc(accountDocRef);
        
        if (accountDocSnap.exists()) {
          const firebaseData = { id: accountDocSnap.id, ...accountDocSnap.data() };
          setAccount(firebaseData);
          generateRealBalanceData(firebaseData, [], drawdownType);
        } else {
          setError(t('tradingDashboard_accountNotFound', 'Account details could not be loaded.'));
        }
      } catch (fallbackError) {
        console.error("Fallback Firebase error:", fallbackError);
        setError(fallbackError.message || t('common_errorLoadingData', 'Error loading data'));
      }
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    if (!accountId) {
      setIsLoading(false);
      return;
    }

    fetchAccountData();
  }, [accountId, drawdownType]);

  // Generate real balance data based on actual operations
  const generateRealBalanceData = (account, operations, type) => {
    const initialBalance = account.challengeAmountNumber || account.balance || 100000;
    let data = [];
    
    // 🔍 VERIFICACIÓN: Log para saber qué ruta está tomando
    console.log("🔍 CHART VERIFICATION:");
    console.log("- Initial balance:", initialBalance);
    console.log("- Operations count:", operations?.length || 0);
    console.log("- Chart type:", type);
    
    if (operations && operations.length > 0) {
      console.log("✅ USING REAL OPERATIONS DATA");
      
      // Usar operaciones reales para generar el gráfico
      const sortedOperations = operations.sort((a, b) => {
        const dateA = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const dateB = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return dateA - dateB;
      });
      
      let runningBalance = initialBalance;
      const dataPoints = [];
      
      // Añadir punto inicial
      dataPoints.push({
        name: type === 'daily' ? 'Inicio' : 'Ene',
        value: Math.round(runningBalance),
        date: new Date()
      });
      
      // Procesar operaciones reales
      sortedOperations.forEach((operation, index) => {
        const profit = operation.profit || operation.pnl || 0;
        runningBalance += profit;
        
        const opDate = operation.timestamp?.toDate?.() || new Date(operation.timestamp);
        const label = type === 'daily' 
          ? `Día ${index + 1}`
          : opDate.toLocaleDateString('es-ES', { month: 'short' });
        
        dataPoints.push({
          name: label,
          value: Math.round(runningBalance),
          date: opDate
        });
        
        // Log cada operación procesada
        console.log(`Operation ${index + 1}: ${profit} -> Balance: ${Math.round(runningBalance)}`);
      });
      
      data = dataPoints;
      console.log("📊 Final chart data (real):", data);
    } else {
      console.log("⚠️ USING FALLBACK SIMULATION (no operations found)");
      
      // Fallback con balance actual si no hay operaciones
      const currentBalance = account.equity || account.balance || initialBalance;
      console.log("- Current balance:", currentBalance);
      console.log("- Simulating linear progression");

    if (type === 'total') {
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep"];
      data = months.map((month, index) => {
          const progress = (index + 1) / months.length;
          const value = initialBalance + (currentBalance - initialBalance) * progress;
          return { name: month, value: Math.round(value) };
        });
      } else {
        // Simular progresión diaria hacia el balance actual
      const daysInMonth = 30;
        const dailyChange = (currentBalance - initialBalance) / daysInMonth;
        console.log("- Daily change:", dailyChange);
        
      for (let i = 1; i <= daysInMonth; i++) {
          const value = initialBalance + (dailyChange * i);
          data.push({ name: `Día ${i}`, value: Math.round(value) });
        }
      }
      
      console.log("📊 Final chart data (simulated):", data);
    }
    
    setBalanceData(data);
  };

  // Generate placeholder balance data (DEPRECATED - mantener para compatibilidad)
  const generateBalanceData = (account, type) => {
    console.warn("generateBalanceData is deprecated, use generateRealBalanceData instead");
    generateRealBalanceData(account, [], type);
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

  // REAL CALCULATION FUNCTIONS - Calculate metrics from actual operations data
  const calculateAvgLoss = (operations) => {
    if (!operations || operations.length === 0) return 0;
    const losses = operations.filter(op => (op.profit || op.pnl || 0) < 0);
    if (losses.length === 0) return 0;
    const totalLoss = losses.reduce((sum, op) => sum + (op.profit || op.pnl || 0), 0);
    return totalLoss / losses.length;
  };

  const calculateAvgLossPercentage = (operations, challengeAmount) => {
    if (!operations || operations.length === 0 || !challengeAmount) return 0;
    const avgLoss = calculateAvgLoss(operations);
    return (avgLoss / challengeAmount) * 100;
  };

  const calculateAvgProfit = (operations) => {
    if (!operations || operations.length === 0) return 0;
    const profits = operations.filter(op => (op.profit || op.pnl || 0) > 0);
    if (profits.length === 0) return 0;
    const totalProfit = profits.reduce((sum, op) => sum + (op.profit || op.pnl || 0), 0);
    return totalProfit / profits.length;
  };

  const calculateAvgProfitPercentage = (operations, challengeAmount) => {
    if (!operations || operations.length === 0 || !challengeAmount) return 0;
    const avgProfit = calculateAvgProfit(operations);
    return (avgProfit / challengeAmount) * 100;
  };

  const calculateAvgLot = (operations) => {
    if (!operations || operations.length === 0) return 0;
    const totalLots = operations.reduce((sum, op) => sum + (op.volume || op.lots || 0), 0);
    return totalLots / operations.length;
  };

  const calculateAvgDuration = (operations) => {
    if (!operations || operations.length === 0) return '00:00:00';
    
    const durations = operations.filter(op => op.openTime && op.closeTime);
    if (durations.length === 0) return '00:00:00';
    
    const totalDuration = durations.reduce((sum, op) => {
      const openTime = op.openTime?.toDate?.() || new Date(op.openTime);
      const closeTime = op.closeTime?.toDate?.() || new Date(op.closeTime);
      return sum + (closeTime - openTime);
    }, 0);
    
    const avgDurationMs = totalDuration / durations.length;
    const hours = Math.floor(avgDurationMs / (1000 * 60 * 60));
    const minutes = Math.floor((avgDurationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((avgDurationMs % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateRiskReward = (operations) => {
    if (!operations || operations.length === 0) return 0;
    const avgProfit = calculateAvgProfit(operations);
    const avgLoss = Math.abs(calculateAvgLoss(operations));
    return avgLoss > 0 ? avgProfit / avgLoss : 0;
  };

  const calculateWinRate = (operations) => {
    if (!operations || operations.length === 0) return 0;
    const winningTrades = operations.filter(op => (op.profit || op.pnl || 0) > 0).length;
    return (winningTrades / operations.length) * 100;
  };

  const calculateTradingDays = (operations) => {
    if (!operations || operations.length === 0) return 1;
    
    const uniqueDays = new Set();
    operations.forEach(op => {
      const date = op.timestamp?.toDate?.() || new Date(op.timestamp);
      const dayKey = date.toDateString();
      uniqueDays.add(dayKey);
    });
    
    return uniqueDays.size || 1;
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

  // 2. Función para copiar texto al portapapeles y mostrar feedback
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'login') {
        setCopiedLogin(true);
        setTimeout(() => setCopiedLogin(false), 1500);
      } else if (type === 'master') {
        setCopiedMasterPass(true);
        setTimeout(() => setCopiedMasterPass(false), 1500);
      }
    });
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

      // Create a safe account object with REAL data prioritized over fallbacks
  const safeAccount = {
    // Basic account info
    id: account.id || '',
    status: account.status || 'Active',
    login: account.login || account.accountNumber || '(No Login)',
    serverType: account.serverType || 'MT5',
    investorPassword: account.investorPassword || '',
    masterPassword: account.masterPassword || '********',
    
      // Balance and performance data - REAL VALUES FIRST
      initialChallengeAmount: getChallengeAmount(account),
      currentBalance: account.equity || account.currentBalance || account.balance || getChallengeAmount(account),
      balanceGrowth: account.balanceGrowth || (account.profit_percentage || 0),
      profit: account.profit || 0, // REAL profit from MT5/Firebase
      profitGrowth: account.profit_percentage || 0, // REAL percentage from calculations
      
      // Drawdown data - REAL VALUES FIRST
      dailyDrawdown: account.dailyDrawdown || (account.drawdown || 0) * -1,
      dailyDrawdownPercentage: account.dailyDrawdownPercentage || (account.drawdown || 0) * -1,
      totalDrawdown: account.totalDrawdown || (account.drawdown || 0) * -1,
      totalDrawdownPercentage: account.totalDrawdownPercentage || (account.drawdown || 0) * -1,
      
      // Trading metrics - Calculate from real operations data
      avgLossPerOperation: account.avgLossPerOperation || calculateAvgLoss(operationsData),
      avgLossPercentage: account.avgLossPercentage || calculateAvgLossPercentage(operationsData, getChallengeAmount(account)),
      avgProfitPerOperation: account.avgProfitPerOperation || calculateAvgProfit(operationsData),
      avgProfitPercentage: account.avgProfitPercentage || calculateAvgProfitPercentage(operationsData, getChallengeAmount(account)),
      avgLotPerOperation: account.avgLotPerOperation || calculateAvgLot(operationsData),
      avgTradeDuration: account.avgTradeDuration || calculateAvgDuration(operationsData),
      riskRewardRatio: account.riskRewardRatio || calculateRiskReward(operationsData),
      winRate: account.winRate || calculateWinRate(operationsData),
      
      // Objectives data
      maxLossLimit: account.maxLossLimit || (getChallengeAmount(account) * 0.05),
      allowedLossToday: account.allowedLossToday || (getChallengeAmount(account) * 0.02),
    tradingDays: {
      min: account.tradingDays?.min || 5,
        current: account.tradingDays?.current || calculateTradingDays(operationsData)
    },
      minProfitTarget: account.minProfitTarget || (getChallengeAmount(account) * 0.08),
      currentProfit: account.profit || 0 // Real profit towards target
  };

  return (
    <div className="p-2 mobile-p-3 sm:p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] text-white min-h-screen flex flex-col">
      {/* Botón de regreso */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center mb-2 sm:mb-4">
          <button
            onClick={handleBackClick}
            className="text-white bg-[#2c2c2c] hover:bg-[#252525] rounded-full p-1.5 sm:p-2 border border-cyan-500 focus:outline-none transition-colors"
            aria-label={t('common_back')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>
      {/* Container principal con borde y fondo */}
      <div className="bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-2xl p-4 md:p-6 mb-4 md:mb-6 w-full flex flex-col gap-6">
      {/* Header con saludo y detalles */}
        <div className="rounded-2xl relative w-full mb-0 p-0 border-none bg-transparent">
        <div className="flex flex-col lg:flex-row justify-between w-full gap-4 lg:gap-6">
          {/* Left Side: User Info & Account Overview */}
          <div className="flex items-start mb-3 lg:mb-0 lg:w-1/2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#333] rounded-full flex items-center justify-center text-xl sm:text-2xl mr-3 sm:mr-4 overflow-hidden flex-shrink-0">
              <img 
                src={currentUser?.photoURL || "/IconoPerfil.png"} 
                alt={t('tradingDashboard_avatarAlt')} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">{t('tradingDashboard_greetingPrefix')}{getUserName()}</h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-400">
                {t('tradingDashboard_currentAccountInfo', { accountSize: formatCurrency(safeAccount.currentBalance) })}
              </p>
              <div className="space-y-1.5 sm:space-y-2 mt-3 sm:mt-4 text-xs sm:text-sm">
                <div className="flex items-center">
                  <div className="mr-2 sm:mr-3">
                    <img src="/lightning_ring.png" alt={t('tradingDashboard_iconAlt_lightning')} className="w-4 h-4 sm:w-5 md:w-6 sm:h-5 md:h-6" onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 6L9 13H12V18L15 11H12V6Z' fill='white'/%3E%3C/svg%3E";
                    }} />
                  </div>
                  <span className="text-gray-400 mr-1.5 sm:mr-2">{t('tradingDashboard_initialBalanceLabel')}</span>
                  <span className="font-medium">{formatCurrency(safeAccount.initialChallengeAmount)}</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 sm:mr-3">
                    <img src="/lightning_ring.png" alt={t('tradingDashboard_iconAlt_lightning')} className="w-4 h-4 sm:w-5 md:w-6 sm:h-5 md:h-6" onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 6L9 13H12V18L15 11H12V6Z' fill='white'/%3E%3C/svg%3E";
                    }} />
                  </div>
                  <span className="text-gray-400 mr-1.5 sm:mr-2">{t('tradingDashboard_planTypeLabel')}</span>
                  <span className="font-medium">{getPhaseDisplayLabel(account)}</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 sm:mr-3">
                    <img src="/lightning_ring.png" alt={t('tradingDashboard_iconAlt_lightning')} className="w-4 h-4 sm:w-5 md:w-6 sm:h-5 md:h-6" onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 6L9 13H12V18L15 11H12V6Z' fill='white'/%3E%3C/svg%3E";
                    }} />
                  </div>
                  <span className="text-gray-400 mr-1.5 sm:mr-2">{t('tradingDashboard_accountTypeLabel')}</span>
                  <span className="font-medium">{getAccountTypeLabel(account)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side: Account Details & Credentials */}
          <div className="flex flex-col lg:w-1/2 lg:border-l lg:border-gray-700 lg:pl-6">
            <div className="flex flex-wrap items-center mb-3 sm:mb-4 gap-2">
              <div className="mr-2 sm:mr-3">
                <img src="/Chield_check.png" alt={t('tradingDashboard_iconAlt_shield')} className="w-5 h-5 sm:w-6 sm:h-6" onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' fill='%23555'/%3E%3C/svg%3E";
                }} />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-medium mr-auto">{t('tradingDashboard_accountDetailsTitle')}</h3>
              <div className={`${getStatusBadgeClass(account.status)} rounded-full py-1.5 px-4 sm:py-2 sm:px-6 text-xs sm:text-sm text-white whitespace-nowrap`}>
                {getStatusTranslation(account.status)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 w-full text-xs sm:text-sm">
              <div className="border border-gray-700 rounded-md p-2 sm:p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t('tradingDashboard_loginLabel')}</span>
                  <div className="flex items-center">
                    <span className="mr-1.5 sm:mr-2">{safeAccount.login}</span>
                      <img
                        src="/Copy.png"
                        alt={t('tradingDashboard_iconAlt_copy', 'Copy')}
                        className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer"
                        title={copiedLogin ? t('common_copied', 'Copiado!') : t('common_copy', 'Copiar')}
                        onClick={() => handleCopy(safeAccount.login, 'login')}
                        onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' fill='%23555'/%3E%3C/svg%3E";
                        }}
                      />
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-700 rounded-md p-2 sm:p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t('tradingDashboard_investorPassLabel')}</span>
                  <span className="text-gray-300 underline cursor-pointer">{t('tradingDashboard_setPasswordButton')}</span> {/* Added cursor-pointer */}
                </div>
              </div>
              
              <div className="border border-gray-700 rounded-md p-2 sm:p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t('tradingDashboard_masterPassLabel')}</span>
                  <div className="flex items-center">
                    <span className="mr-1.5 sm:mr-2">{safeAccount.masterPassword}</span>
                      <img
                        src="/Visibilidad.png"
                        alt={t('tradingDashboard_iconAlt_visibility', 'Visibility')}
                        className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer"
                        title={copiedMasterPass ? t('common_copied', 'Copiado!') : t('common_copy', 'Copiar')}
                        onClick={() => handleCopy(safeAccount.masterPassword, 'master')}
                        onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' fill='%23555'/%3E%3C/svg%3E";
                        }}
                      />
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-700 rounded-md p-2 sm:p-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-gray-400">Server</span>
                    <span className="">Alpha global market - demo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de balance y métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="lg:col-span-2 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#434242] border border-[#333] rounded-xl">
          <div className="flex flex-wrap justify-between items-center mb-2 sm:mb-4 gap-2">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold">{t('tradingDashboard_balanceChartTitle')}</h2>
          </div>
          <div className="flex flex-wrap items-center mb-4 sm:mb-6 gap-x-3 gap-y-1">
            <span className="text-xl sm:text-2xl md:text-4xl font-bold mr-1 sm:mr-3">{formatCurrency(safeAccount.currentBalance)}</span>
            <span className={`bg-green-800 bg-opacity-30 text-green-400 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm whitespace-nowrap`}>{formatPercentage(safeAccount.balanceGrowth)}</span>
          </div>
          
          <div className="w-full aspect-video sm:aspect-square max-h-[300px] sm:max-h-[400px] md:max-h-[500px]">
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

        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{t('tradingDashboard_profitLossWidgetTitle')}</h2>
            <div className="flex flex-wrap items-center mb-0.5 sm:mb-1 gap-x-2 gap-y-1">
              <span className="text-lg sm:text-xl md:text-2xl font-bold mr-1 sm:mr-3">{formatCurrency(safeAccount.profit)}</span>
              <span className={`bg-green-800 bg-opacity-30 text-green-400 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm whitespace-nowrap`}>{formatPercentage(safeAccount.profitGrowth)}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">{currentDate}</p>
          </div> 
          <div className="p-3 sm:p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-1.5 sm:mb-2 gap-1 xs:gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-bold whitespace-nowrap">{t('tradingDashboard_drawdownWidgetTitle')}</h2>
              <div className="flex text-xs sm:text-sm flex-shrink-0">
                <button 
                  onClick={() => setDrawdownType('total')} 
                  className={`px-2 py-1 sm:px-3 rounded-md transition-colors
                    ${drawdownType === 'total' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {t('tradingDashboard_drawdownTypeTotal')}
                </button>
                <div className="border-r border-gray-600 mx-1 h-3 sm:h-4 self-center"></div>
                <button 
                  onClick={() => setDrawdownType('daily')} 
                  className={`px-2 py-1 sm:px-3 rounded-md transition-colors
                    ${drawdownType === 'daily' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {t('tradingDashboard_drawdownTypeDaily')}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center mb-0.5 sm:mb-1 gap-x-2 gap-y-1">
              <span className="text-lg sm:text-xl md:text-2xl font-bold mr-1 sm:mr-3">
                {drawdownType === 'daily' ? formatCurrency(safeAccount.dailyDrawdown) : formatCurrency(safeAccount.totalDrawdown)} 
              </span>
              <span className={`bg-green-800 bg-opacity-30 text-green-400 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm whitespace-nowrap`}>
                {drawdownType === 'daily' ? formatPercentage(safeAccount.dailyDrawdownPercentage) : formatPercentage(safeAccount.totalDrawdownPercentage)} 
              </span>
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{t('tradingDashboard_tradingDaysWidgetTitle')}</h2>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{safeAccount.tradingDays.current} {t('tradingDashboard_daysLabel')}</div>
          </div>
        </div>
      </div>

      {/* Sección de métricas detalladas (Pérdida Promedio, Ganancia Promedio, etc.) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Pérdida Promedio Por Operación */}
        <div className="p-3 sm:p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-medium mb-0.5 sm:mb-1">{t('tradingDashboard_avgLossPerOperation')}</h3>
            <div className="flex items-baseline">
              <span className="text-lg sm:text-xl md:text-2xl font-bold mr-1.5 sm:mr-2">{formatCurrency(safeAccount.avgLossPerOperation)}</span>
              <span className={`bg-red-800 bg-opacity-30 text-red-400 px-1.5 py-0.5 rounded text-2xs xs:text-xs`}>{formatPercentage(safeAccount.avgLossPercentage)}</span>
            </div>
          </div>
          <div className="bg-[#2d2d2d] rounded-full ml-2 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <img src="/loss.png" alt={t('tradingDashboard_iconAlt_loss')} className="w-3/4 h-3/4 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M7 17L17 7M17 7H11M17 7V13' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"; }} />
          </div>
        </div>

        {/* Ganancia Promedio Por Operación */}
        <div className="p-3 sm:p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-medium mb-0.5 sm:mb-1">{t('tradingDashboard_avgProfitPerOperation')}</h3>
            <div className="flex items-baseline">
              <span className="text-lg sm:text-xl md:text-2xl font-bold mr-1.5 sm:mr-2">{formatCurrency(safeAccount.avgProfitPerOperation)}</span>
              <span className={`text-green-400 px-1.5 py-0.5 rounded text-2xs xs:text-xs bg-green-800 bg-opacity-30`}>{formatPercentage(safeAccount.avgProfitPercentage)}</span>
            </div>
          </div>
          <div className="bg-[#2d2d2d] rounded-full ml-2 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <img src="/gain.png" alt={t('tradingDashboard_iconAlt_coins')} className="w-3/4 h-3/4 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 6L12 18M9 10L15 10M9 14L15 14' stroke='white' stroke-width='2'/%3E%3C/svg%3E"; }} />
          </div>
        </div>

        {/* Lotaje Promedio Por Operación */}
        <div className="p-3 sm:p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-medium mb-0.5 sm:mb-1">{t('tradingDashboard_avgLotPerOperation')}</h3>
            <span className="text-lg sm:text-xl md:text-2xl font-bold">{safeAccount.avgLotPerOperation.toFixed(2)}</span>
          </div>
          <div className="bg-[#2d2d2d] rounded-full ml-2 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <img src="/graph.png" alt={t('tradingDashboard_iconAlt_lot')} className="w-5/6 h-5/6 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M4 12L12 4L20 12L12 20L4 12Z' stroke='white' stroke-width='2'/%3E%3Cpath d='M8 12L12 8L16 12L12 16L8 12Z' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E"; }} />
          </div>
        </div>
        
        {/* Duración Promedio Por Operación */}
        <div className="p-3 sm:p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-medium mb-0.5 sm:mb-1">{t('tradingDashboard_avgTradeDuration')}</h3>
            <span className="text-lg sm:text-xl md:text-2xl font-bold">{safeAccount.avgTradeDuration}</span>
          </div>
          <div className="bg-[#2d2d2d] rounded-full ml-2 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <img src="/clock.png" alt={t('tradingDashboard_iconAlt_clock')} className="w-3/4 h-3/4 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 6v6l4 2' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"; }} />
          </div>
        </div>

        {/* Relación Riesgo Beneficio */}
        <div className="p-3 sm:p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-medium mb-0.5 sm:mb-1">{t('tradingDashboard_riskRewardRatio')}</h3>
            <span className="text-lg sm:text-xl md:text-2xl font-bold">{safeAccount.riskRewardRatio.toFixed(2)}:1</span>
          </div>
          <div className="bg-[#2d2d2d] rounded-full ml-2 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <img src="/victory.png" alt={t('tradingDashboard_iconAlt_ratio')} className="w-3/4 h-3/4 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z' fill='white'/%3E%3C/svg%3E"; }} />
          </div>
        </div>

        {/* Ratio De Ganancia */}
        <div className="p-3 sm:p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-medium mb-0.5 sm:mb-1">{t('tradingDashboard_winRate')}</h3>
            <span className="text-lg sm:text-xl md:text-2xl font-bold">{safeAccount.winRate.toFixed(2)}%</span>
          </div>
          <div className="bg-[#2d2d2d] rounded-full ml-2 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <img src="/coins.png" alt={t('tradingDashboard_iconAlt_winRate')} className="w-3/4 h-3/4 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23333'/%3E%3Cpath d='M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M12 4V12H20A8 8 0 0 1 12 20V12H4A8 8 0 0 1 12 4Z' fill='white'/%3E%3C/svg%3E"; }} />
          </div>
        </div>
      </div>

      {/* Sección de Objetivos */}
      <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">{t('tradingDashboard_objectivesTitle')}</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 lg:mb-6">
          {/* Daily Loss Limit Card */}
          <div className="p-3 sm:p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex flex-wrap justify-between items-center mb-2 sm:mb-4 gap-1">
              <h3 className="text-sm sm:text-base md:text-lg font-medium">{t('tradingDashboard_dailyLossLimitTitle')}</h3>
              <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-2xs xs:text-xs whitespace-nowrap ${
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
            <div className="flex justify-between items-center mb-1 sm:mb-2 text-xs sm:text-sm">
              <span className="text-gray-400">{t('tradingDashboard_maxLossLimitLabel')}</span>
              <span>{formatCurrency(safeAccount.maxLossLimit)}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-400">{t('tradingDashboard_allowedLossTodayLabel')}</span>
              <span>{formatCurrency(safeAccount.allowedLossToday)}</span>
            </div>
            <div className="mt-2 text-2xs xs:text-xs text-gray-500">
              {t('tradingDashboard_daily_loss_explanation')}
            </div>
          </div>
          
          {/* Global Loss Limit Card */}
          <div className="p-3 sm:p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex flex-wrap justify-between items-center mb-2 sm:mb-4 gap-1">
              <h3 className="text-sm sm:text-base md:text-lg font-medium">{t('tradingDashboard_globalLossLimitTitle')}</h3>
              <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-2xs xs:text-xs whitespace-nowrap ${
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
            <div className="flex justify-between items-center mb-1 sm:mb-2 text-xs sm:text-sm">
              <span className="text-gray-400">{t('tradingDashboard_maxLossLimitLabel')}</span>
              <span>{formatCurrency(safeAccount.maxLossLimit)}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-400">{t('tradingDashboard_allowedLossTodayLabel')}</span>
              <span>{formatCurrency(safeAccount.allowedLossToday)}</span>
            </div>
            <div className="mt-2 text-2xs xs:text-xs text-gray-500">
              {t('tradingDashboard_global_loss_explanation')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Min Trading Days Card */}
          <div className="p-3 sm:p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex flex-wrap justify-between items-center mb-2 sm:mb-4 gap-1">
              <h3 className="text-sm sm:text-base md:text-lg font-medium">{t('tradingDashboard_minTradingDaysTitle')}</h3>
              <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-2xs xs:text-xs whitespace-nowrap ${
                safeAccount.tradingDays.current >= safeAccount.tradingDays.min
                  ? 'bg-green-800 bg-opacity-30 text-green-400'
                  : 'bg-yellow-800 bg-opacity-30 text-yellow-400'
              }`}>
                {safeAccount.tradingDays.current >= safeAccount.tradingDays.min
                  ? t('tradingDashboard_status_surpassed')
                  : t('tradingDashboard_status_inProgress')}
              </span>
            </div>
            <div className="flex justify-between items-center mb-1 sm:mb-2 text-xs sm:text-sm">
              <span className="text-gray-400">{t('tradingDashboard_minimumLabel')}</span>
              <span>{safeAccount.tradingDays.min} {t('tradingDashboard_daysLabel')}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-400">{t('tradingDashboard_currentResultLabel')}</span>
              <span>{safeAccount.tradingDays.current} {t('tradingDashboard_daysLabel')}</span>
            </div>
            <div className="mt-2 text-2xs xs:text-xs text-gray-500">
              {t('tradingDashboard_min_days_explanation')}
            </div>
          </div>
          
          {/* Profit Target Card */}
          <div className="p-3 sm:p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex flex-wrap justify-between items-center mb-2 sm:mb-4 gap-1">
              <h3 className="text-sm sm:text-base md:text-lg font-medium">{t('tradingDashboard_profitTargetTitle')}</h3>
              <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-2xs xs:text-xs whitespace-nowrap ${
                safeAccount.currentProfit >= safeAccount.minProfitTarget
                  ? 'bg-green-800 bg-opacity-30 text-green-400'
                  : 'bg-yellow-800 bg-opacity-30 text-yellow-400'
              }`}>
                {safeAccount.currentProfit >= safeAccount.minProfitTarget
                  ? t('tradingDashboard_status_surpassed')
                  : t('tradingDashboard_status_inProgress')}
              </span>
            </div>
            <div className="flex justify-between items-center mb-1 sm:mb-2 text-xs sm:text-sm">
              <span className="text-gray-400">{t('tradingDashboard_minimumLabel')}</span>
              <span>{formatCurrency(safeAccount.minProfitTarget)}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-400">{t('tradingDashboard_currentResultLabel')}</span>
              <span>{formatCurrency(safeAccount.currentProfit)}</span>
            </div>
            <div className="mt-2 text-2xs xs:text-xs text-gray-500">
              {t('tradingDashboard_profit_target_explanation')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de operaciones */}
      <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl flex-1 flex flex-col">
        <div className="flex flex-wrap justify-between items-center mb-3 sm:mb-4 gap-2">
          <h2 className="text-base sm:text-lg md:text-xl font-bold">{t('tradingDashboard_operationsTableTitle')}</h2>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4 rounded-md transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
            {t('tradingDashboard_downloadCsvButton')}
          </button>
                        </div>

        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm sm:text-base">{t('common_loading')}</p>
                        </div>
        )}
        {error && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-500 text-sm sm:text-base">{t('common_errorLoadingData')}</p>
                      </div>
        )}
        {!isLoading && !error && operationsData.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm sm:text-base">{t('tradingDashboard_noOperationsFound')}</p>
                      </div>
        )}

        {!isLoading && !error && operationsData.length > 0 && (
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[#2c2c2c]">
                <tr>
                  {[
                    t('tradingDashboard_tableHeader_ticket'), 
                    t('tradingDashboard_tableHeader_openTime'), 
                    t('tradingDashboard_tableHeader_type'), 
                    t('tradingDashboard_tableHeader_volume'), 
                    t('tradingDashboard_tableHeader_symbol'), 
                    t('tradingDashboard_tableHeader_openPrice'), 
                    t('tradingDashboard_tableHeader_stopLoss'), 
                    t('tradingDashboard_tableHeader_takeProfit'), 
                    t('tradingDashboard_tableHeader_closeTime'), 
                    t('tradingDashboard_tableHeader_closePrice'), 
                    t('tradingDashboard_tableHeader_profit')
                  ].map((header, index) => (
                    <th key={index} scope="col" className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 text-left text-2xs xs:text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[#333] divide-y divide-gray-600">
                {operationsData.map((op, index) => (
                  <tr key={index} className="hover:bg-[#3a3a3a] transition-colors">
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 whitespace-nowrap text-2xs xs:text-xs sm:text-sm text-gray-200">{op.ticket}</td>
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 whitespace-nowrap text-2xs xs:text-xs sm:text-sm text-gray-400">{formatOperationDate(op.openTime)}</td>
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 whitespace-nowrap text-2xs xs:text-xs sm:text-sm text-gray-200">{op.type}</td>
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 whitespace-nowrap text-2xs xs:text-xs sm:text-sm text-gray-200">{op.volume.toFixed(2)}</td>
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 whitespace-nowrap text-2xs xs:text-xs sm:text-sm text-gray-200">{op.symbol}</td>
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 whitespace-nowrap text-2xs xs:text-xs sm:text-sm text-gray-200">{formatCurrency(op.openPrice)}</td>
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 whitespace-nowrap text-2xs xs:text-xs sm:text-sm text-gray-200">{formatCurrency(op.stopLoss)}</td>
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 whitespace-nowrap text-2xs xs:text-xs sm:text-sm text-gray-200">{formatCurrency(op.takeProfit)}</td>
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 whitespace-nowrap text-2xs xs:text-xs sm:text-sm text-gray-400">{formatOperationDate(op.closeTime)}</td>
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 whitespace-nowrap text-2xs xs:text-xs sm:text-sm text-gray-200">{formatCurrency(op.closePrice)}</td>
                    <td className={`px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 whitespace-nowrap text-2xs xs:text-xs sm:text-sm ${op.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(op.profit)}
                  </td>
                </tr>
                ))}
            </tbody>
            </table>
                    </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;