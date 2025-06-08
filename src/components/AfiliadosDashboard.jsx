import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Copy, ArrowUpDown, Save, AlertTriangle, Loader, Lock, UserCheck, Link, ListChecks, CreditCard, LockOpen, HelpCircle } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

// Updated Tier requirements
const TIER_REQUIREMENTS = {
  1: 0,    // Base Tier (0-99 referrals)
  2: 100,  // Tier 2 (100-199 referrals)
  3: 200   // Tier 3 (200+ referrals)
};

// Tier commission details (example) - Will be initialized inside component for t function access
// const TIER_COMMISSIONS = {
//   1: { direct: '10%', sub_tier_1: null, payments: null, label: 'Comisión 10%' },
//   2: { direct: '15%', sub_tier_1: '5%', payments: null, label: 'Comisión 15% + 5% (Tier 1 Referidos)' },
//   3: { direct: '20%', sub_tier_1: '5%', payments: '10%', label: 'Comisión 20% + 5% (Tier 1) + 10% Pagos' }, 
// };

const determineTier = (referralCount) => {
  if (referralCount >= TIER_REQUIREMENTS[3]) return 3; // 200+
  if (referralCount >= TIER_REQUIREMENTS[2]) return 2; // 100-199
  return 1; // 0-99
};

// Enhanced Tooltip Component with better UX
const Tooltip = ({ children, content, isVisible, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative p-2 rounded-full transition-all duration-200 ease-in-out
          ${isVisible 
            ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/30' 
            : isHovered 
              ? 'text-cyan-300 bg-cyan-400/5 border border-cyan-400/20' 
              : 'text-gray-400 bg-transparent border border-transparent hover:text-cyan-300'
          }
          hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-400/50
        `}
        aria-label="Ver información detallada del tier"
        aria-expanded={isVisible}
      >
        {children}
        {(isHovered || isVisible) && (
          <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-pulse"></div>
        )}
      </button>
      
      <div className={`
        absolute z-[60] bottom-full left-1/2 transform -translate-x-1/2 mb-3
        transition-all duration-300 ease-out
        ${isVisible 
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
          : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
        }
      `}>
        <div 
          className="relative px-4 py-3 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white text-sm rounded-xl shadow-2xl border border-gray-600/50 w-72 sm:w-80 text-left backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
          style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(96, 165, 250, 0.1)',
          }}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
            aria-label="Cerrar tooltip"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Content with better typography */}
          <div className="pr-6">
            <div className="whitespace-pre-wrap leading-relaxed text-gray-100">
              {content}
            </div>
          </div>
          
          {/* Enhanced arrow with gradient */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-800"></div>
            <div className="absolute top-[-9px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[9px] border-r-[9px] border-t-[9px] border-l-transparent border-r-transparent border-t-gray-600/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AfiliadosDashboard = () => {
  const { currentUser, language } = useAuth();
  const t = getTranslator(language);

  // Moved TIER_COMMISSIONS here to use t()
  const TIER_COMMISSIONS = {
    1: { direct: '10%', sub_tier_1: null, payments: null, labelKey: 'afiliadosDashboard_tier_commission_1' },
    2: { direct: '12%', sub_tier_1: '3%', payments: null, labelKey: 'afiliadosDashboard_tier_commission_2' },
    3: { direct: '15%', sub_tier_1: '3%', payments: '1%', labelKey: 'afiliadosDashboard_tier_commission_3' }, 
  };

  const [activeTab, setActiveTab] = useState('panel');
  const [walletAddress, setWalletAddress] = useState('');
  const [isEditingWallet, setIsEditingWallet] = useState(false);
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const [editWalletAddress, setEditWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [referralLink, setReferralLink] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [currentTier, setCurrentTier] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [referenciasData, setReferenciasData] = useState([]);
  const [pagosData, setPagosData] = useState([]);
  const [isLoadingReferencias, setIsLoadingReferencias] = useState(false);
  const [isLoadingPagos, setIsLoadingPagos] = useState(false);

  // State for tooltip visibility
  const [visibleTooltip, setVisibleTooltip] = useState(null);
  
  // State for copy button
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Function to get tier tooltip content
  const getTierTooltipContent = (tierNum) => {
    const tierData = TIER_COMMISSIONS[tierNum];
    switch (tierNum) {
      case 1:
        return t('afiliadosDashboard_tooltip_tier1', {
          commission: tierData.direct,
          requirement: '0-99 referidos'
        });
      case 2:
        return t('afiliadosDashboard_tooltip_tier2', {
          directCommission: tierData.direct,
          subCommission: tierData.sub_tier_1,
          requirement: '100-199 referidos'
        });
      case 3:
        return t('afiliadosDashboard_tooltip_tier3', {
          directCommission: tierData.direct,
          subCommission: tierData.sub_tier_1,
          paymentsCommission: tierData.payments,
          requirement: '200+ referidos'
        });
      default:
        return '';
    }
  };

  const toggleTooltip = (tierNum) => {
    setVisibleTooltip(visibleTooltip === tierNum ? null : tierNum);
  };

  // Close tooltip when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = () => {
      setVisibleTooltip(null);
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setVisibleTooltip(null);
      }
    };

    if (visibleTooltip !== null) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [visibleTooltip]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setIsLoadingData(false);
        setError(t('afiliadosDashboard_error_userNotAuthenticated'));
        return;
      }
      setIsLoadingData(true);
      try {
        setReferralLink(`${window.location.origin}/register?ref=${currentUser.uid}`);
        const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setWalletAddress(userData.withdrawals_wallet || '');
          setEditWalletAddress(userData.withdrawals_wallet || '');
          const count = userData.referralCount || 0;
          setReferralCount(count);
          setCurrentTier(determineTier(count));
        } else {
          // User document might not exist if created before these fields were added
          // Or if there was an issue. Initialize with defaults.
          setReferralCount(0);
          setCurrentTier(1);
          setWalletAddress('');
          setEditWalletAddress('');
          // Optionally, create/update the user doc with default affiliate fields here if it's missing them
          // await setDoc(userDocRef, { referralCount: 0, withdrawals_wallet: '' }, { merge: true });
        }
      } catch (err) {
        console.error('Error al obtener datos del afiliado:', err);
        setError(t('afiliadosDashboard_error_loadingData'));
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const fetchReferencias = useCallback(async () => {
    if (!currentUser || activeTab !== 'referencias') {
      return;
    }
    setIsLoadingReferencias(true);
    setError('');
    try {
      const q = query(
        collection(db, "users"), 
        where("referredBy", "==", currentUser.uid),
        orderBy("created_time", "desc")
      );
      const querySnapshot = await getDocs(q);
      const refs = [];
      querySnapshot.forEach((doc) => {
        refs.push({ id: doc.id, ...doc.data() });
      });
      setReferenciasData(refs);
    } catch (err) {
      console.error('Error fetching referrals:', err);
      setError(t('afiliadosDashboard_error_loadingReferrals'));
      setReferenciasData([]);
    } finally {
      setIsLoadingReferencias(false);
    }
  }, [currentUser, activeTab]);

  useEffect(() => {
    if (activeTab === 'referencias') {
      fetchReferencias();
    }
  }, [activeTab, fetchReferencias]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Reset messages when changing tabs
    setError('');
    setSuccessMessage('');
    // Potentially trigger data fetching for referral/payment tables here if not already loaded
  };
  
  const toggleEditWalletMode = () => {
    setIsEditingWallet(!isEditingWallet);
    setEditWalletAddress(walletAddress); // Reset edit field to current wallet on toggle
    setError('');
    setSuccessMessage('');
  };
  
  const saveWalletAddressHandler = async () => {
    if (!editWalletAddress.trim()) {
      setError(t('afiliadosDashboard_error_invalidWallet'));
      return;
    }
    if (!currentUser) {
      setError(t('afiliadosDashboard_error_mustLoginToUpdateWallet'));
      return;
    }
    setIsSavingWallet(true);
    setError('');
    setSuccessMessage('');
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { withdrawals_wallet: editWalletAddress.trim() });
        setWalletAddress(editWalletAddress.trim());
      setSuccessMessage(t('afiliadosDashboard_success_walletUpdated'));
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsEditingWallet(false);
    } catch (err) {
      console.error('Error al actualizar la wallet:', err);
      setError(t('afiliadosDashboard_error_savingWallet'));
    } finally {
      setIsSavingWallet(false);
    }
  };
  
  const copyToClipboardHandler = async () => {
    if (!referralLink || isCopying) return;
    
    setIsCopying(true);
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      setSuccessMessage(t('afiliadosDashboard_success_linkCopied'));
      
      // Vibración en móvil si está disponible
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Reset states after animation
      setTimeout(() => {
        setCopySuccess(false);
        setIsCopying(false);
      }, 600);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error al copiar enlace:', err);
      
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        
        setCopySuccess(true);
        setSuccessMessage(t('afiliadosDashboard_success_linkCopied'));
        
        // Vibración en móvil si está disponible
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        
        setTimeout(() => {
          setCopySuccess(false);
          setIsCopying(false);
        }, 600);
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (fallbackErr) {
        setError(t('afiliadosDashboard_error_copyingLink'));
        setIsCopying(false);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const renderContent = () => {
    if (isLoadingData) {
      return <div className="flex justify-center items-center h-60"><Loader size={40} className="animate-spin text-cyan-500" /></div>;
    }
    if (error && activeTab !== 'panel') { // Show general error prominently if not on panel (panel has its own error spots)
        return <div className="text-red-400 p-4 text-center">{error}</div>;
    }

    switch (activeTab) {
      case 'panel':
        return (
          <div className="space-y-6 md:space-y-8">
            {/* Performance Metrics */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-100">{t('afiliadosDashboard_panel_performance')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="p-4 sm:p-5 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-xl border border-[#4A4A4A]">
                  <h3 className="text-sm sm:text-md font-medium text-gray-400 mb-1">{t('afiliadosDashboard_panel_totalCommissions')}</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-white">$0.00</p>
                </div>
                <div className="p-4 sm:p-5 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-xl border border-[#4A4A4A]">
                  <h3 className="text-sm sm:text-md font-medium text-gray-400 mb-1">{t('afiliadosDashboard_panel_paidReferrals')}</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-white">0</p>
                </div>
                <div className="p-4 sm:p-5 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-xl border border-[#4A4A4A]">
                  <h3 className="text-sm sm:text-md font-medium text-gray-400 mb-1">{t('afiliadosDashboard_panel_conversion')}</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-white">0%</p>
                </div>
              </div>
            </section>

            {/* Affiliate Link & Tier Info */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2 p-4 sm:p-5 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-xl border border-[#4A4A4A] space-y-2 sm:space-y-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-100">{t('afiliadosDashboard_panel_yourAffiliateLink')}</h3>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="relative w-full">
                    <input 
                      type="text" 
                      readOnly 
                      value={referralLink} 
                      className="w-full p-2.5 sm:p-3 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-lg sm:rounded-full border border-[#444] text-gray-300 text-xs sm:text-sm truncate pr-12 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors" 
                    />
                                         <button 
                       onClick={copyToClipboardHandler} 
                       disabled={isCopying}
                       className={`absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                         copySuccess 
                           ? 'bg-green-500 text-white scale-110' 
                           : isCopying
                           ? 'bg-cyan-500 text-white animate-pulse'
                           : 'bg-cyan-600 hover:bg-cyan-700 text-white hover:scale-105'
                       } disabled:cursor-not-allowed flex-shrink-0`}
                       aria-label={copySuccess ? "¡Copiado!" : isCopying ? "Copiando..." : "Copiar enlace"}
                       title={copySuccess ? "¡Enlace copiado!" : isCopying ? "Copiando..." : "Copiar enlace de afiliado"}
                     >
                      {copySuccess ? (
                        <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isCopying ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{t('afiliadosDashboard_panel_shareLinkInstruction')}</p>
              </div>
              <div className="p-4 sm:p-5 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-xl border border-[#4A4A4A]">
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-1">{t('afiliadosDashboard_panel_registeredReferrals')}</h3>
                <p className="text-3xl sm:text-4xl font-bold text-white">{referralCount}</p>
              </div>
            </section>
            
            {/* Wallet Address */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 text-gray-100">{t('afiliadosDashboard_panel_paymentAddress')}</h2>
              {successMessage && (
                <div className="mb-3 p-3 sm:p-3 bg-green-500/20 border border-green-500 text-green-300 rounded-xl sm:rounded-full text-sm flex items-center gap-2 animate-pulse">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">{successMessage}</span>
                </div>
              )}
              {error && <div className="mb-3 p-2.5 sm:p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg sm:rounded-full flex items-center text-sm"><AlertTriangle size={18} className="mr-2 flex-shrink-0"/><span>{error}</span></div>}
              {isEditingWallet ? (
                <div className="space-y-3">
                  <input type="text" value={editWalletAddress} onChange={(e) => setEditWalletAddress(e.target.value)} placeholder={t('afiliadosDashboard_panel_walletPlaceholder')} className="w-full p-3 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-lg sm:rounded-full border border-[#444] text-white focus:border-cyan-500 focus:ring-cyan-500 text-sm" />
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button onClick={saveWalletAddressHandler} disabled={isSavingWallet} className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition flex items-center justify-center disabled:opacity-70 text-sm">
                      {isSavingWallet ? <><Loader size={16} className="animate-spin mr-2 sm:size-18" />{t('afiliadosDashboard_panel_savingButton')}</> : <><Save size={16} className="mr-2 sm:size-18"/>{t('afiliadosDashboard_panel_saveButton')}</>}
                    </button>
                    <button onClick={toggleEditWalletMode} className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition text-sm">{t('afiliadosDashboard_panel_cancelButton')}</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between p-3 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-lg sm:rounded-full border border-[#444] space-y-2 sm:space-y-0">
                  <span className="text-gray-300 truncate text-sm flex-grow sm:mr-3">{walletAddress || t('afiliadosDashboard_walletNotSet')}</span>
                  <button onClick={toggleEditWalletMode} className="px-4 py-2 sm:px-5 sm:py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg sm:rounded-full transition text-xs sm:text-sm flex-shrink-0">{t('afiliadosDashboard_panel_editButton')}</button>
                </div>
              )}
            </section>

            {/* Tiers Visual Display */}
            <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-100">{t('afiliadosDashboard_panel_affiliateTiers')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {[1, 2, 3].map(tierNum => {
                        const isCurrentTierOrHigher = currentTier >= tierNum;
                        const requirementText = () => {
                            if (tierNum === 1) return t('afiliadosDashboard_panel_tierRequirementRange', { min: 0, max: 99 });
                            if (tierNum === 2) return t('afiliadosDashboard_panel_tierRequirementRange', { min: 100, max: 199 });
                            if (tierNum === 3) return t('afiliadosDashboard_panel_tierRequirementPlus', { count: 200 });
                            return '';
                        };

                        return (
                            <div key={tierNum} className={`p-4 sm:p-5 rounded-xl border ${isCurrentTierOrHigher ? 'border-cyan-400 bg-[#2d2d2d]' : 'border-[#4A4A4A] bg-[#2d2d2d]' } space-y-1 sm:space-y-1.5`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`text-lg sm:text-xl font-bold ${isCurrentTierOrHigher ? 'text-white' : 'text-gray-300'}`}>{t('afiliadosDashboard_panel_tierLabel', { tierNum })}</h3>
                                        <Tooltip
                                            content={getTierTooltipContent(tierNum)}
                                            isVisible={visibleTooltip === tierNum}
                                            onToggle={() => toggleTooltip(tierNum)}
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                                            </svg>
                                        </Tooltip>
                                    </div>
                                    <div className="flex items-center">
                                        {/* Show lock icon only if tier is not achieved */}
                                        {!isCurrentTierOrHigher && <Lock size={20} className="text-gray-500" />}
                                        {/* Show unlocked icon if the tier IS current/achieved */}
                                        {isCurrentTierOrHigher && <LockOpen size={20} className="text-cyan-400" />}
                                    </div>
                                </div>
                                <p className={`text-xs sm:text-sm ${isCurrentTierOrHigher ? 'text-gray-200' : 'text-gray-400'}`}>{t(TIER_COMMISSIONS[tierNum].labelKey)}</p>
                                <p className="text-xs text-gray-500">
                                    {requirementText()}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

             {/* Traders Fondeados Section - Placeholder */}
            <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-100">{t('afiliadosDashboard_panel_fundedTradersTier3')}</h2>
                <div className="relative rounded-xl border border-[#4A4A4A] bg-gradient-to-br from-[#232323] to-[#2b2b2b] min-h-[150px] sm:min-h-[200px] flex items-center justify-center p-4">
                {currentTier === 3 ? (
                    <p className="text-gray-400 text-center text-sm sm:text-base">{t('afiliadosDashboard_panel_fundedTradersUnlocked')}</p>
                ) : (
                    <div className="text-center p-3 sm:p-4">
                        <Lock size={36} className="text-gray-500 mb-2 sm:mb-3 mx-auto" />
                        <h3 className="text-base sm:text-xl font-semibold text-gray-300 mb-1">{t('afiliadosDashboard_panel_sectionLocked')}</h3>
                        {/* Ensure this message correctly reflects the new Tier 3 requirement */}
                        <p className="text-xs sm:text-sm text-gray-400">{t('afiliadosDashboard_panel_reachTierToUnlock', { tierNum: 3, count: TIER_REQUIREMENTS[3] })}</p>
                </div>
                )}
                </div>
            </section>
          </div>
        );

      case 'referencias':
        return (
          <div className="space-y-4">
             <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-100">{t('afiliadosDashboard_referrals_title')}</h2>
            {isLoadingReferencias && <div className="flex justify-center items-center p-6"><Loader size={32} className="animate-spin text-white"/></div>}
            {!isLoadingReferencias && error && <div className="text-red-400 p-4 text-center text-sm sm:text-base">{error}</div>}
            {!isLoadingReferencias && !error && referenciasData.length === 0 && 
                <p className="text-gray-400 text-center p-6 text-sm sm:text-base">{t('afiliadosDashboard_referrals_noReferrals')}</p>
            }
            {!isLoadingReferencias && !error && referenciasData.length > 0 && (
              <div className="overflow-x-auto bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-xl border border-[#4A4A4A] -webkit-overflow-scrolling-touch">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead className="border-b border-[#4A4A4A]">
                    <tr>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-300 whitespace-nowrap min-w-[80px]">{t('afiliadosDashboard_referrals_table_user')}</th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-300 whitespace-nowrap min-w-[120px]">{t('afiliadosDashboard_referrals_table_email')}</th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-300 whitespace-nowrap min-w-[100px]">{t('afiliadosDashboard_referrals_table_name')}</th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-300 whitespace-nowrap min-w-[80px]">{t('afiliadosDashboard_referrals_table_country')}</th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-300 whitespace-nowrap min-w-[100px]">{t('afiliadosDashboard_referrals_table_registeredDate')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#4A4A4A]">
                    {referenciasData.map(ref => (
                      <tr key={ref.id} className="hover:bg-[#333]">
                        <td className="px-2 py-2 sm:px-4 sm:py-3 text-gray-200 whitespace-nowrap">{ref.username || t('afiliadosDashboard_table_notAvailable')}</td>
                        <td className="px-2 py-2 sm:px-4 sm:py-3 text-gray-200 whitespace-nowrap max-w-[120px] truncate">{ref.email}</td>
                        <td className="px-2 py-2 sm:px-4 sm:py-3 text-gray-200 whitespace-nowrap">{`${ref.firstName || ''} ${ref.lastName || ''}`.trim() || t('afiliadosDashboard_table_notAvailable')}</td>
                        <td className="px-2 py-2 sm:px-4 sm:py-3 text-gray-200 whitespace-nowrap">{ref.country || t('afiliadosDashboard_table_notAvailable')}</td>
                        <td className="px-2 py-2 sm:px-4 sm:py-3 text-gray-200 whitespace-nowrap">
                          {ref.created_time ? new Date(ref.created_time.seconds * 1000).toLocaleDateString() : t('afiliadosDashboard_table_notAvailable')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        );

      case 'pagos':
        return (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-100">{t('afiliadosDashboard_payments_title')}</h2>
            {isLoadingPagos && <div className="flex justify-center"><Loader className="animate-spin text-white"/></div>}
            {!isLoadingPagos && pagosData.length === 0 && <p className="text-gray-400 text-center text-sm sm:text-base">{t('afiliadosDashboard_payments_noPayments')}</p>}
            {pagosData.length > 0 && <p className="text-center text-sm sm:text-base">{t('afiliadosDashboard_payments_tablePlaceholder')}</p>}
          </div>
        );
      default: return <div className="text-center text-gray-400 p-6 text-sm sm:text-base">{t('afiliadosDashboard_selectTabPrompt')}</div>;
    }
  };

  const tabConfig = [
    { id: 'panel', labelKey: 'afiliadosDashboard_tab_panel', icon: UserCheck },
    { id: 'referencias', labelKey: 'afiliadosDashboard_tab_referrals', icon: Link },
    { id: 'pagos', labelKey: 'afiliadosDashboard_tab_payments', icon: CreditCard },
  ];

  return (
    <div className="flex flex-col bg-gradient-to-br from-[#232323] to-[#2b2b2b] text-white p-3 sm:p-4 md:p-6 rounded-3xl border border-[#4A4A4A] h-full overflow-hidden">
      <div className="flex space-x-1 mb-4 sm:mb-6 overflow-x-auto pb-2 flex-shrink-0">
        {tabConfig.map(tab => {
            const Icon = tab.icon;
            return (
        <button
                    key={tab.id}
                    className={`flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-3 font-medium focus:outline-none transition-colors duration-150 rounded-full bg-gradient-to-br from-[#232323] to-[#2b2b2b] text-sm sm:text-base whitespace-nowrap
                        ${activeTab === tab.id 
                            ? 'border border-cyan-500 text-white' 
                            : 'text-gray-400 hover:text-gray-200 hover:border-cyan-400 border border-transparent'
                        }`}
                    onClick={() => handleTabClick(tab.id)}
                >
                    <Icon size={16} className="sm:w-5 sm:h-5" />
                    <span>{t(tab.labelKey)}</span>
        </button>
            );
        })}
      </div>
      
      <div className="bg-gradient-to-br from-[#232323] to-[#2b2b2b] p-3 sm:p-4 md:p-6 rounded-xl border border-[#4A4A4A] flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default AfiliadosDashboard;