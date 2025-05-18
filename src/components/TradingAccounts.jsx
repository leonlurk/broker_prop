import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

const TradingAccounts = ({ setSelectedOption, setSelectedAccount }) => {
  const { currentUser, language } = useAuth();
  const t = getTranslator(language);

  const [userAccounts, setUserAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  
  const tabs = [
    { key: 'tradingAccounts_tab_phase1', dataFilter: 'ONE STEP' },
    { key: 'tradingAccounts_tab_phase2', dataFilter: 'TWO STEP' },
    { key: 'tradingAccounts_tab_realAccount', dataFilter: 'REAL' }
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].key);

  const currentDataFilter = tabs.find(tab => tab.key === activeTab)?.dataFilter || tabs[0].dataFilter;

  const filteredAccounts = userAccounts.filter(account => {
    if (currentDataFilter === 'REAL') {
      return account.status === 'Aprobada' || account.status === 'Approved';
    }
    if (currentDataFilter === 'ONE STEP') {
      return account.challengeType === 'one_step' && account.status !== 'Aprobada' && account.status !== 'Approved';
    }
    if (currentDataFilter === 'TWO STEP') {
      return account.challengeType === 'two_step' && account.status !== 'Aprobada' && account.status !== 'Approved';
    }
    return false;
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
        const challengeType = data.challengeType || 
                            (data.numberOfPhases === 2 ? 'two_step' : 'one_step');
        
        accountsData.push({ 
          id: doc.id, 
          ...data,
          challengeType,
          challengePhase: data.challengeType === 'two_step' ? 'TWO STEP' : 'ONE STEP'
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
  
  return (
    <div className="flex flex-col p-4 border border-[#333] rounded-3xl bg-[#232323] text-white min-h-screen">
      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-6 py-3 rounded-full focus:outline-none ${
              activeTab === tab.key
                ? 'border border-cyan-500 bg-gradient-to-br from-[#232323] to-[#2d2d2d]'
                : 'border border-[#333] bg-gradient-to-br from-[#232323] to-[#2d2d2d]'
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
              className="p-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-xl border border-[#333] flex items-center"
            >
              {/* Columna 1: Información de la cuenta (izquierda) */}
              <div className="flex items-center flex-1">
                <div className="w-14 h-14 mr-4 flex items-center justify-center">
                  <img src="/userchart.png" alt="Account Chart"/>
                </div>
                <div>
                  <div className="font-medium text-lg">
                    {account.challengePhase} CHALLENGE {account.challengeAmount?.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {t('tradingAccounts_serverTypeLabel')} {account.serverType}
                    <br />
                    {t('tradingAccounts_accountNumberLabel')} {account.accountNumber}
                  </div>
                </div>
              </div>
              
              {/* Columna 2: Estado (centro) */}
              <div className="flex-1 text-center">
                <span className={`inline-block px-6 py-3 rounded-full text-sm text-white ${getStatusBadgeClass(account.status)}`}>
                  {t(getStatusTranslationKey(account.status))}
                </span>
              </div>
              
              {/* Columna 3: Botón (derecha) */}
              <div className="flex-1 flex justify-end">
                <button 
                  className="px-4 py-2 rounded-full bg-[#232323] border border-[#333] hover:bg-[#2a2a2a] transition focus:outline-none"
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