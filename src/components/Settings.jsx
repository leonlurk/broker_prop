import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, Copy, Save, AlertTriangle, Loader } from 'lucide-react';
import KYCVerification from './KYCVerification';
import BillingPage from './BillingPage';
import ChangePasswordModal from './ChangePasswordModal';
import UpdateEmailModal from './UpdateEmailModal';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

const Settings = ({ onBack }) => {
  const { currentUser, language } = useAuth();
  const t = useMemo(() => getTranslator(language), [language]);

  // DEBUGGING: Log language and a sample translation
  useEffect(() => {
    console.log('[Settings.jsx] Language from useAuth():', language);
    console.log('[Settings.jsx] Sample translation for settings_cropImage_title:', t('settings_cropImage_title'));
  }, [language, t]);

  const [expandedSection, setExpandedSection] = useState(null);
  const [showKYC, setShowKYC] = useState(false);
  const [showBillingPage, setShowBillingPage] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showUpdateEmailModal, setShowUpdateEmailModal] = useState(false);
  const [userHasApprovedAccount, setUserHasApprovedAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userKycStatus, setUserKycStatus] = useState(null);
  
  const [walletAddress, setWalletAddress] = useState('');
  const [isEditingWallet, setIsEditingWallet] = useState(false);
  const [editWalletAddress, setEditWalletAddress] = useState('');
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const [walletError, setWalletError] = useState('');
  const [walletSuccessMessage, setWalletSuccessMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    console.log('Settings.jsx: useEffect for checkUserAccountStatus triggered. Current user UID:', currentUser?.uid);
    const checkUserAccountStatus = async () => {
      setIsLoading(true);
      try {
        if (currentUser) {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserHasApprovedAccount(userData.approved === true);
            setUserKycStatus(userData.kyc_status || null);
            
            if (userData.withdrawals_wallet) {
              setWalletAddress(userData.withdrawals_wallet);
              setEditWalletAddress(userData.withdrawals_wallet);
            }
          } else {
            setUserHasApprovedAccount(false);
          }
        }
      } catch (error) {
        console.error("Error:", error);
        setWalletError(t('settings_error_loadingData'));
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserAccountStatus();
  }, [currentUser, t]);

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  const toggleWalletEditMode = () => {
    setIsEditingWallet(!isEditingWallet);
    setEditWalletAddress(walletAddress);
    setWalletError('');
    setWalletSuccessMessage('');
  };
  
  const saveWalletAddress = async () => {
    if (!editWalletAddress.trim()) {
      setWalletError(t('settings_wallet_error_invalidAddress'));
      return;
    }
    
    setIsSavingWallet(true);
    setWalletError('');
    
    try {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { withdrawals_wallet: editWalletAddress.trim() }, { merge: true });
        
        setWalletAddress(editWalletAddress.trim());
        setWalletSuccessMessage(t('settings_wallet_success_updated'));
        
        setTimeout(() => {
          setWalletSuccessMessage('');
        }, 3000);
        
        setIsEditingWallet(false);
      } else {
        setWalletError(t('settings_wallet_error_mustLogin'));
      }
    } catch (err) {
      console.error('Error al actualizar la wallet:', err);
      setWalletError(t('settings_wallet_error_savingChanges'));
    } finally {
      setIsSavingWallet(false);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setShowSnackbar(true);
        setTimeout(() => {
          setShowSnackbar(false);
        }, 3000);
      })
      .catch(err => {
        console.error('Error al copiar: ', err);
      });
  };

  if (showKYC) {
    return <KYCVerification onBack={() => setShowKYC(false)} />;
  }

  if (showBillingPage) {
    return <BillingPage onBack={() => setShowBillingPage(false)} />;
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#262626] text-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>{t('settings_loadingText')}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#262626] text-white flex flex-col">
      {!showBillingPage && !showKYC ? (
        <>
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="text-white bg-[#2c2c2c] hover:bg-[#252525] rounded-full p-2 border border-cyan-500 focus:outline-none mr-4 transition-colors"
            aria-label={t('settings_button_back')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold">{t('settings_title')}</h1>
      </div>
      
      <div className="border border-[#333] rounded-2xl bg-gradient-to-br from-[#232323] to-[#2d2d2d] p-4 md:p-6">
        <div className="space-y-4">
        <div className="border border-[#333] rounded-3xl bg-gradient-to-br from-[#232323] to-[#2d2d2d]">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('account')}
          >
            <h2 className="text-lg md:text-xl">{t('settings_section_accountConfiguration')}</h2>
            <div className={`transition-transform duration-500 ease-in-out ${expandedSection === 'account' ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div 
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              expandedSection === 'account' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-4 pb-4 border-t border-[#333] pt-4">
              <div className="space-y-4">
              <div 
                className={`p-3 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] ${userHasApprovedAccount ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`} 
                onClick={() => userHasApprovedAccount && setShowKYC(true)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span>{t('settings_item_kycVerification')}</span>
                    {!userHasApprovedAccount && (
                      <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                        {t('settings_label_requiresApprovedAccount')}
                      </span>
                    )}
                    {userHasApprovedAccount && userKycStatus === 'pending_approval' && (
                      <span className="ml-2 text-xs bg-yellow-900/60 text-yellow-300 px-2 py-1 rounded-full">
                        {t('settings_label_pendingApproval')}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] cursor-pointer" onClick={() => setShowChangePasswordModal(true)}>
                  <div className="flex justify-between items-center">
                    <span>{t('settings_item_changePassword')}</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] cursor-pointer" onClick={() => setShowUpdateEmailModal(true)}>
                  <div className="flex justify-between items-center">
                    <span>{t('settings_item_updateEmail')}</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#333] rounded-3xl bg-gradient-to-br from-[#232323] to-[#202020]">
          <div 
                className="p-4 flex rounded-3xl justify-between items-center cursor-pointer bg-gradient-to-br from-[#232323] to-[#2d2d2d]"
            onClick={() => toggleSection('notifications')}
          >
            <h2 className="text-lg md:text-xl">{t('settings_section_notifications')}</h2>
            <div className={`transition-transform duration-500 ease-in-out ${expandedSection === 'notifications' ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div 
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              expandedSection === 'notifications' ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-4 pb-4 border-t border-[#333] bg-gradient-to-br from-[#232323] to-[#2d2d2d] pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>{t('settings_item_pushNotifications')}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-cyan-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#333] rounded-3xl bg-gradient-to-br from-[#232323] to-[#202020]">
          <div 
            className="p-4 flex  rounded-3xl justify-between items-center cursor-pointer bg-gradient-to-br from-[#232323] to-[#2d2d2d]"
            onClick={() => toggleSection('payment')}
          >
            <h2 className="text-lg md:text-xl">{t('settings_section_paymentMethod')}</h2>
            <div className={`transition-transform duration-500 ease-in-out ${expandedSection === 'payment' ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div 
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              expandedSection === 'payment' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-4 pb-4 border-t border-[#333] pt-4">
              <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2a2a2a] rounded-lg">
                <h3 className="text-lg font-medium mb-3">{t('settings_label_usdtPaymentAddress')}</h3>
                <p className="text-gray-400 mb-4">{t('settings_description_usdtPaymentAddress')}</p>
                
                {walletSuccessMessage && (
                  <div className="bg-green-900/20 border border-green-600 text-green-400 p-3 rounded-lg mb-3">
                    {walletSuccessMessage}
                  </div>
                )}
                
                {walletError && (
                  <div className="bg-red-900/20 border border-red-600 text-red-400 p-3 rounded-lg mb-3 flex items-center">
                    <AlertTriangle size={16} className="mr-2" />
                    {walletError}
                  </div>
                )}
                
                {isEditingWallet ? (
                  <div className="flex flex-col space-y-3">
                    <input
                      type="text"
                      className="flex-grow p-3 bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-lg border border-[#333] text-white"
                      value={editWalletAddress}
                      onChange={(e) => setEditWalletAddress(e.target.value)}
                      placeholder={t('settings_placeholder_enterUsdtAddress')}
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        className="px-6 py-3 bg-gradient-to-br from-[#0F7490] to-[#0A5A72] text-white rounded-full hover:opacity-90 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={saveWalletAddress}
                        disabled={isSavingWallet}
                      >
                        {isSavingWallet ? (
                          <>
                            <Loader size={16} className="animate-spin mr-2" />
                            {t('settings_button_saving')}
                          </>
                        ) : (
                          <>
                            <Save size={16} className="mr-2" />
                            {t('settings_button_save')}
                          </>
                        )}
                      </button>
                      <button 
                        className="px-6 py-3 bg-[#2a2a2a] text-white rounded-full hover:bg-[#333] transition"
                        onClick={toggleWalletEditMode}
                        disabled={isSavingWallet}
                      >
                        {t('settings_button_cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-grow p-3 bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-lg border border-[#333] text-gray-300 overflow-hidden flex items-center">
                      <span className="truncate mr-2">{walletAddress || t('settings_label_noWalletSet')}</span>
                      {walletAddress && (
                        <button 
                          className="ml-auto p-1 hover:bg-[#333] rounded" 
                          onClick={() => copyToClipboard(walletAddress)}
                        >
                          <Copy size={16} className="text-gray-400" />
                        </button>
                      )}
                    </div>
                    <button 
                      className="px-6 py-3 bg-gradient-to-br focus:outline-none from-[#0F7490] to-[#0A5A72] text-white rounded-full hover:opacity-90 transition"
                      onClick={toggleWalletEditMode}
                    >
                      {walletAddress ? t('settings_button_edit') : t('settings_button_addPaymentMethod')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

            <div 
              className="p-4 flex rounded-3xl justify-between items-center cursor-pointer bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333]"
              onClick={() => setShowBillingPage(true)}
            >
              <h2 className="text-lg md:text-xl">{t('settings_section_billing')}</h2>
              <ChevronRight className="h-6 w-6 text-gray-400" />
            </div>

        </div>
      </div>
        </>
      ) : showBillingPage ? (
        <BillingPage onBack={() => setShowBillingPage(false)} />
      ) : null}

      <ChangePasswordModal 
        isOpen={showChangePasswordModal} 
        onClose={() => setShowChangePasswordModal(false)} 
      />
      
      <UpdateEmailModal 
        isOpen={showUpdateEmailModal} 
        onClose={() => setShowUpdateEmailModal(false)} 
      />
      
      {showSnackbar && (
        <div className="fixed bottom-4 right-4 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-fade-in-out">
          <span>{t('settings_snackbar_textCopied')}</span>
        </div>
      )}
    </div>
  );
};

export default Settings;