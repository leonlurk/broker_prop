import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useAuth } from '../contexts/AuthContext'; // Importar el contexto de autenticación
import { getTranslator } from '../utils/i18n'; // Added
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { createBalanceSnapshot, updateBalanceWithHistory } from '../utils/historyUtils';

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
  const [copiedInvestorPass, setCopiedInvestorPass] = useState(false);
  const [copiedServer, setCopiedServer] = useState(false);
  const [showInvestorPass, setShowInvestorPass] = useState(false);
  const [accountMt5Info, setAccountMt5Info] = useState(null);
  const [mt5Operations, setMt5Operations] = useState([]);
  const [accountHistory, setAccountHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    setCurrentDate(formatDate(today, language, t));
  }, [language, t]);

  // Fetch account data from Firebase
  const fetchAccountData = async () => {
    setIsLoading(true);
    setError(null); // Reset error state before fetching
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
        
        generateBalanceData(accountData, drawdownType); // Pass drawdownType here
      } else {
        console.error("Account document not found");
        setError(t('tradingDashboard_accountNotFound', 'Account details could not be loaded.'));
      }
    } catch (error) {
      console.error("Error fetching account data:", error);
      setError(error.message || t('common_errorLoadingData', 'Error loading data'));
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

  // Generate balance data from real MT5 data
  const generateBalanceData = (account, type) => {
    if (!account || !accountMt5Info) {
      // Create placeholder data if no MT5 data exists
      const initialBalance = getChallengeAmount(account) || 100000;
      let data = [];

      if (type === 'total') {
        // Generate monthly placeholder data
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
        data = monthNames.map((month, index) => ({
          name: month,
          value: initialBalance + (index * 1000) // Add some variation
        }));
      } else {
        // Generate daily placeholder data for current month
        const daysInMonth = 30;
        for (let i = 1; i <= daysInMonth; i++) {
          data.push({ 
            name: `Day ${i}`, 
            value: initialBalance + (i * 100) // Add some variation
          });
        }
      }
      
      setBalanceData(data);
      return;
    }

    const initialBalance = getChallengeAmount(account);
    const currentBalance = accountMt5Info.balance;
    const profit = accountMt5Info.profit;
    const equity = accountMt5Info.equity;
    const margin = accountMt5Info.margin;
    
    // Initialize with starting point
    let chartData = [];
    
    if (type === 'total') {
      // Generate monthly data points
      const months = 9; // Show last 9 months
      const balanceChange = (currentBalance - initialBalance) / months;
      
      for (let i = 0; i < months; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (months - i - 1));
        
        chartData.push({
          name: date.toLocaleString('default', { month: 'short' }),
          value: initialBalance + (balanceChange * i)
        });
      }
    } else { // daily chart
      // Generate daily data points
      const days = 30; // Show last 30 days
      const balanceChange = (currentBalance - initialBalance) / days;
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        
        chartData.push({
          name: `Day ${date.getDate()}`,
          value: initialBalance + (balanceChange * i)
        });
      }
    }
    
    // Ensure we have at least one data point
    if (chartData.length === 0) {
      chartData = [{
        name: type === 'total' ? 'Start' : 'Day 1',
        value: initialBalance
      }];
    }
    
    setBalanceData(chartData);
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
    
    // Normalize strings to lowercase for comparison
    const normalizeString = (str) => {
      if (!str) return '';
      return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const challengeType = normalizeString(account.challengeType);
    const accountType = normalizeString(account.accountType);
    const accountStyle = normalizeString(account.accountStyle);
    const originalType = normalizeString(account.originalChallengeType);

    // First priority: Check originalChallengeType (direct user selection from UI)
    if (originalType === 'estandar' || originalType === 'standard') {
      return t('tradingChallenge_button_standard');
    }
    if (originalType === 'swing') {
      return t('tradingChallenge_button_swim');
    }
    
    // Second priority: Check challengeType
    if (challengeType === 'estandar' || challengeType === 'standard') {
      return t('tradingChallenge_button_standard');
    }
    if (challengeType === 'swing') {
      return t('tradingChallenge_button_swim');
    }
    
    // Third priority: Check accountType/accountStyle
    if (accountType === 'swing' || accountStyle === 'swing') {
      return t('tradingChallenge_button_swim');
    }
    if (accountType === 'standard' || accountStyle === 'standard' || 
        accountType === 'estandar' || accountStyle === 'estandar') {
      return t('tradingChallenge_button_standard');
    }
    
    // Fourth priority: Check for two_step/one_step
    if (challengeType === 'two_step' || challengeType === 'two step') {
      // For two_step accounts, check if it's Swing
      if (
        (account.selectedProfitTargetP2 && !account.selectedProfitTargetP1) ||
        String(account.challengePhase).toLowerCase().includes('swing')
      ) {
        return t('tradingChallenge_button_swim');
      }
      return t('tradingChallenge_button_standard');
    }
    
    // If explicitly one_step, it's Standard
    if (challengeType === 'one_step' || challengeType === 'one step') {
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
    console.log("Using default account type (Standard) for account:", account);
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
      } else if (type === 'investor') {
        setCopiedInvestorPass(true);
        setTimeout(() => setCopiedInvestorPass(false), 1500);
      } else if (type === 'server') {
        setCopiedServer(true);
        setTimeout(() => setCopiedServer(false), 1500);
      }
    });
  };

  // Toggle investor password visibility
  const toggleInvestorPassVisibility = () => {
    setShowInvestorPass(!showInvestorPass);
  };

  // Función de prueba para crear snapshot manual


  // Configuración por tipo de challenge y fase
  const getChallengeConfig = (account) => {
    const baseAmount = getChallengeAmount(account);
    const phase = account.challengePhase || "1 FASE";
    
         // Configuraciones estándar por fase según especificaciones del usuario
     const configs = {
       "1 FASE": {
         profitTarget: baseAmount * 0.10,    // 10% - Profit Target
         maxDailyLoss: baseAmount * 0.05,    // 5% del Balance Inicial - Daily Loss Limit
         maxTotalLoss: baseAmount * 0.10,    // 10% del Balance Inicial - Global Loss Limit
         minTradingDays: 5                   // 5 días - Minimum Trading Days
       },
       "2 FASE": {
         profitTarget: baseAmount * 0.05,    // 5%
         maxDailyLoss: baseAmount * 0.05,    // 5%
         maxTotalLoss: baseAmount * 0.10,    // 10%
         minTradingDays: 5
       },
       "FUNDED": {
         profitTarget: baseAmount * 0.05,    // 5% mensual
         maxDailyLoss: baseAmount * 0.05,    // 5%
         maxTotalLoss: baseAmount * 0.10,    // 10%
         minTradingDays: 1
       }
     };
    
    return configs[phase] || configs["1 FASE"];
  };

  // Calcular métricas automáticamente basadas en balance inicial vs actual
  const calculateAutoMetrics = (account, accountMt5Info, historyData = []) => {
    if (!account) return {};
    
    const initialBalance = getChallengeAmount(account);
    const currentBalance = accountMt5Info?.balance ?? account.balanceActual ?? initialBalance;
    const createdDate = account.createdAt?.toDate();
    
    // Nueva lógica para días de trading
    let activeTradingDays = 0;
    let firstTradeDate = null;
    
    if (currentBalance !== initialBalance) {
      // Buscar el primer día en que el balance cambió
      let firstChangeDate = null;
      if (historyData && historyData.length > 0) {
        // Buscar el primer snapshot donde balance != initialBalance
        const sortedHistory = [...historyData].sort((a, b) => {
          const dateA = a.timestamp?.toDate?.() || new Date(a.timestamp);
          const dateB = b.timestamp?.toDate?.() || new Date(b.timestamp);
          return dateA - dateB;
        });
        for (let i = 0; i < sortedHistory.length; i++) {
          const snap = sortedHistory[i];
          if (snap.balance !== initialBalance) {
            firstChangeDate = snap.timestamp?.toDate?.() || new Date(snap.timestamp);
            break;
          }
        }
      }
      // Si no hay historial, usar la fecha de creación
      if (!firstChangeDate) {
        firstChangeDate = createdDate;
      }
      firstTradeDate = firstChangeDate;
      // Calcular días desde el primer cambio de balance hasta hoy (incluyendo el día de cambio)
      const today = new Date();
      const diffTime = today.setHours(0,0,0,0) - firstChangeDate.setHours(0,0,0,0);
      activeTradingDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else {
      // Si el balance nunca cambió, no hay días de trading
      activeTradingDays = 0;
      firstTradeDate = null;
    }
    
    const today = new Date();
    const daysSinceCreation = createdDate ? Math.floor((today - createdDate) / (1000 * 60 * 60 * 24)) : 0;
    
    // Profit/Loss básico
    const totalProfit = currentBalance - initialBalance;
    const totalProfitPercentage = initialBalance ? (totalProfit / initialBalance) * 100 : 0;
    
    // Configuración de límites
    const limits = getChallengeConfig(account);
    
         // Drawdown total (pérdida acumulada desde el inicio)
     const totalDrawdown = totalProfit < 0 ? Math.abs(totalProfit) : 0;
     const totalDrawdownPercentage = totalProfit < 0 ? Math.abs(totalProfitPercentage) : 0;
     
     // Daily Loss: pérdida específica del día actual (placeholder - se calcularía con datos reales de operaciones)
     // Por ahora usamos una aproximación basada en el total dividido entre días activos
     const dailyLoss = activeTradingDays > 0 && totalProfit < 0 ? 
       Math.abs(totalProfit) / activeTradingDays : 0;
    
    // Métricas de rendimiento
    const avgDailyReturn = activeTradingDays > 0 ? totalProfitPercentage / activeTradingDays : 0;
    const monthlyReturn = avgDailyReturn * 30;
    const annualizedReturn = avgDailyReturn * 365;
    
    // Progreso hacia objetivos
    const profitProgress = (totalProfit / limits.profitTarget) * 100;
    const targetReached = totalProfit >= limits.profitTarget;
    
         // Estado vs límites
     const totalDrawdownProgress = (totalDrawdown / limits.maxTotalLoss) * 100;
     const dailyLossProgress = (dailyLoss / limits.maxDailyLoss) * 100;
     const isApproachingDailyLimit = dailyLoss > (limits.maxDailyLoss * 0.8);
     const isApproachingTotalLimit = totalDrawdown > (limits.maxTotalLoss * 0.8);
     const canStillTrade = totalDrawdown < limits.maxTotalLoss && dailyLoss < limits.maxDailyLoss;
    
    // Días requeridos para alcanzar objetivo (si está perdiendo)
    const requiredDailyReturn = activeTradingDays > 0 && totalProfit < limits.profitTarget ? 
      ((limits.profitTarget - totalProfit) / initialBalance * 100) / 30 : 0; // Asumiendo 30 días para alcanzar
    
         // Estado de la cuenta
     let accountStatus = 'active';
     if (!canStillTrade) accountStatus = 'breached';
     else if (targetReached) accountStatus = 'target_reached';
     else if (isApproachingDailyLimit || isApproachingTotalLimit) accountStatus = 'at_risk';
     else if (totalProfit > 0) accountStatus = 'profitable';
     else if (totalProfit < 0) accountStatus = 'losing';
    
    // Simulación básica de métricas de trading (pendiente de operaciones reales)
    // Estas se calcularían con datos reales de operaciones cuando estén disponibles
    const avgLotPerOperation = 0.1; // Placeholder
    const avgTradeDuration = '02:30:00'; // Placeholder
    const riskRewardRatio = 1.5; // Placeholder
    const winRate = 65; // Placeholder
    
    return {
      // Balance
      initialBalance,
      currentBalance,
      
      // Profit/Loss
      totalProfit,
      totalProfitPercentage,
      profitGrowth: totalProfitPercentage, // Alias para compatibilidad
      
             // Drawdown
       dailyDrawdown: dailyLoss, // Pérdida específica del día
       totalDrawdown: totalDrawdown, // Pérdida acumulada total
       drawdownPercentage: totalDrawdownPercentage,
       dailyLossProgress: dailyLossProgress,
       totalDrawdownProgress: totalDrawdownProgress,
      
      // Tiempo
      daysSinceCreation,
      activeTradingDays,
      
      // Rendimiento
      avgDailyReturn,
      monthlyReturn,
      annualizedReturn,
      
      // Objetivos
      profitTarget: limits.profitTarget,
      profitProgress,
      targetReached,
      
             // Límites
       maxDailyLoss: limits.maxDailyLoss,
       maxTotalLoss: limits.maxTotalLoss,
       allowedLossToday: Math.max(0, limits.maxDailyLoss - dailyLoss), // Pérdida restante permitida hoy
       allowedLossTotal: Math.max(0, limits.maxTotalLoss - totalDrawdown), // Pérdida restante permitida total
       minTradingDays: limits.minTradingDays,
       
       // Estado
       accountStatus,
       isApproachingDailyLimit,
       isApproachingTotalLimit,
       canStillTrade,
       requiredDailyReturn,
      
      // Métricas de trading (placeholder hasta tener operaciones reales)
      avgLossPerOperation: totalProfit < 0 ? totalProfit / Math.max(1, activeTradingDays) : 0,
      avgProfitPerOperation: totalProfit > 0 ? totalProfit / Math.max(1, activeTradingDays) : 0,
      avgLotPerOperation,
      avgTradeDuration,
      riskRewardRatio,
      winRate,
      
      // Metadata
      lastCalculated: new Date()
    };
  };

  // Calcular métricas reactivamente cuando cambie account, MT5 info o historial
  const realMetrics = useMemo(() => {
    return calculateAutoMetrics(account, accountMt5Info, accountHistory);
  }, [account, accountMt5Info, accountHistory]);
  
  // Log para debugging - mostrar métricas calculadas automáticamente
  useEffect(() => {
    if (realMetrics && Object.keys(realMetrics).length > 0) {
      console.log('📊 Métricas KPIs calculadas automáticamente:', {
        '💰 Balance': {
          inicial: formatCurrency(realMetrics.initialBalance),
          actual: formatCurrency(realMetrics.currentBalance),
          profit: formatCurrency(realMetrics.totalProfit),
          profitPorcentaje: realMetrics.totalProfitPercentage?.toFixed(2) + '%'
        },
        '📉 Daily Loss Limit (5% Balance Inicial)': {
          limite: formatCurrency(realMetrics.maxDailyLoss),
          perdidaHoy: formatCurrency(realMetrics.dailyDrawdown),
          permitidaHoy: formatCurrency(realMetrics.allowedLossToday),
          progreso: realMetrics.dailyLossProgress?.toFixed(2) + '%'
        },
        '📊 Global Loss Limit (10% Balance Inicial)': {
          limite: formatCurrency(realMetrics.maxTotalLoss),
          drawdownTotal: formatCurrency(realMetrics.totalDrawdown),
          permitidaTotal: formatCurrency(realMetrics.allowedLossTotal),
          progreso: realMetrics.totalDrawdownProgress?.toFixed(2) + '%'
        },
        '🎯 Profit Target (10%)': {
          objetivo: formatCurrency(realMetrics.profitTarget),
          profitActual: formatCurrency(realMetrics.totalProfit),
          progreso: realMetrics.profitProgress?.toFixed(2) + '%',
          alcanzado: realMetrics.targetReached ? '✅' : '❌'
        },
        '📅 Trading Days': {
          minimo: realMetrics.minTradingDays + ' días',
          actual: realMetrics.activeTradingDays + ' días',
          cumplido: realMetrics.activeTradingDays >= realMetrics.minTradingDays ? '✅' : '❌'
        },
        '⚠️ Estado': realMetrics.accountStatus,
        '📊 Historial': `${accountHistory.length} snapshots`
      });
    }
  }, [realMetrics.currentBalance, realMetrics.totalProfit, realMetrics.accountStatus, accountHistory.length]);

  // Debug: Log cuando balanceData cambia
  useEffect(() => {
    console.log('🔄 balanceData state updated:', {
      length: balanceData.length,
      data: balanceData.slice(0, 3) // Primeros 3 elementos
    });
  }, [balanceData]);

  // Función para obtener datos reales de MT5
  const fetchMt5AccountInfo = async (login) => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`/.netlify/functions/mt5-proxy/api/accounts/${login}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('No se pudo obtener info MT5');
      const data = await response.json();
      setAccountMt5Info(data);
    } catch (err) {
      console.error('Error obteniendo info MT5:', err);
      setAccountMt5Info(null);
    }
  };

  // Función para obtener historial de operaciones reales de MT5
  const fetchMt5Operations = async (login, fromDate, toDate) => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('/.netlify/functions/mt5-proxy/accounts/history', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login: Number(login),
          from_date: fromDate,
          to_date: toDate
        })
      });
      if (!response.ok) throw new Error('No se pudo obtener historial MT5');
      const data = await response.json();
      setMt5Operations(data.operations || []);
    } catch (err) {
      console.error('Error obteniendo historial MT5:', err);
      setMt5Operations([]);
    }
  };

  // Función para cargar historial de la cuenta
  const fetchAccountHistory = async (accountId) => {
    try {
      setHistoryLoading(true);
      
      // Intentar consulta con índice primero
      try {
        const historyQuery = query(
          collection(db, 'accountHistory'),
          where('accountId', '==', accountId),
          orderBy('timestamp', 'desc')
        );
        
        const historySnapshot = await getDocs(historyQuery);
        const history = [];
        
        historySnapshot.forEach(doc => {
          history.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('📊 Account history loaded:', history.length, 'snapshots');
        setAccountHistory(history);
        
        // Generar gráfico simple con balance inicial y actual
        generateSimpleBalanceChart(account, accountMt5Info);
        
      } catch (indexError) {
        if (indexError.code === 'failed-precondition') {
          console.warn('⚠️ Índice no disponible, usando consulta simple:', indexError.message);
          console.log('💡 Crea el índice en: https://console.firebase.google.com/project/ape-prop/firestore/indexes');
          
          // Fallback: consulta simple sin orderBy
          const simpleQuery = query(
            collection(db, 'accountHistory'),
            where('accountId', '==', accountId)
          );
          
          const snapshot = await getDocs(simpleQuery);
          const history = [];
          
          snapshot.forEach(doc => {
            history.push({ id: doc.id, ...doc.data() });
          });
          
          // Ordenar manualmente por timestamp
          history.sort((a, b) => {
            const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
            const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
            return timeB - timeA; // Descendente
          });
          
          console.log('📊 Account history loaded (fallback):', history.length, 'snapshots');
          
          // Log de muestra de snapshots para debugging
          if (history.length > 0) {
            console.log('📊 Muestra de snapshots del historial:', history.slice(0, 3).map(snapshot => ({
              date: snapshot.timestamp?.toDate?.()?.toLocaleDateString() || 'No date',
              balance: snapshot.balanceActual,
              id: snapshot.id?.substring(0, 8) || 'No ID'
            })));
          }
          
          setAccountHistory(history);
          
          // Generar gráfico simple con balance inicial y actual
          generateSimpleBalanceChart(account, accountMt5Info);
        } else {
          throw indexError;
        }
      }
      
    } catch (error) {
      console.error('❌ Error loading account history:', error);
      setAccountHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Generar gráfico simple: Balance inicial → Balance actual
  const generateSimpleBalanceChart = (account, accountMt5Info) => {
    if (!account) {
      console.log('📈 No hay datos de cuenta para generar gráfico');
      setBalanceData([]);
      return;
    }

    const initialBalance = getChallengeAmount(account);
    let currentBalance = accountMt5Info?.balance ?? account.balanceActual ?? account.currentBalance ?? initialBalance;
    
    // TEMPORAL: Forzar ganancia para probar que el gráfico funciona
    // currentBalance = initialBalance + 15000; // Descomenta esta línea para forzar ganancia
    
    // Crear 2 puntos: inicial y actual
    const chartData = [
      {
        name: 'Inicio',
        value: initialBalance,
        date: account.createdAt?.toDate?.()?.toLocaleDateString('es-ES') || 'Fecha inicial',
        timestamp: account.createdAt
      },
      {
        name: 'Actual',
        value: currentBalance,
        date: new Date().toLocaleDateString('es-ES'),
        timestamp: new Date()
      }
    ];
    
    console.log('📈 Gráfico simple generado: Balance inicial → Balance actual', {
      inicial: formatCurrency(initialBalance),
      actual: formatCurrency(currentBalance),
      diferencia: formatCurrency(currentBalance - initialBalance),
      direccion: currentBalance > initialBalance ? '📈 SUBIENDO (ganancia)' : '📉 BAJANDO (pérdida)',
      puntos: chartData.length,
      datos: chartData
    });
    
    setBalanceData(chartData);
  };

  // FUNCIÓN TEMPORAL DE TEST: Forzar datos con ganancia para verificar que el gráfico funciona
  const generateTestProfitChart = () => {
    const chartData = [
      {
        name: 'Inicio',
        value: 200000, // $200k inicial
        date: '1 Jun 2024',
        timestamp: new Date('2024-06-01')
      },
      {
        name: 'Actual',
        value: 220000, // $220k actual (ganancia de $20k)
        date: new Date().toLocaleDateString('es-ES'),
        timestamp: new Date()
      }
    ];
    
    console.log('🧪 TEST: Gráfico con ganancia forzada', {
      inicial: '$200,000',
      actual: '$220,000',
      diferencia: '+$20,000',
      direccion: '📈 SUBIENDO (ganancia)',
      puntos: chartData.length,
      datos: chartData
    });
    
    setBalanceData(chartData);
  };

  // Lógica para obtener el login MT5 desde Firestore (accountNumber)
  useEffect(() => {
    if (account && account.accountNumber) {
      fetchMt5AccountInfo(account.accountNumber);
      // Por defecto, traer operaciones del último mes
      const today = new Date();
      const toDate = today.toISOString().slice(0, 10);
      const fromDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()).toISOString().slice(0, 10);
      fetchMt5Operations(account.accountNumber, fromDate, toDate);
    }
  }, [account]);

  // Cargar historial cuando se selecciona una cuenta
  useEffect(() => {
    if (accountId) {
      fetchAccountHistory(accountId);
    }
  }, [accountId]);

  // Regenerar gráfico cuando cambian los datos
  useEffect(() => {
    if (account) {
      console.log(`🔄 Regenerando gráfico simple`);
      generateSimpleBalanceChart(account, accountMt5Info);
    }
  }, [account, accountMt5Info]);
  
  // Log cuando se actualicen datos MT5
  useEffect(() => {
    if (accountMt5Info) {
      console.log("MT5 datos actualizados:", accountMt5Info);
    }
  }, [accountMt5Info]);
  
  // Actualizar operaciones cuando se reciban de MT5
  useEffect(() => {
    if (mt5Operations && mt5Operations.length > 0) {
      console.log("MT5 operaciones actualizadas:", mt5Operations);
      // Si tienes alguna lógica adicional para procesar operaciones, agrégala aquí
    }
  }, [mt5Operations]);

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

  // Create a safe account object with default values, priorizando datos reales calculados automáticamente
  const safeAccount = {
    id: account.id || '',
    status: account.status || 'Active',
    login: account.login || account.accountNumber || '(No Login)',
    serverType: account.serverType || 'MT5',
    server: account.server || account.serverName || 'AlphaGlobalMarket-Server',
    investorPassword: account.investorPassword || '',
    masterPassword: account.masterPassword || account.masterpass || '********',
    
    // Balance y métricas principales (calculadas automáticamente)
    initialChallengeAmount: realMetrics.initialBalance || 0,
    currentBalance: realMetrics.currentBalance || 0,
    balanceGrowth: realMetrics.profitGrowth || 0,
    profit: realMetrics.totalProfit || 0,
    profitGrowth: realMetrics.profitGrowth || 0,
    
    // Datos MT5 adicionales si están disponibles
    equity: accountMt5Info?.equity ?? account.equity ?? realMetrics.currentBalance ?? 0,
    margin: accountMt5Info?.margin ?? account.margin ?? 0,
    
    // Drawdown calculado automáticamente
    dailyDrawdown: realMetrics.dailyDrawdown || 0,
    dailyDrawdownPercentage: realMetrics.drawdownPercentage || 0,
    totalDrawdown: realMetrics.totalDrawdown || 0,
    totalDrawdownPercentage: realMetrics.drawdownPercentage || 0,
    
    // Métricas de trading (calculadas o placeholders)
    avgLossPerOperation: realMetrics.avgLossPerOperation || 0,
    avgLossPercentage: realMetrics.initialBalance ? (realMetrics.avgLossPerOperation / realMetrics.initialBalance) * 100 : 0,
    avgProfitPerOperation: realMetrics.avgProfitPerOperation || 0,
    avgProfitPercentage: realMetrics.initialBalance ? (realMetrics.avgProfitPerOperation / realMetrics.initialBalance) * 100 : 0,
    avgLotPerOperation: realMetrics.avgLotPerOperation || 0,
    avgTradeDuration: realMetrics.avgTradeDuration || '0m',
    riskRewardRatio: realMetrics.riskRewardRatio || 0,
    winRate: realMetrics.winRate || 0,
    
    // Días de trading (calculados automáticamente)
    tradingDays: {
      current: realMetrics.activeTradingDays || 0,
      min: realMetrics.minTradingDays || 0
    },
    
    // Límites y objetivos (calculados automáticamente)
    maxLossLimit: realMetrics.maxTotalLoss || 0,           // Global Loss Limit (10%)
    maxDailyLoss: realMetrics.maxDailyLoss || 0,           // Daily Loss Limit (5%)
    allowedLossToday: realMetrics.allowedLossToday || 0,   // Pérdida restante permitida hoy
    allowedLossTotal: realMetrics.allowedLossTotal || 0,   // Pérdida restante permitida total
    profitTarget: realMetrics.profitTarget || 0,           // Profit Target (10%)
    profitProgress: realMetrics.profitProgress || 0,
    targetReached: realMetrics.targetReached || false
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
                  <div className="flex items-center">
                    {showInvestorPass ? (
                      <>
                        <span className="mr-1.5 sm:mr-2">{safeAccount.investorPassword || t('tradingDashboard_noPasswordSet')}</span>
                        <img
                          src="/Copy.png"
                          alt={t('tradingDashboard_iconAlt_copy')}
                          className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer mr-1.5"
                          title={copiedInvestorPass ? t('common_copied') : t('common_copy')}
                          onClick={() => handleCopy(safeAccount.investorPassword, 'investor')}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' fill='%23555'/%3E%3C/svg%3E";
                          }}
                        />
                      </>
                    ) : (
                      <span className="text-gray-300 underline cursor-pointer" onClick={toggleInvestorPassVisibility}>
                        {t('tradingDashboard_showPasswordButton')}
                      </span>
                    )}
                    {showInvestorPass && (
                      <img
                        src="/Visibilidad.png"
                        alt={t('tradingDashboard_hidePassword')}
                        className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer"
                        title={t('tradingDashboard_hidePassword')}
                        onClick={toggleInvestorPassVisibility}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' fill='%23555'/%3E%3C/svg%3E";
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-700 rounded-md p-2 sm:p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t('tradingDashboard_masterPassLabel')}</span>
                  <div className="flex items-center">
                    <span className="mr-1.5 sm:mr-2">{safeAccount.masterPassword}</span>
                      <img
                        src="/Copy.png"
                        alt={t('tradingDashboard_iconAlt_copy')}
                        className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer"
                        title={copiedMasterPass ? t('common_copied') : t('common_copy')}
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
                  <span className="text-gray-400">{t('tradingDashboard_mt5ServerLabel')}</span>
                  <div className="flex items-center min-w-0 flex-1 justify-end">
                    <span className="mr-1.5 sm:mr-2 truncate text-sm sm:text-base max-w-[120px] sm:max-w-[200px]" title={safeAccount.server}>{safeAccount.server}</span>
                      <img
                        src="/Copy.png"
                        alt={t('tradingDashboard_iconAlt_copy')}
                        className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer flex-shrink-0"
                        title={copiedServer ? t('common_copied') : t('common_copy')}
                        onClick={() => handleCopy(safeAccount.server, 'server')}
                        onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' fill='%23555'/%3E%3C/svg%3E";
                        }}
                      />
                  </div>
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
          
          <div className="w-full aspect-video sm:aspect-square max-h-[300px] sm:max-h-[400px] md:max-h-[500px] relative">

            
            {balanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={balanceData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  onMouseEnter={() => console.log('📈 Balance data for chart:', balanceData)}
                >
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={safeAccount.profit >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={safeAccount.profit >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    width={50}
                  />
                  <Area
                    type="linear"
                    dataKey="value"
                    stroke={safeAccount.profit >= 0 ? "#10b981" : "#ef4444"}
                    strokeWidth={4}
                    fillOpacity={0.3}
                    fill="url(#colorBalance)"
                    connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-400 mb-2">
                  {t('tradingDashboard_loading_charts', 'Cargando datos del gráfico...')}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{t('tradingDashboard_profitLossWidgetTitle')}</h2>
            <div className="flex flex-wrap items-center mb-0.5 sm:mb-1 gap-x-2 gap-y-1">
              <span className={`text-lg sm:text-xl md:text-2xl font-bold mr-1 sm:mr-3 ${
                safeAccount.profit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>{formatCurrency(safeAccount.profit)}</span>
              <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm whitespace-nowrap ${
                safeAccount.profit >= 0 
                  ? 'bg-green-800 bg-opacity-30 text-green-400' 
                  : 'bg-red-800 bg-opacity-30 text-red-400'
              }`}>{formatPercentage(safeAccount.profitGrowth)}</span>
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
              <span className={`text-lg sm:text-xl md:text-2xl font-bold mr-1 sm:mr-3 ${
                (drawdownType === 'daily' ? safeAccount.dailyDrawdown : safeAccount.totalDrawdown) > 0 
                  ? 'text-red-400' : 'text-gray-300'
              }`}>
                {drawdownType === 'daily' ? formatCurrency(safeAccount.dailyDrawdown) : formatCurrency(safeAccount.totalDrawdown)} 
              </span>
              <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm whitespace-nowrap ${
                (drawdownType === 'daily' ? safeAccount.dailyDrawdown : safeAccount.totalDrawdown) > 0
                  ? 'bg-red-800 bg-opacity-30 text-red-400'
                  : 'bg-gray-800 bg-opacity-30 text-gray-400'
              }`}>
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
                safeAccount.dailyDrawdown >= safeAccount.maxDailyLoss
                  ? 'bg-red-800 bg-opacity-30 text-red-400'
                  : 'bg-yellow-800 bg-opacity-30 text-yellow-400'
              }`}>
                {safeAccount.dailyDrawdown >= safeAccount.maxDailyLoss 
                  ? t('tradingDashboard_status_lost')
                  : t('tradingDashboard_status_inProgress')}
              </span>
            </div>
            <div className="flex justify-between items-center mb-1 sm:mb-2 text-xs sm:text-sm">
              <span className="text-gray-400">Maximum loss limit</span>
              <span>{formatCurrency(safeAccount.maxDailyLoss)}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-400">Allowed loss today</span>
              <span className={safeAccount.dailyDrawdown > 0 ? 'text-red-400' : 'text-green-400'}>
                {formatCurrency(safeAccount.allowedLossToday)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1 text-xs sm:text-sm">
              <span className="text-gray-400">Current daily loss:</span>
              <span className={safeAccount.dailyDrawdown > 0 ? 'text-red-400' : 'text-gray-400'}>
                {formatCurrency(safeAccount.dailyDrawdown)}
              </span>
            </div>
            <div className="mt-2 text-2xs xs:text-xs text-gray-500">
              Maximum daily loss limit
            </div>
          </div>
          
          {/* Global Loss Limit Card */}
          <div className="p-3 sm:p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-xl">
            <div className="flex flex-wrap justify-between items-center mb-2 sm:mb-4 gap-1">
              <h3 className="text-sm sm:text-base md:text-lg font-medium">{t('tradingDashboard_globalLossLimitTitle')}</h3>
              <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-2xs xs:text-xs whitespace-nowrap ${
                safeAccount.totalDrawdown >= safeAccount.maxLossLimit
                  ? 'bg-red-800 bg-opacity-30 text-red-400'
                  : 'bg-yellow-800 bg-opacity-30 text-yellow-400'
              }`}>
                {safeAccount.totalDrawdown >= safeAccount.maxLossLimit 
                  ? t('tradingDashboard_status_lost')
                  : t('tradingDashboard_status_inProgress')}
              </span>
            </div>
            <div className="flex justify-between items-center mb-1 sm:mb-2 text-xs sm:text-sm">
              <span className="text-gray-400">Maximum total loss limit</span>
              <span>{formatCurrency(safeAccount.maxLossLimit)}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-400">Allowed loss total</span>
              <span className={safeAccount.totalDrawdown > 0 ? 'text-red-400' : 'text-green-400'}>
                {formatCurrency(realMetrics.allowedLossTotal || safeAccount.maxLossLimit)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1 text-xs sm:text-sm">
              <span className="text-gray-400">Current drawdown:</span>
              <span className={safeAccount.totalDrawdown > 0 ? 'text-red-400' : 'text-gray-400'}>
                {formatCurrency(safeAccount.totalDrawdown)}
              </span>
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
                   ? 'bg-yellow-800 bg-opacity-30 text-yellow-400'
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
                safeAccount.targetReached
                  ? 'bg-yellow-800 bg-opacity-30 text-yellow-400'
                  : 'bg-yellow-800 bg-opacity-30 text-yellow-400'
              }`}>
                {safeAccount.targetReached 
                  ? t('tradingDashboard_status_surpassed')
                  : t('tradingDashboard_status_inProgress')}
              </span>
            </div>
            <div className="flex justify-between items-center mb-1 sm:mb-2 text-xs sm:text-sm">
              <span className="text-gray-400">{t('tradingDashboard_minimumLabel')}</span>
              <span>{formatCurrency(safeAccount.profitTarget)}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-400">{t('tradingDashboard_currentResultLabel')}</span>
              <span className={safeAccount.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                {formatCurrency(safeAccount.profit)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1 text-xs sm:text-sm">
              <span className="text-gray-400">Progreso:</span>
              <span className={safeAccount.profitProgress >= 0 ? 'text-green-400' : 'text-red-400'}>
                {formatPercentage(safeAccount.profitProgress / 100)}
              </span>
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
          <div className="flex gap-2">
            <button 
              onClick={async () => {
                try {
                  setIsLoading(true);
                  setError(null);
                  // Get the current user's token
                  const token = await currentUser.getIdToken();
                  console.log('Token obtenido, intentando actualizar datos...');
                  
                  // Call the API endpoint to refresh data with auth token
                  const response = await fetch(`/.netlify/functions/mt5-proxy/api/accounts/${accountId}/strategies`, {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                  });
                  
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
                  }
                  
                  const data = await response.json();
                  console.log('Datos actualizados:', data);
                  
                  // Re-fetch account data after refresh
                  await fetchAccountData();
                } catch (error) {
                  console.error("Error refreshing data:", error);
                  if (error.message.includes('Failed to fetch')) {
                    setError(t('tradingDashboard_error_connection'));
                  } else if (error.message.includes('CORS')) {
                    setError(t('tradingDashboard_error_cors'));
                  } else {
                    setError(error.message || t('common_errorLoadingData'));
                  }
                } finally {
                  setIsLoading(false);
                }
              }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4 rounded-md transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              {t('tradingDashboard_refreshButton')}
            </button>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4 rounded-md transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
            {t('tradingDashboard_downloadCsvButton')}
          </button>
          </div>
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