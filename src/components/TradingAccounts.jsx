import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

// Constants for standardizing phase values across the application
const PHASE_ONE_STEP = 'ONE_STEP';
const PHASE_TWO_STEP = 'TWO_STEP';
const PHASE_REAL = 'REAL';

const TradingAccounts = ({ setSelectedOption, setSelectedAccount }) => {
  const { currentUser, language } = useAuth();
  const t = getTranslator(language);

  const [userAccounts, setUserAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  
  // Tab configuration with exact filter values matching TradingChallenge.jsx
  const tabs = [
    { key: 'tradingAccounts_tab_phase1', dataFilter: 'phase1' },
    { key: 'tradingAccounts_tab_phase2', dataFilter: 'phase2' },
    { key: 'tradingAccounts_tab_realAccount', dataFilter: 'real' }
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const currentDataFilter = tabs.find(tab => tab.key === activeTab)?.dataFilter || tabs[0].dataFilter;

  // Get the exact translated phase label for comparison
  const oneStepLabel = t('home_account_oneStepLabel');
  const twoStepLabel = t('home_account_twoStepLabel');

  const getCorrectedChallengeAmountForDisplay = (account) => {
    let currentAmount = account.challengeAmountNumber;

    if (typeof currentAmount !== 'number' || isNaN(currentAmount)) {
      if (account.challengeAmountString) {
        try {
          // Using the parsing logic from TradingChallenge.jsx for consistency
          let valueString = account.challengeAmountString.replace(/[$\\s]/g, '');
          valueString = valueString.replace(/\\./g, '').replace(/,/g, '.');
          
          const parsedFromString = parseFloat(valueString);
          if (!isNaN(parsedFromString)) {
            currentAmount = parsedFromString;
          } else {
            return NaN; 
          }
        } catch (e) {
          return NaN; 
        }
      } else {
        return NaN; 
      }
    }

    if (currentAmount < 1000 && account.challengeAmountString) {
      const stringAmount = account.challengeAmountString;
      let reParsedValString = stringAmount.replace(/[$\\s]/g, '');
      reParsedValString = reParsedValString.replace(/\\./g, '').replace(/,/g, '.');
      const reParsedVal = parseFloat(reParsedValString);
      
      if (!isNaN(reParsedVal) && reParsedVal > currentAmount) {
        return reParsedVal;
      }
    }

    if (currentAmount > 0 && currentAmount < 1000) {
      return currentAmount * 1000;
    }
    
    return currentAmount;
  };

  // Simple helper function to determine if an account is one_step or two_step
  const getAccountPhaseType = (account) => {
    // For debugging - print complete account data with all properties
    console.log("Account phase data:", account.id, {
      phase: account.challengePhase, 
      type: account.challengeType,
      numberOfPhases: account.numberOfPhases,
      allProperties: Object.keys(account)
    });
    
    // First check if challengePhase exactly matches various known values
    if (account.challengePhase) {
      // Log the exact phase value for debugging
      console.log(`Account ${account.id} has challengePhase:`, account.challengePhase);
      
      // Check for Spanish version (1 FASE/2 FASES)
      if (account.challengePhase === '1 FASE') return 'phase1';
      if (account.challengePhase === '2 FASES') return 'phase2';
      
      // Check for English version (ONE STEP/TWO STEPS)
      if (account.challengePhase === 'ONE STEP') return 'phase1';
      if (account.challengePhase === 'TWO STEPS') return 'phase2';
      
      // Handle OLD_FORMAT with underscore
      if (account.challengePhase === 'ONE_STEP') return 'phase1';
      if (account.challengePhase === 'TWO_STEP') return 'phase2';
      
      // More general matching based on the content
      const phase = account.challengePhase.toLowerCase();
      if (phase.includes('2') || phase.includes('two')) {
        return 'phase2';
      }
      // Must check this AFTER the '2' check to prevent '2 FASES' from matching '1'
      if (phase.includes('1') || phase.includes('one') || 
          phase.includes('fase') && !phase.includes('2')) {
        return 'phase1';
      }
    } else {
      console.log(`Account ${account.id} has no challengePhase, using challengeType:`, account.challengeType);
    }
    
    // Check challengeType for accounts without challengePhase
    if (account.challengeType === 'two_step' || account.challengeType === 'Swing') {
      return 'phase2';
    }
    if (account.challengeType === 'one_step' || account.challengeType === 'Estándar') {
      return 'phase1';
    }
    
    // Log for accounts where we need to fall back to numberOfPhases
    if (account.numberOfPhases) {
      console.log(`Account ${account.id} using numberOfPhases fallback:`, account.numberOfPhases);
    } else {
      console.log(`Account ${account.id} has no reliable phase indicator, defaulting to phase1`);
    }
    
    // Default fallback - assign based on challengeType or numberOfPhases
    // Most accounts are one-step if not specified otherwise
    return account.numberOfPhases === 2 ? 'phase2' : 'phase1';
  };

  // Filter based on account status and properly determined type
  const filteredAccounts = userAccounts.filter(account => {
    // Real accounts tab - show only approved accounts
    if (currentDataFilter === 'real') {
      return account.status === 'Aprobada' || account.status === 'Approved';
    }
    
    // Don't show approved accounts in phase tabs
    if (account.status === 'Aprobada' || account.status === 'Approved') {
      return false;
    }

    // Match the account phase type with the current tab filter
    const accountPhaseType = getAccountPhaseType(account);
    
    // Log filtering result for debugging
    console.log(`Filtering account ${account.id}: ${accountPhaseType} vs ${currentDataFilter}`, 
      {matches: accountPhaseType === currentDataFilter});
    
    return accountPhaseType === currentDataFilter;
  });

  useEffect(() => {
    if (!currentUser) {
      setUserAccounts([]);
      setIsLoadingAccounts(false);
      return;
    }

    setIsLoadingAccounts(true);
    const q = query(
      collection(db, 'tradingAccounts'), 
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const accountsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        accountsData.push({ 
          id: doc.id, 
          ...data
        });
      });
      console.log('Accounts loaded:', accountsData);
      setUserAccounts(accountsData);
      setIsLoadingAccounts(false);
    }, (error) => {
      console.error("Error fetching trading accounts: ", error);
      setIsLoadingAccounts(false);
    });

    return () => unsubscribe();
  }, [currentUser]);
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Activa':
      case 'Active':
        return 'bg-gradient-to-br from-cyan-500 to-[#2b2b2b]';
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

  const getStatusTranslationKey = (status) => {
    switch (status) {
      case 'Activa':
      case 'Active':
        return 'tradingAccounts_status_active';
      case 'Aprobada':
      case 'Approved':
        return 'tradingAccounts_status_approved';
      case 'Perdida':
      case 'Lost':
        return 'tradingAccounts_status_lost';
      default:
        return status;
    }
  };

  // Helper to get display phase label for the UI
  const getPhaseDisplayLabel = (account) => {
    // Get the account type (phase1 or phase2)
    const accountType = getAccountPhaseType(account);
    const amount = getCorrectedChallengeAmountForDisplay(account);
    const formattedAmount = amount >= 1000 ? `${amount/1000}K` : amount;
    
    // For already set labels, use them directly with amount
    if (account.challengePhase) {
      if (account.challengePhase === '1 FASE' || account.challengePhase === 'ONE STEP' || account.challengePhase === 'ONE_STEP' ||
          (account.challengeType === 'one_step' || account.challengeType === 'Estándar')) {
        return `AGM Account Fase 1 ${formattedAmount}`;
      }
      if (account.challengePhase === '2 FASES' || account.challengePhase === 'TWO STEPS' || account.challengePhase === 'TWO_STEP' ||
          (account.challengeType === 'two_step' || account.challengeType === 'Swing')) {
        return `AGM Account Swing ${formattedAmount}`;
      }
    }
    
    // Otherwise, get translated labels based on the determined account type with amount
    return accountType === 'phase1' 
      ? `AGM Account Fase 1 ${formattedAmount}`
      : `AGM Account Swing ${formattedAmount}`;
  };
  
  return (
    <div className="flex flex-col p-3 sm:p-4 border border-[#333] rounded-3xl bg-[#232323] text-white">
      {/* Tab Navigation */}
      <div className="flex space-x-1 sm:space-x-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-3 py-2 sm:px-6 sm:py-3 rounded-full focus:outline-none text-sm sm:text-base whitespace-nowrap ${
              activeTab === tab.key
                ? 'border border-cyan-500 bg-gradient-to-br from-[#232323] to-[#2d2d2d]'
                : 'border border-[#333] bg-gradient-to-br from-[#232323] to-[#2d2d2d] hover:border-cyan-400'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {t(tab.key)}
          </button>
        ))}
      </div>
      
      {isLoadingAccounts && <p className="text-center py-4">{t('tradingAccounts_loadingAccounts')}</p>}

      {!isLoadingAccounts && filteredAccounts.length === 0 && (
        <p className="text-center py-4">{t('tradingAccounts_noAccountsFound', { tabName: t(activeTab) })}</p>
      )}

      {!isLoadingAccounts && filteredAccounts.length > 0 && (
        <div className="space-y-4">
          {filteredAccounts.map((account) => (
            <div 
              key={account.id} 
              className="p-3 sm:p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-xl border border-[#333] flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4"
            >
              {/* Columna 1: Información de la cuenta (izquierda) */}
              <div className="flex items-center flex-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mr-3 sm:mr-4 flex items-center justify-center">
                  <img src="/userchart.png" alt="Account Chart" className="w-full h-full"/>
                </div>
                <div>
                  <div className="font-medium text-base sm:text-lg">
                    {getPhaseDisplayLabel(account)}
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm">
                    {t('tradingAccounts_serverTypeLabel')} {account.serverType}
                    <br />
                    {t('tradingAccounts_accountNumberLabel')} {account.accountNumber}
                  </div>
                </div>
              </div>
              
              {/* Columna 2: Estado (centro) */}
              <div className="flex-shrink-0 w-full sm:w-auto sm:flex-1 text-center sm:text-center">
                <span className={`inline-block px-4 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm text-white ${getStatusBadgeClass(account.status)}`}>
                  {t(getStatusTranslationKey(account.status))}
                </span>
              </div>
              
              {/* Columna 3: Botón (derecha) */}
              <div className="flex-shrink-0 w-full sm:w-auto sm:flex-1 flex sm:justify-end">
                <button 
                  className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#232323] border border-[#333] hover:bg-[#2a2a2a] transition focus:outline-none text-sm sm:text-base"
                  onClick={() => {
                    setSelectedAccount && setSelectedAccount(account.id);
                    setSelectedOption && setSelectedOption("Dashboard");
                  }}
                >
                  {t('tradingAccounts_viewDetailsButton')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TradingAccounts;