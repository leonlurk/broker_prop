import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';
import { Star, Search as SearchIcon } from 'lucide-react';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// Expanded and refined list of ONLY Forex currency pairs
const allInstruments = [
  // Major Pairs - UPDATED
  { value: 'EUR/USD', label: 'EUR/USD' }, 
  { value: 'GBP/USD', label: 'GBP/USD' },
  { value: 'USD/JPY', label: 'USD/JPY' }, 
  { value: 'USD/CHF', label: 'USD/CHF' },
  { value: 'USD/CAD', label: 'USD/CAD' }, 
  { value: 'AUD/USD', label: 'AUD/USD' },
  { value: 'NZD/USD', label: 'NZD/USD' },

  // Minor Pairs (Crosses) - EUR - UPDATED
  { value: 'EUR/GBP', label: 'EUR/GBP' }, { value: 'EUR/JPY', label: 'EUR/JPY' },
  { value: 'EUR/CHF', label: 'EUR/CHF' }, { value: 'EUR/AUD', label: 'EUR/AUD' },
  { value: 'EUR/CAD', label: 'EUR/CAD' }, { value: 'EUR/NZD', label: 'EUR/NZD' },
  { value: 'EUR/NOK', label: 'EUR/NOK' }, { value: 'EUR/SEK', label: 'EUR/SEK' },
  { value: 'EUR/PLN', label: 'EUR/PLN' }, { value: 'EUR/HUF', label: 'EUR/HUF' },
  { value: 'EUR/CZK', label: 'EUR/CZK' }, { value: 'EUR/TRY', label: 'EUR/TRY' },
  { value: 'EUR/ZAR', label: 'EUR/ZAR' }, { value: 'EUR/SGD', label: 'EUR/SGD' },
  { value: 'EUR/HKD', label: 'EUR/HKD' }, { value: 'EUR/MXN', label: 'EUR/MXN' },

  // Minor Pairs (Crosses) - GBP - UPDATED
  { value: 'GBP/JPY', label: 'GBP/JPY' }, { value: 'GBP/CHF', label: 'GBP/CHF' },
  { value: 'GBP/AUD', label: 'GBP/AUD' }, { value: 'GBP/CAD', label: 'GBP/CAD' },
  { value: 'GBP/NZD', label: 'GBP/NZD' }, { value: 'GBP/NOK', label: 'GBP/NOK' },
  { value: 'GBP/SEK', label: 'GBP/SEK' }, { value: 'GBP/PLN', label: 'GBP/PLN' },
  { value: 'GBP/ZAR', label: 'GBP/ZAR' }, { value: 'GBP/SGD', label: 'GBP/SGD' },

  // Minor Pairs (Crosses) - AUD - UPDATED
  { value: 'AUD/JPY', label: 'AUD/JPY' }, { value: 'AUD/CHF', label: 'AUD/CHF' },
  { value: 'AUD/CAD', label: 'AUD/CAD' }, { value: 'AUD/NZD', label: 'AUD/NZD' },
  { value: 'AUD/SGD', label: 'AUD/SGD' }, { value: 'AUD/HKD', label: 'AUD/HKD' },

  // Minor Pairs (Crosses) - NZD - UPDATED
  { value: 'NZD/JPY', label: 'NZD/JPY' }, { value: 'NZD/CHF', label: 'NZD/CHF' },
  { value: 'NZD/CAD', label: 'NZD/CAD' }, { value: 'NZD/SGD', label: 'NZD/SGD' },

  // Minor Pairs (Crosses) - CAD - UPDATED
  { value: 'CAD/JPY', label: 'CAD/JPY' }, { value: 'CAD/CHF', label: 'CAD/CHF' },
  { value: 'CAD/SGD', label: 'CAD/SGD' },

  // Minor Pairs (Crosses) - CHF - UPDATED
  { value: 'CHF/JPY', label: 'CHF/JPY' }, { value: 'CHF/NOK', label: 'CHF/NOK' },
  { value: 'CHF/SEK', label: 'CHF/SEK' },

  // Exotic Pairs - UPDATED
  { value: 'USD/NOK', label: 'USD/NOK' }, { value: 'USD/SEK', label: 'USD/SEK' },
  { value: 'USD/DKK', label: 'USD/DKK' }, { value: 'USD/PLN', label: 'USD/PLN' },
  { value: 'USD/HUF', label: 'USD/HUF' }, { value: 'USD/CZK', label: 'USD/CZK' },
  { value: 'USD/TRY', label: 'USD/TRY' }, { value: 'USD/ZAR', label: 'USD/ZAR' },
  { value: 'USD/MXN', label: 'USD/MXN' }, { value: 'USD/SGD', label: 'USD/SGD' },
  { value: 'USD/HKD', label: 'USD/HKD' }, { value: 'USD/THB', label: 'USD/THB' },
  { value: 'USD/CNH', label: 'USD/CNH' }, { value: 'USD/ILS', label: 'USD/ILS' },
  { value: 'USD/RUB', label: 'USD/RUB' }, // Note: May have trading restrictions

  // Other common exotic crosses - UPDATED
  { value: 'NOK/SEK', label: 'NOK/SEK' },
  { value: 'SEK/NOK', label: 'SEK/NOK' }, // Inverse of above
  { value: 'TRY/JPY', label: 'TRY/JPY' },
  { value: 'ZAR/JPY', label: 'ZAR/JPY' },
];

// Componente principal
const PipCalculator = () => {
  const { language, currentUser } = useAuth();
  const t = getTranslator(language);

  const [activeTab, setActiveTab] = useState('pips');
  const [pipValue, setPipValue] = useState(1.00);
  const [positionSize, setPositionSize] = useState(1.00);
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [instrument, setInstrument] = useState('AUD/CAD'); // Default to a common pair
  const [isMobile, setIsMobile] = useState(false);
  const [stopLossPips, setStopLossPips] = useState(10); // Default SL pips
  const [calculatedResult, setCalculatedResult] = useState(null);
  const [riskPercentage, setRiskPercentage] = useState(1);
  const [accountBalance, setAccountBalance] = useState(10000);
  
  // Raw input states for more intuitive typing
  const [rawPipValueInput, setRawPipValueInput] = useState(pipValue.toFixed(2));
  const [rawPositionSizeInput, setRawPositionSizeInput] = useState(positionSize.toFixed(2));
  const [rawAccountBalanceInput, setRawAccountBalanceInput] = useState(accountBalance.toString());
  const [rawRiskPercentageInput, setRawRiskPercentageInput] = useState(riskPercentage.toString());
  const [rawStopLossPipsInput, setRawStopLossPipsInput] = useState(stopLossPips.toString());
  
  // New state for instrument search and favorites
  const [instrumentSearchTerm, setInstrumentSearchTerm] = useState('');
  const [favoriteInstruments, setFavoriteInstruments] = useState([]);
  const [showInstrumentDropdown, setShowInstrumentDropdown] = useState(false);
  const instrumentDropdownRef = useRef(null); // Ref for the dropdown container

  // Load favorites from Firestore on mount if user is logged in
  useEffect(() => {
    if (currentUser) {
      const userPrefsRef = doc(db, 'userPreferences', currentUser.uid);
      getDoc(userPrefsRef).then(docSnap => {
        if (docSnap.exists() && docSnap.data().favoritePipInstruments) {
          setFavoriteInstruments(docSnap.data().favoritePipInstruments);
        }
      }).catch(error => {
        console.error("Error fetching favorite instruments from Firestore:", error);
      });
    }
    // Clear favorites if user logs out or changes
    return () => {
      if (!currentUser) {
        setFavoriteInstruments([]);
      }
    };
  }, [currentUser]);

  // Effect to handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (instrumentDropdownRef.current && !instrumentDropdownRef.current.contains(event.target)) {
        setShowInstrumentDropdown(false);
      }
    };

    if (showInstrumentDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInstrumentDropdown]);

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Update raw input when numeric state changes (e.g. from +/- buttons)
  useEffect(() => { setRawPipValueInput(pipValue.toFixed(2)); }, [pipValue]);
  useEffect(() => { setRawPositionSizeInput(positionSize.toFixed(2)); }, [positionSize]);
  useEffect(() => { setRawAccountBalanceInput(accountBalance.toString()); }, [accountBalance]);
  useEffect(() => { setRawRiskPercentageInput(riskPercentage.toString()); }, [riskPercentage]);
  useEffect(() => { setRawStopLossPipsInput(stopLossPips.toString()); }, [stopLossPips]);

  const handlePipChange = (increment) => {
    setPipValue(prev => {
      const newValue = parseFloat((prev + increment).toFixed(2));
      return newValue > 0 ? newValue : prev;
    });
  };

  const handlePositionSizeChange = (increment) => {
    setPositionSize(prev => {
      const newValue = parseFloat((prev + increment).toFixed(2));
      return newValue > 0 ? newValue : prev;
    });
  };

  // Generic handler for input changes
  const handleRawInputChange = (value, setter, allowDecimal = true, maxChars) => {
    let sanitizedValue = value;
    if (allowDecimal) {
      sanitizedValue = value.replace(/,/g, '.'); // Allow comma as decimal, convert to period
      if (!/^\d*\.?\d*$/.test(sanitizedValue)) {
        return; 
      }
    } else {
      if (!/^\d*$/.test(sanitizedValue)) {
        return; 
      }
    }
    if (maxChars && sanitizedValue.length > maxChars) {
        sanitizedValue = sanitizedValue.substring(0, maxChars);
    }
    setter(sanitizedValue);
  };

  // Generic handler for input blur
  const handleNumericInputBlur = (rawValue, numericSetter, currentNumericValue, min = 0, max = Infinity, decimalPlaces = 2, isInteger = false) => {
    let num = parseFloat(rawValue.replace(/,/g, '.'));

    if (isNaN(num) || num < min) {
      num = min;
    } else if (num > max) {
      num = max;
    }
    
    if (isInteger) {
        num = Math.round(num);
        numericSetter(num);
    } else {
        numericSetter(parseFloat(num.toFixed(decimalPlaces)));
    }
  };

  // Calcular la conversión de monedas
  const getExchangeRate = (base, quote) => {
    const rates = {
      // Major USD pairs (bi-directional for easier lookup) - UPDATED
      'EUR/USD': 1.0850, 'USD/EUR': 1 / 1.0850,
      'GBP/USD': 1.2700, 'USD/GBP': 1 / 1.2700,
      'USD/JPY': 150.00, 'JPY/USD': 1 / 150.00,
      'USD/CHF': 0.8800, 'CHF/USD': 1 / 0.8800,
      'USD/CAD': 1.3500, 'CAD/USD': 1 / 1.3500,
      'AUD/USD': 0.6550, 'USD/AUD': 1 / 0.6550,
      'NZD/USD': 0.6150, 'USD/NZD': 1 / 0.6150,

      // Common EUR crosses - UPDATED
      'EUR/GBP': 0.8550, 'GBP/EUR': 1 / 0.8550,
      'EUR/JPY': 162.75, 'JPY/EUR': 1 / 162.75,
      'EUR/CHF': 0.9550, 'CHF/EUR': 1 / 0.9550,
      'EUR/AUD': 1.6560, 'AUD/EUR': 1 / 1.6560,
      'EUR/CAD': 1.4650, 'CAD/EUR': 1 / 1.4650,
      'EUR/NZD': 1.7640, 'NZD/EUR': 1 / 1.7640,
      'EUR/NOK': 11.3000, 'NOK/EUR': 1 / 11.3000,
      'EUR/SEK': 11.2000, 'SEK/EUR': 1 / 11.2000,
      'EUR/PLN': 4.3300, 'PLN/EUR': 1 / 4.3300,
      'EUR/HUF': 390.00, 'HUF/EUR': 1 / 390.00,
      'EUR/CZK': 25.20,  'CZK/EUR': 1 / 25.20,
      'EUR/TRY': 33.5000,'TRY/EUR': 1 / 33.5000,
      'EUR/ZAR': 20.5000,'ZAR/EUR': 1 / 20.5000,
      'EUR/SGD': 1.4580, 'SGD/EUR': 1 / 1.4580,
      'EUR/HKD': 8.4880, 'HKD/EUR': 1 / 8.4880,
      'EUR/MXN': 18.4500,'MXN/EUR': 1 / 18.4500,

      // Common GBP crosses - UPDATED
      'GBP/JPY': 190.50, 'JPY/GBP': 1 / 190.50,
      'GBP/CHF': 1.1180, 'CHF/GBP': 1 / 1.1180,
      'GBP/AUD': 1.9380, 'AUD/GBP': 1 / 1.9380,
      'GBP/CAD': 1.7145, 'CAD/GBP': 1 / 1.7145,
      'GBP/NZD': 2.0650, 'NZD/GBP': 1 / 2.0650,
      'GBP/NOK': 13.2200,'NOK/GBP': 1 / 13.2200,
      'GBP/SEK': 13.1000,'SEK/GBP': 1 / 13.1000,
      'GBP/PLN': 5.0670, 'PLN/GBP': 1 / 5.0670,
      'GBP/ZAR': 24.0000,'ZAR/GBP': 1 / 24.0000,
      'GBP/SGD': 1.7070, 'SGD/GBP': 1 / 1.7070,

      // Common AUD crosses - UPDATED
      'AUD/JPY': 98.25,  'JPY/AUD': 1 / 98.25,
      'AUD/CHF': 0.5760, 'CHF/AUD': 1 / 0.5760,
      'AUD/CAD': 0.8840, 'CAD/AUD': 1 / 0.8840,
      'AUD/NZD': 1.0650, 'NZD/AUD': 1 / 1.0650,
      'AUD/SGD': 0.8800, 'SGD/AUD': 1 / 0.8800,
      'AUD/HKD': 5.1200, 'HKD/AUD': 1 / 5.1200,

      // Common NZD crosses - UPDATED
      'NZD/JPY': 92.25,  'JPY/NZD': 1 / 92.25,
      'NZD/CHF': 0.5410, 'CHF/NZD': 1 / 0.5410,
      'NZD/CAD': 0.8300, 'CAD/NZD': 1 / 0.8300,
      'NZD/SGD': 0.8260, 'SGD/NZD': 1 / 0.8260,

      // Common CAD crosses - UPDATED
      'CAD/JPY': 111.10, 'JPY/CAD': 1 / 111.10,
      'CAD/CHF': 0.6520, 'CHF/CAD': 1 / 0.6520,
      'CAD/SGD': 0.9950, 'SGD/CAD': 1 / 0.9950,

      // Common CHF crosses - UPDATED
      'CHF/JPY': 170.45, 'JPY/CHF': 1 / 170.45,
      'CHF/NOK': 11.8500,'NOK/CHF': 1 / 11.8500,
      'CHF/SEK': 11.7000,'SEK/CHF': 1 / 11.7000,

      // USD Exotic Pairs (Direct) - UPDATED
      'USD/NOK': 10.5000, 'NOK/USD': 1 / 10.5000,
      'USD/SEK': 10.4000, 'SEK/USD': 1 / 10.4000,
      'USD/DKK': 6.8500,  'DKK/USD': 1 / 6.8500,
      'USD/PLN': 3.9800,  'PLN/USD': 1 / 3.9800,
      'USD/HUF': 360.00,  'HUF/USD': 1 / 360.00,
      'USD/CZK': 23.3000, 'CZK/USD': 1 / 23.3000,
      'USD/TRY': 32.0000, 'TRY/USD': 1 / 32.0000,
      'USD/ZAR': 18.9000, 'ZAR/USD': 1 / 18.9000,
      'USD/MXN': 17.0000, 'MXN/USD': 1 / 17.0000,
      'USD/SGD': 1.3450,  'SGD/USD': 1 / 1.3450,
      'USD/HKD': 7.8200,  'HKD/USD': 1 / 7.8200,
      'USD/THB': 35.8000, 'THB/USD': 1 / 35.8000,
      'USD/CNH': 7.2500,  'CNH/USD': 1 / 7.2500,
      'USD/ILS': 3.7000,  'ILS/USD': 1 / 3.7000,
      'USD/RUB': 92.0000, 'RUB/USD': 1 / 92.0000,

      // Other exotic crosses - UPDATED
      'NOK/SEK': 0.9900, 'SEK/NOK': 1 / 0.9900,
      'TRY/JPY': 4.6875, 'JPY/TRY': 1 / 4.6875, 
      'ZAR/JPY': 7.9365, 'JPY/ZAR': 1 / 7.9365  
    };
    
    if (rates[`${base}/${quote}`]) {
      return rates[`${base}/${quote}`];
    } else if (rates[`${quote}/${base}`]) {
      return 1 / rates[`${quote}/${base}`];
    }
    
    if (rates[`${base}/USD`] && rates[`USD/${quote}`]) {
      return rates[`${base}/USD`] * rates[`USD/${quote}`];
    } else if (rates[`USD/${base}`] && rates[`USD/${quote}`]) {
      return rates[`USD/${quote}`] / rates[`USD/${base}`];
    } else if (rates[`USD/${base}`] && rates[`${quote}/USD`]) {
      return 1 / (rates[`USD/${base}`] * rates[`${quote}/USD`]);
    }
    
    console.warn(`Exchange rate not found for ${base}/${quote}, returning 1. Cross rates via USD might be missing or incorrect.`);
    return 1; // Default fallback if no direct or USD cross-rate found
  };

  // Calcular el valor de pip para el par de divisas y la moneda de la cuenta
  const calculatePipValue = () => {
    const [base, quote] = instrument.split('/');
    let pipMultiplier = 0.0001; 
    
    if (quote.toUpperCase() === 'JPY') { // More robust check for JPY
      pipMultiplier = 0.01;
    }
    
    let pipValueInQuote = positionSize * 100000 * pipMultiplier;
    
    if (quote.toUpperCase() === accountCurrency.toUpperCase()) { // Case-insensitive currency check
      return pipValueInQuote;
    } else {
      const exchangeRate = getExchangeRate(quote, accountCurrency);
      if (exchangeRate === 1 && quote.toUpperCase() !== accountCurrency.toUpperCase()) {
          // If exchangeRate defaulted to 1 and it's not the same currency, log a warning.
          console.warn(`Could not find exchange rate for ${quote} to ${accountCurrency}. Pip value calculation might be inaccurate.`);
      }
      return pipValueInQuote * exchangeRate;
    }
  };

  // Calcular el tamaño de posición basado en riesgo
  const calculatePositionSize = () => {
    const riskAmountValue = (accountBalance * riskPercentage) / 100;
    
    let pipValuePerLot;
    const tempOriginalPositionSize = positionSize; // Store current position size

    // Calculate pip value for ONE lot
    // Temporarily set positionSize to 1 for this specific calculation, then revert.
    // This relies on calculatePipValue using the `positionSize` state.
    // A more robust way would be for calculatePipValue to accept size as a parameter.
    // For now, this workaround:
    const currentInstrumentForCalc = instrument;
    const currentAccountCurrencyForCalc = accountCurrency;

    const getPipValueForOneLot = () => {
        const [base, quote] = currentInstrumentForCalc.split('/');
        let pipMultiplier = 0.0001;
        if (quote.toUpperCase() === 'JPY') {
            pipMultiplier = 0.01;
        }
        let valueInQuoteCurrency = 1 * 100000 * pipMultiplier; // For 1 lot (100,000 units)
        if (quote.toUpperCase() === currentAccountCurrencyForCalc.toUpperCase()) {
            return valueInQuoteCurrency;
        } else {
            const rate = getExchangeRate(quote, currentAccountCurrencyForCalc);
            return valueInQuoteCurrency * rate;
        }
    };

    pipValuePerLot = getPipValueForOneLot();

    const calculatedSize = stopLossPips > 0 && pipValuePerLot > 0 ? riskAmountValue / (stopLossPips * pipValuePerLot) : 0;
    
    return {
      positionSize: calculatedSize.toFixed(2), 
      riskAmount: riskAmountValue.toFixed(2)
    };
  };

  // Ejecutar cálculo basado en la pestaña activa
  const handleCalculate = () => {
    if (activeTab === 'pips') {
      const totalPipValue = calculatePipValue() * pipValue; // calculatePipValue gives for current positionSize, then multiply by pips
      setCalculatedResult({
        pipsValue: totalPipValue.toFixed(2),
        currency: accountCurrency
      });
    } else {
      const result = calculatePositionSize();
      setCalculatedResult({
        suggestedSize: result.positionSize,
        riskAmount: result.riskAmount,
        currency: accountCurrency
      });
    }
  };

  const toggleFavorite = async (instrumentValue) => {
    if (!currentUser) {
      setFavoriteInstruments(prev =>
        prev.includes(instrumentValue)
          ? prev.filter(fav => fav !== instrumentValue)
          : [...prev, instrumentValue]
      );
      return;
    }

    const userPrefsRef = doc(db, 'userPreferences', currentUser.uid);
    const isCurrentlyFavorite = favoriteInstruments.includes(instrumentValue);

    setFavoriteInstruments(prev =>
      isCurrentlyFavorite
        ? prev.filter(fav => fav !== instrumentValue)
        : [...prev, instrumentValue]
    );

    try {
      if (isCurrentlyFavorite) {
        await updateDoc(userPrefsRef, {
          favoritePipInstruments: arrayRemove(instrumentValue)
        });
      } else {
        await setDoc(userPrefsRef, {
          favoritePipInstruments: arrayUnion(instrumentValue)
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error updating favorite instruments in Firestore:", error);
      setFavoriteInstruments(prev =>
        isCurrentlyFavorite
          ? [...prev, instrumentValue] 
          : prev.filter(fav => fav !== instrumentValue) 
      );
    }
  };

  const searchedInstruments = allInstruments
    .filter(item => item.label.toLowerCase().includes(instrumentSearchTerm.toLowerCase()));

  const favoriteFilteredInstruments = searchedInstruments
    .filter(item => favoriteInstruments.includes(item.value))
    .sort((a, b) => a.label.localeCompare(b.label)); 

  const nonFavoriteFilteredInstruments = searchedInstruments
    .filter(item => !favoriteInstruments.includes(item.value))
    .sort((a, b) => a.label.localeCompare(b.label)); 

  const currencies = [
    { code: 'USD', flag: '/us.png' },
  ];

  const pipsCurrencies = [
    { code: 'USD', flag: '/us.png' },
  ];

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-3xl text-white flex flex-col">
      {/* Tabs - Responsivos */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
        <button 
          onClick={() => setActiveTab('pips')}
          className={`px-4 md:px-6 py-2 rounded-full text-base md:text-lg border ${
            activeTab === 'pips' 
              ? 'border-cyan-500 bg-transparent' 
              : 'border-gray-700 bg-gradient-to-br from-[#232323] to-[#2d2d2d]'
          }`}
          style={{ outline: 'none' }}
        >
          {t('pipCalculator_tab_pips')}
        </button>
        <button 
          onClick={() => setActiveTab('position')}
          className={`px-4 md:px-6 py-2 rounded-full text-base md:text-lg border ${
            activeTab === 'position' 
              ? 'border-cyan-500 bg-transparent' 
              : 'border-gray-700 bg-gradient-to-br from-[#232323] to-[#2d2d2d]'
          }`}
          style={{ outline: 'none' }}
        >
          {t('pipCalculator_tab_positionSize')}
        </button>
      </div>

      {/* Contenedor principal - Responsive */}
      <div className="flex-1 border border-[#333] rounded-3xl p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] flex flex-col overflow-y-auto custom-scrollbar">
        {/* Instrumento - Responsivo */}
        <div className="mb-6">
          <h2 className="text-base md:text-lg mb-2">{t('pipCalculator_label_instrument')}</h2>
          <div className="relative w-full sm:w-3/4 md:w-1/2" ref={instrumentDropdownRef}>
            <div className="flex items-center bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-lg">
              <input
                type="text"
                value={instrument}
                onClick={() => setShowInstrumentDropdown(!showInstrumentDropdown)}
                readOnly
                className="w-full bg-transparent px-4 py-3 appearance-none cursor-pointer focus:outline-none"
                placeholder={t('pipCalculator_placeholder_selectInstrument')}
              />
              <div 
                className="p-3 cursor-pointer"
                onClick={() => setShowInstrumentDropdown(!showInstrumentDropdown)}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>

            {showInstrumentDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-[#2d2d2d] border border-[#444] rounded-lg shadow-lg max-h-72 overflow-y-auto custom-scrollbar"> {/* Added custom-scrollbar here too */}
                <div className="p-2 sticky top-0 bg-[#2d2d2d] z-20">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t('pipCalculator_placeholder_searchInstrument')}
                      value={instrumentSearchTerm}
                      onChange={(e) => setInstrumentSearchTerm(e.target.value)}
                      className="w-full bg-[#232323] border border-[#444] rounded-md px-3 py-2 pl-10 focus:outline-none focus:border-cyan-500"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
                {favoriteFilteredInstruments.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs text-gray-400 font-semibold sticky top-12 bg-[#2d2d2d] z-10">{t('pipCalculator_favorites_heading', 'Favorites')}</div>
                    {favoriteFilteredInstruments.map(item => (
                      <div
                        key={item.value + '-fav'}
                        onClick={() => {
                          setInstrument(item.value);
                          setShowInstrumentDropdown(false);
                          setInstrumentSearchTerm(''); 
                        }}
                        className={`px-4 py-3 hover:bg-[#3a3a3a] cursor-pointer flex justify-between items-center ${instrument === item.value ? 'bg-[#3f3f3f]' : ''}`}
                      >
                        <span>{item.label}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); 
                            toggleFavorite(item.value);
                          }}
                          className="p-1 rounded-full hover:bg-[#4f4f4f] focus:outline-none"
                          title={favoriteInstruments.includes(item.value) ? t('pipCalculator_tooltip_removeFromFavorites') : t('pipCalculator_tooltip_addToFavorites')}
                        >
                          <Star 
                            className={`w-4 h-4 ${favoriteInstruments.includes(item.value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} 
                          />
                        </button>
                      </div>
                    ))}
                  </>
                )}
                {nonFavoriteFilteredInstruments.length > 0 && (
                  <>
                    {favoriteFilteredInstruments.length > 0 && nonFavoriteFilteredInstruments.length > 0 && (
                       <div className="px-4 py-2 text-xs text-gray-400 font-semibold sticky top-12 bg-[#2d2d2d] z-10">
                         {t('pipCalculator_allInstruments_heading', 'All Instruments')}
                       </div>
                    )}
                    {nonFavoriteFilteredInstruments.map(item => (
                      <div
                        key={item.value}
                        onClick={() => {
                          setInstrument(item.value);
                          setShowInstrumentDropdown(false);
                          setInstrumentSearchTerm(''); 
                        }}
                        className={`px-4 py-3 hover:bg-[#3a3a3a] cursor-pointer flex justify-between items-center ${instrument === item.value ? 'bg-[#3f3f3f]' : ''}`}
                      >
                        <span>{item.label}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); 
                            toggleFavorite(item.value);
                          }}
                          className="p-1 rounded-full hover:bg-[#4f4f4f] focus:outline-none"
                          title={favoriteInstruments.includes(item.value) ? t('pipCalculator_tooltip_removeFromFavorites') : t('pipCalculator_tooltip_addToFavorites')}
                        >
                          <Star 
                            className={`w-4 h-4 ${favoriteInstruments.includes(item.value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} 
                          />
                        </button>
                      </div>
                    ))}
                  </>
                )}
                {favoriteFilteredInstruments.length === 0 && nonFavoriteFilteredInstruments.length === 0 && (
                  <div className="px-4 py-3 text-gray-400 text-sm">
                    {t('pipCalculator_noResultsFound')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {activeTab === 'pips' ? (
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-4 mb-6">
            <div className="w-full md:w-1/2">
              <h2 className="text-base md:text-lg mb-2">{t('pipCalculator_label_pipAmount')}</h2>
              <div className="relative flex items-center">
                <button 
                  onClick={() => handlePipChange(-0.01)}
                  className="bg-transparent absolute left-4 text-2xl text-gray-400 focus:outline-none"
                >
                  ‹
                </button>
                <input 
                  type="text" 
                  value={rawPipValueInput}
                  onChange={(e) => handleRawInputChange(e.target.value, setRawPipValueInput)}
                  onBlur={() => handleNumericInputBlur(rawPipValueInput, setPipValue, pipValue, 0.01)}
                  className="w-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-lg px-12 py-4 md:py-5 text-center"
                  style={{ outline: 'none' }}
                  placeholder="0.00"
                />
                <button 
                  onClick={() => handlePipChange(0.01)}
                  className="absolute bg-transparent right-4 text-2xl text-gray-400 focus:outline-none"
                >
                  ›
                </button>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-base md:text-lg mb-2">{t('pipCalculator_label_positionSizeLots')}</h2>
              <div className="relative flex items-center">
                <button 
                  onClick={() => handlePositionSizeChange(-0.01)}
                  className="absolute left-4 text-2xl bg-transparent text-gray-400 focus:outline-none"
                >
                  ‹
                </button>
                <input 
                  type="text" 
                  value={rawPositionSizeInput}
                  onChange={(e) => handleRawInputChange(e.target.value, setRawPositionSizeInput)}
                  onBlur={() => handleNumericInputBlur(rawPositionSizeInput, setPositionSize, positionSize, 0.01)}
                  className="w-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-lg px-12 py-4 md:py-5 text-center focus:outline-none"
                  placeholder="0.00"
                />
                <button 
                  onClick={() => handlePositionSizeChange(0.01)}
                  className="focus:outline-none absolute right-4 text-2xl bg-transparent text-gray-400"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-base md:text-lg mb-2">{t('pipCalculator_label_accountBalance')}</h2>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={rawAccountBalanceInput}
                    onChange={(e) => handleRawInputChange(e.target.value, setRawAccountBalanceInput, false, 10)} 
                    onBlur={() => handleNumericInputBlur(rawAccountBalanceInput, setAccountBalance, accountBalance, 1, Infinity, 0, true)} 
                    className="w-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-lg px-4 py-4 text-center focus:outline-none"
                    placeholder="10000"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-base md:text-lg mb-2">{t('pipCalculator_label_riskPercentage')}</h2>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={rawRiskPercentageInput}
                    onChange={(e) => handleRawInputChange(e.target.value, setRawRiskPercentageInput, true, 5)} 
                    onBlur={() => handleNumericInputBlur(rawRiskPercentageInput, setRiskPercentage, riskPercentage, 0.01, 100, 2)} 
                    className="w-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-lg px-4 py-4 text-center focus:outline-none"
                    placeholder="1"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-base md:text-lg mb-2">{t('pipCalculator_label_pipTarget')}</h2>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={rawStopLossPipsInput}
                    onChange={(e) => handleRawInputChange(e.target.value, setRawStopLossPipsInput, false, 5)} 
                    onBlur={() => handleNumericInputBlur(rawStopLossPipsInput, setStopLossPips, stopLossPips, 1, Infinity, 0, true)} 
                    className="w-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-lg px-4 py-4 text-center focus:outline-none"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-base md:text-lg mb-2">{t('pipCalculator_label_accountCurrency')}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {(activeTab === 'pips' ? pipsCurrencies : currencies).map((currency) => (
              <button
                key={currency.code}
                onClick={() => setAccountCurrency(currency.code)}
                className={`flex items-center justify-center space-x-1 md:space-x-2 py-2 md:py-3 px-2 md:px-4 rounded-lg border ${
                  accountCurrency === currency.code 
                    ? 'border-cyan-500 bg-transparent' 
                    : 'border-gray-700 bg-gradient-to-br from-[#232323] to-[#2d2d2d]'
                }`}
                style={{ outline: 'none' }}
              >
                <img src={currency.flag} alt={currency.code} className="w-4 h-4 md:w-5 md:h-5 object-cover rounded-full" />
                <span className="text-xs md:text-base">{currency.code}</span>
              </button>
            ))}
          </div>
        </div>

        {calculatedResult && (
          <div className="my-6 p-4 border border-cyan-700 rounded-lg bg-gradient-to-br from-[#152e35] to-[#1a3746]">
            <h2 className="text-lg md:text-xl mb-3 text-cyan-300">{t('pipCalculator_result_pipValue')}:</h2>
            {activeTab === 'pips' ? (
              <p className="text-xl font-bold">
                {parseFloat(pipValue).toFixed(2)} pip{pipValue !== 1 ? 's' : ''} = {calculatedResult.pipsValue} {calculatedResult.currency}
              </p>
            ) : (
              <div>
                <p className="text-lg md:text-xl mb-2">
                  {t('pipCalculator_result_suggestedPositionSize')}: <span className="font-bold">{calculatedResult.suggestedSize} lotes</span>
                </p>
                <p className="text-base md:text-lg text-cyan-200">
                  {t('pipCalculator_result_riskedAmount')}: {calculatedResult.riskAmount} {calculatedResult.currency} ({riskPercentage}% del balance)
                </p>
              </div>
            )}
          </div>
        )}

        <button 
          onClick={handleCalculate}
          className="focus:outline-none mt-6 w-full sm:w-1/2 md:w-1/6 bg-gradient-to-r from-[#0F7490] to-[#0A5A72] text-white py-3 rounded-xl hover:opacity-90 transition"
        >
          {t('pipCalculator_button_calculate')}
        </button>
      </div>
    </div>
  );
};

export default PipCalculator;