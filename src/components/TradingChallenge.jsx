import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Info } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

export default function TradingChallengeUI() {
  const { currentUser, language } = useAuth();
  const t = getTranslator(language);

  const [challengeAmount, setChallengeAmount] = useState('$5.000');
  const [challengePhase, setChallengePhase] = useState('1 Fase');
  const [complementType, setComplementType] = useState('Nuevo');
  const [selectedComplements, setSelectedComplements] = useState([]);
  const [price, setPrice] = useState('$185.80');
  const [isPurchasing, setIsPurchasing] = useState(false);

  const toggleComplement = (complement) => {
    if (selectedComplements.includes(complement)) {
      setSelectedComplements(selectedComplements.filter(item => item !== complement));
    } else {
      setSelectedComplements([...selectedComplements, complement]);
    }
  };

  const parseCurrencyToNumber = (currencyString) => {
    return parseFloat(currencyString.replace(/[^\d.-]/g, ''));
  };

  const handlePurchaseChallenge = async () => {
    if (!currentUser) {
      alert(t('tradingChallenge_alert_loginToPurchase'));
      return;
    }
    setIsPurchasing(true);
    try {
      const accountData = {
        userId: currentUser.uid,
        challengePhase: challengePhase,
        challengeAmountString: challengeAmount,
        challengeAmountNumber: parseCurrencyToNumber(challengeAmount),
        complementType: complementType,
        selectedComplements: selectedComplements,
        priceString: price,
        priceNumber: parseCurrencyToNumber(price),
        status: 'Activa',
        createdAt: serverTimestamp(),
        serverType: 'MT5',
        accountNumber: Date.now().toString(),
        pnlToday: 0,
        pnl7Days: 0,
        pnl30Days: 0,
        balanceActual: parseCurrencyToNumber(challengeAmount),
      };

      const docRef = await addDoc(collection(db, 'tradingAccounts'), accountData);
      alert(t('tradingChallenge_alert_purchaseSuccess', { accountId: docRef.id }));
    } catch (error) {
      console.error("Error al comprar el desafío: ", error);
      alert(t('tradingChallenge_alert_purchaseError'));
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="bg-[#232323] text-white bg-gradient-to-br from-[#232323] to-[#2d2d2d] min-h-screen">
      {/* Main Content */}
      <div className="p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Content */}
          <div className="w-full lg:w-3/4 p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-2xl border border-[#333]">
            <div className="mb-6 md:mb-10">
              <div className="flex items-center mb-4">
                <h2 className="text-xl md:text-2xl font-medium flex-1">{t('tradingChallenge_label_challengeType')}</h2>
                <HelpCircle size={16} className="text-gray-400" />
              </div>
              
              <div className="flex space-x-3 md:space-x-4 mb-4 md:mb-6">
                <button 
                  className={`text-white px-4 md:px-6 py-1 rounded-full text-base md:text-lg focus:outline-none bg-gradient-to-br from-[#232323] to-[#2d2d2d] border ${challengePhase === '1 Fase' ? 'border-cyan-500' : 'border-gray-700'}`}
                  onClick={() => setChallengePhase('1 Fase')}
                >
                  {t('tradingChallenge_button_1phase')}
                </button>
                <button 
                  className={`text-white px-4 md:px-6 py-1 rounded-full text-base md:text-lg focus:outline-none bg-gradient-to-br from-[#232323] to-[#2d2d2d] border ${challengePhase === '2 Fases' ? 'border-cyan-500' : 'border-gray-700'}`}
                  onClick={() => setChallengePhase('2 Fases')}
                >
                  {t('tradingChallenge_button_2phases')}
                </button>
              </div>
              
              <div className="flex items-center mb-3 md:mb-4">
                <h2 className="text-lg md:text-xl font-medium flex-1">{t('tradingChallenge_label_challengeAmount')}</h2>
                <Info size={16} className="text-gray-400" />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 mb-2">
                <button 
                  className={`px-2 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-lg font-regular border focus:outline-none bg-gradient-to-br from-[#232323] to-[#2d2d2d] ${challengeAmount === '$5.000' ? 'border-cyan-500 bg-transparent' : 'border-gray-700'}`}
                  onClick={() => setChallengeAmount('$5.000')}
                >
                  $5.000
                </button>
                <button 
                  className={`px-2 md:px-4 py-2 md:py-4 rounded-full text-sm md:text-lg font-regular border focus:outline-none bg-gradient-to-br from-[#232323] to-[#2d2d2d] ${challengeAmount === '$10.000' ? 'border-cyan-500 bg-transparent' : 'border-gray-700'}`}
                  onClick={() => setChallengeAmount('$10.000')}
                >
                  $10.000
                </button>
                <button 
                  className={`px-1 md:px-1 py-2 md:py-4 rounded-full text-sm md:text-lg font-regular border focus:outline-none bg-gradient-to-br from-[#232323] to-[#2d2d2d] ${challengeAmount === '$25.000' ? 'border-cyan-500 bg-transparent' : 'border-gray-700'}`}
                  onClick={() => setChallengeAmount('$25.000')}
                >
                  $25.000
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 mb-6 md:mb-10">
                <button 
                  className={`px-2 md:px-4 py-2 md:py-4 rounded-full text-sm md:text-lg font-regular border focus:outline-none bg-gradient-to-br from-[#232323] to-[#2d2d2d] ${challengeAmount === '$50.000' ? 'border-cyan-500 bg-transparent' : 'border-gray-700'}`}
                  onClick={() => setChallengeAmount('$50.000')}
                >
                  $50.000
                </button>
                <button 
                  className={`px-2 md:px-4 py-2 md:py-1 rounded-full text-sm md:text-lg font-regular border focus:outline-none bg-gradient-to-br from-[#232323] to-[#2d2d2d] ${challengeAmount === '$100.000' ? 'border-cyan-500 bg-transparent' : 'border-gray-700'}`}
                  onClick={() => setChallengeAmount('$100.000')}
                >
                  $100.000
                </button>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center mb-2">
                  <h2 className="text-xl md:text-2xl font-medium flex-1">{t('tradingChallenge_label_complements')}</h2>
                  <Info size={16} className="text-gray-400" />
                </div>
                
                <p className="text-white font-thin text-xs md:text-sm mb-4 md:mb-6">{t('tradingChallenge_label_selectComplementsByTraderType')}</p>
                
                <div className="flex flex-wrap gap-2 md:space-x-2 mb-6 md:mb-8">
                  <button 
                    className={`px-6 md:px-12 py-2 md:py-3 rounded-full text-sm md:text-md focus:outline-none bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] ${complementType === 'Nuevo' ? 'border-cyan-500 bg-transparent' : 'border-[#333]'}`}
                    onClick={() => setComplementType('Nuevo')}
                  >
                    {t('tradingChallenge_button_traderTypeNew')}
                  </button>
                  <button 
                    className={`px-6 md:px-12 py-2 md:py-3 rounded-full text-sm md:text-md focus:outline-none bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] ${complementType === 'Experto' ? 'border-cyan-500 bg-transparent' : 'border-[#333]'}`}
                    onClick={() => setComplementType('Experto')}
                  >
                    {t('tradingChallenge_button_traderTypeExpert')}
                  </button>
                  <button 
                    className={`px-4 md:px-8 py-2 md:py-3 rounded-full text-sm md:text-md focus:outline-none bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] ${complementType === 'Profesional' ? 'border-cyan-500 bg-transparent' : 'border-[#333]'}`}
                    onClick={() => setComplementType('Profesional')}
                  >
                    {t('tradingChallenge_button_traderTypeProfessional')}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-6 md:mb-10">
                  <div 
                    className={`flex items-center px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm bg-transparent ${selectedComplements.includes('doble') ? 'border border-blue-600' : ''}`}
                    onClick={() => toggleComplement('doble')}
                  >
                    <div className={`w-4 md:w-5 h-4 md:h-5 mr-2 md:mr-3 border rounded flex items-center justify-center ${selectedComplements.includes('doble') ? 'border-blue-600' : 'border-gray-600'}`}>
                      {selectedComplements.includes('doble') && (
                        <div className="w-2 md:w-3 h-2 md:h-3 bg-blue-600 rounded-sm"></div>
                      )}
                    </div>
                    <span>{t('tradingChallenge_complement_doubleLeverage')}</span>
                  </div>
                  
                  <div 
                    className={`flex items-center px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm bg-transparent ${selectedComplements.includes('noticias') ? 'border border-blue-600' : ''}`}
                    onClick={() => toggleComplement('noticias')}
                  >
                    <div className={`w-4 md:w-5 h-4 md:h-5 mr-2 md:mr-3 border rounded flex items-center justify-center ${selectedComplements.includes('noticias') ? 'border-blue-600' : 'border-gray-600'}`}>
                      {selectedComplements.includes('noticias') && (
                        <div className="w-2 md:w-3 h-2 md:h-3 bg-blue-600 rounded-sm"></div>
                      )}
                    </div>
                    <span>{t('tradingChallenge_complement_profitSplit9010')}</span>
                  </div>
                  
                  <div 
                    className={`col-span-1 sm:col-span-2 flex items-center px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm bg-transparent ${selectedComplements.includes('split') ? 'border border-blue-600' : ''}`}
                    onClick={() => toggleComplement('split')}
                  >
                    <div className={`w-4 md:w-5 h-4 md:h-5 mr-2 md:mr-3 border rounded flex items-center justify-center ${selectedComplements.includes('split') ? 'border-blue-600' : 'border-gray-600'}`}>
                      {selectedComplements.includes('split') && (
                        <div className="w-2 md:w-3 h-2 md:h-3 bg-blue-600 rounded-sm"></div>
                      )}
                    </div>
                    <span>{t('tradingChallenge_complement_newsTrading')}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                <div className="flex justify-between items-center text-base md:text-xl">
                  <span>{t('tradingChallenge_label_price')}</span>
                  <span className="font-regular">{price}</span>
                </div>
                <div className="text-base md:text-xl flex justify-between items-center">
                  <span>{t('tradingChallenge_label_platform')}</span>
                  <span className="font-regular">{t('tradingChallenge_label_platformValuePlaceholder')}</span>
                </div>
                <div className="flex text-base md:text-xl justify-between items-center">
                  <span>{t('tradingChallenge_label_currency')}</span>
                  <span className="font-regular">{t('tradingChallenge_label_currencyUsd')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-1/4 p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-2xl border border-[#333]">
            <div className="mb-6 md:mb-10">
              <h2 className="text-base md:text-lg font-medium mb-2 md:mb-3">{t('tradingChallenge_label_promoCode')}</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  className="flex-1 bg-transparent border border-gray-700 rounded-lg px-3 py-2 text-xs md:text-sm"
                  placeholder={t('tradingChallenge_placeholder_enterCode')}
                />
                <button className="border-cyan-500 bg-gradient-to-br from-[#232323] to-[#2d2d2d] hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm">
                  {t('tradingChallenge_button_apply')}
                </button>
              </div>
            </div>
            
            <div className="mb-6 md:mb-10">
              <h2 className="text-base md:text-lg font-medium mb-2 md:mb-3">{t('tradingChallenge_label_paymentMethod')}</h2>
              <div className="flex items-center justify-between border border-gray-700 rounded-lg px-3 md:px-4 py-2 cursor-pointer">
                <span className="text-xs md:text-sm text-gray-400">{t('tradingChallenge_placeholder_select')}</span>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
            
            <button 
              className="w-full bg-gradient-to-br border-cyan-500 from-[#232323] to-[#2d2d2d] hover:bg-blue-700 text-white py-2 md:py-3 px-3 md:px-4 rounded-full mb-2 text-xs md:text-sm disabled:opacity-50"
              onClick={handlePurchaseChallenge}
              disabled={isPurchasing}
            >
              {isPurchasing ? t('tradingChallenge_button_processing') : t('tradingChallenge_button_proceedToPayment')}
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              {t('tradingChallenge_disclaimer_acceptance')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}