import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, Info } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

export default function TradingChallengeUI() {
  const { currentUser, language } = useAuth();
  const t = getTranslator(language);

  const [challengeAmount, setChallengeAmount] = useState('$5.000');
  const [challengeType, setChallengeType] = useState('Estándar');
  
  // New states for complement selections
  const [selectedProfitTargetP1, setSelectedProfitTargetP1] = useState('10%'); // Default
  const [selectedProfitTargetP2, setSelectedProfitTargetP2] = useState('5%');  // Default
  const [selectedProfitSplit, setSelectedProfitSplit] = useState('80%');    // Default
  const [activePhaseForProfitTargetBonus, setActivePhaseForProfitTargetBonus] = useState('P1'); // New state, P1 is active by default

  const [price, setPrice] = useState(''); // Will be calculated by useEffect
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Data for complement options
  const profitTargetP1Options = [
    { text: '9%', value: '9%', adjustment: 50, priceText: '+$50,00' },
    { text: '10%', value: '10%', adjustment: 0, priceText: '' },
    { text: '11%', value: '11%', adjustment: -50, priceText: '-$50,00' },
  ];

  const profitTargetP2Options = [
    { text: '4%', value: '4%', adjustment: 50, priceText: '+$50,00' },
    { text: '5%', value: '5%', adjustment: 0, priceText: '' },
    { text: '6%', value: '6%', adjustment: -50, priceText: '-$50,00' },
  ];

  const profitSplitOptions = [
    { text: '70%', value: '70%', adjustment: -50, priceText: '-$50,00' },
    { text: '80%', value: '80%', adjustment: 0, priceText: '' },
    { text: '90%', value: '90%', adjustment: 50, priceText: '+$50,00' },
  ];
  
  const baseChallengePrices = {
    '$5.000': 65,
    '$10.000': 115,
    '$25.000': 245,
    '$50.000': 345,
    '$100.000': 545,
    '$200.000': 1045,
  };

  // useEffect to calculate price
  useEffect(() => {
    const basePrice = baseChallengePrices[challengeAmount] || 0;
    
    let p1PriceAdjustment = 0;
    let p2PriceAdjustment = 0;

    if (activePhaseForProfitTargetBonus === 'P1') {
      p1PriceAdjustment = profitTargetP1Options.find(opt => opt.value === selectedProfitTargetP1)?.adjustment || 0;
    } else if (activePhaseForProfitTargetBonus === 'P2') {
      p2PriceAdjustment = profitTargetP2Options.find(opt => opt.value === selectedProfitTargetP2)?.adjustment || 0;
    }
    
    const splitAdjustment = profitSplitOptions.find(opt => opt.value === selectedProfitSplit)?.adjustment || 0;
    
    const totalPrice = basePrice + p1PriceAdjustment + p2PriceAdjustment + splitAdjustment;
    setPrice(`$${totalPrice.toFixed(2).replace('.', ',')}`);
  }, [challengeAmount, selectedProfitTargetP1, selectedProfitTargetP2, selectedProfitSplit, activePhaseForProfitTargetBonus]);

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
        challengeType: challengeType === 'Estándar' ? 'one_step' : 'two_step',
        challengeAmountString: challengeAmount,
        challengeAmountNumber: parseCurrencyToNumber(challengeAmount),
        selectedProfitTargetP1: selectedProfitTargetP1,
        selectedProfitTargetP2: selectedProfitTargetP2,
        selectedProfitSplit: selectedProfitSplit,
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
    <div className="bg-[#232323] text-white min-h-screen">
      {/* Main Content Wrapper */}
      <div className="p-4 md:p-8 rounded-2xl border border-[#333]">
        {/* Back Button Placeholder */}
        {/* 
        <div className="mb-4">
          <button className="text-white bg-[#2c2c2c] rounded-full p-2 hover:bg-[#3a3a3a]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>
        */}

        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
          {/* Left Column */}
          <div className="lg:w-2/3 w-full p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-2xl border border-[#333]">
            {/* Tipo Desafío Section */}
            <div className="mb-6 md:mb-10">
              <div className="flex items-center mb-4">
                <h2 className="text-xl md:text-2xl font-medium flex-1">
                  {t('tradingChallenge_label_challengeType')}
                  <span className="text-sm text-gray-400 font-normal">{t('tradingChallenge_leverage_info')}</span>
                </h2>
                <HelpCircle size={16} className="text-gray-400" />
              </div>
              <div className="flex space-x-3 md:space-x-4 mb-4 md:mb-6">
                <button 
                  className={`text-white px-6 py-2 rounded-full text-sm focus:outline-none bg-[#2c2c2c] border ${challengeType === 'Estándar' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeType('Estándar')}
                >
                  {t('tradingChallenge_button_standard', 'Estándar')}
                </button>
                <button 
                  className={`text-white px-6 py-2 rounded-full text-sm focus:outline-none bg-[#2c2c2c] border ${challengeType === 'Swim' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeType('Swim')}
                >
                  {t('tradingChallenge_button_swim', 'Swim')}
                </button>
              </div>
              
              {/* Monto del desafío Section */}
              <div className="flex items-center mb-3 md:mb-4">
                <h2 className="text-lg md:text-xl font-medium flex-1">{t('tradingChallenge_label_challengeAmount', 'Tamaño De Cuenta')}</h2>
                <Info size={16} className="text-gray-400" />
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-2">
                <button 
                  className={`w-full px-3 py-3 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$5.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$5.000')}
                >
                  $5.000
                </button>
                <button 
                  className={`w-full px-3 py-3 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$10.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$10.000')}
                >
                  $10.000
                </button>
                <button 
                  className={`w-full px-3 py-3 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$25.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$25.000')}
                >
                  $25.000
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-10">
                <button 
                  className={`w-full px-3 py-3 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$50.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$50.000')}
                >
                  $50.000
                </button>
                <button 
                  className={`w-full px-3 py-3 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$100.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$100.000')}
                >
                  $100.000
                </button>
                <button 
                  className={`w-full px-3 py-3 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] ${challengeAmount === '$200.000' ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                  onClick={() => setChallengeAmount('$200.000')}
                >
                  $200.000
                </button>
              </div>
              
              {/* Complementos Section */}
              <div className="mb-3">
                <div className="flex items-center mb-2">
                  <h2 className="text-xl md:text-2xl font-medium flex-1">{t('tradingChallenge_label_complements')}</h2>
                  <Info size={16} className="text-gray-400" />
                </div>
                <p className="text-white font-thin text-xs md:text-sm mb-4 md:mb-6">
                  {t('tradingChallenge_subtitle_complements', 'Selecciona complementos por tipo de trader')}
                </p>

                {/* Profit Target Fase 1 options */}
                <div className="mb-6 md:mb-8">
                  <h3 className="text-lg font-medium mb-3">{t('tradingChallenge_label_profitTargetP1', 'Profit Target Fase 1')}</h3>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {profitTargetP1Options.map(option => (
                  <button 
                        key={option.value}
                        className={`flex-1 text-center px-4 py-2 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] hover:bg-[#3a3a3a] ${activePhaseForProfitTargetBonus === 'P1' && selectedProfitTargetP1 === option.value ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                        onClick={() => { setSelectedProfitTargetP1(option.value); setActivePhaseForProfitTargetBonus('P1'); }}
                  >
                        <div className="font-medium">{option.text}</div>
                        {option.priceText && <div className="text-xs text-gray-400">{option.priceText}</div>}
                  </button>
                    ))}
                  </div>
                  </div>
                  
                {/* Profit Target Fase 2 options */}
                <div className="mb-6 md:mb-8">
                  <h3 className="text-lg font-medium mb-3">{t('tradingChallenge_label_profitTargetP2', 'Profit Target Fase 2')}</h3>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {profitTargetP2Options.map(option => (
                      <button
                        key={option.value}
                        className={`flex-1 text-center px-4 py-2 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] hover:bg-[#3a3a3a] ${activePhaseForProfitTargetBonus === 'P2' && selectedProfitTargetP2 === option.value ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                        onClick={() => { setSelectedProfitTargetP2(option.value); setActivePhaseForProfitTargetBonus('P2'); }}
                      >
                        <div className="font-medium">{option.text}</div>
                        {option.priceText && <div className="text-xs text-gray-400">{option.priceText}</div>}
                      </button>
                    ))}
                  </div>
                  </div>
                  
                {/* Profit Split options */}
                <div className="mb-6 md:mb-10">
                  <h3 className="text-lg font-medium mb-3">{t('tradingChallenge_label_profitSplit', 'Profit Split')}</h3>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {profitSplitOptions.map(option => (
                      <button
                        key={option.value}
                        className={`flex-1 text-center px-4 py-2 rounded-full text-sm border focus:outline-none bg-[#2c2c2c] hover:bg-[#3a3a3a] ${selectedProfitSplit === option.value ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
                        onClick={() => setSelectedProfitSplit(option.value)}
                      >
                        <div className="font-medium">{option.text}</div>
                        {option.priceText && <div className="text-xs text-gray-400">{option.priceText}</div>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Price, Platform, Currency Section */}
              <div className="space-y-3 text-base md:text-lg">
                <div className="flex justify-between items-center">
                  <span>{t('tradingChallenge_label_price')}</span>
                  <span className="font-medium">{price}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-700 pt-3 mt-3">
                  <span>{t('tradingChallenge_label_platform')}</span>
                  <span className="font-medium">{t('tradingChallenge_label_platformValuePlaceholder')}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-700 pt-3 mt-3">
                  <span>{t('tradingChallenge_label_currency')}</span>
                  <span className="font-medium">{t('tradingChallenge_label_currencyUsd')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:w-1/3 w-full p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-2xl border border-[#333]">
            <div className="mb-6 md:mb-10">
              <h2 className="text-base md:text-lg font-medium mb-3">{t('tradingChallenge_label_promoCode')}</h2>
              <div className="flex space-x-2">
                <input
                  className="flex-1 bg-[#2c2c2c] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  placeholder={t('tradingChallenge_placeholder_enterCode')}
                />
                <button className="border border-cyan-500 bg-[#2c2c2c] hover:bg-[#3a3a3a] text-white px-6 py-2 rounded-lg text-sm">
                  {t('tradingChallenge_button_apply')}
                </button>
              </div>
            </div>
            
            <div className="mb-6 md:mb-10">
              <h2 className="text-base md:text-lg font-medium mb-3">{t('tradingChallenge_label_paymentMethod')}</h2>
              <div className="flex items-center justify-between bg-[#2c2c2c] border border-gray-700 rounded-lg px-4 py-3 cursor-pointer hover:border-cyan-600">
                <span className="text-sm text-gray-400">{t('tradingChallenge_placeholder_select')}</span>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
            
            <button 
              className="w-full bg-[#2c2c2c] border border-cyan-500 hover:bg-[#3a3a3a] text-white py-3 px-4 rounded-lg mb-3 text-sm font-medium disabled:opacity-50"
              onClick={handlePurchaseChallenge}
              disabled={isPurchasing}
            >
              {isPurchasing ? t('tradingChallenge_button_processing') : t('tradingChallenge_button_proceedToPayment')}
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              {t('tradingChallenge_disclaimer_acceptance')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}