import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

const CertificateComponent = () => {
  const { language } = useAuth();
  const t = getTranslator(language);
  console.log('Current language in CertificateComponent:', language);
  const [activeButton, setActiveButton] = useState('superacion');

  return (
    <div className="w-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] p-6 rounded-2xl border border-[#333]">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <button 
          className={`bg-gradient-to-br from-[#232323] to-[#2d2d2d] text-white py-2 px-4 rounded-full text-center border focus:outline-none ${activeButton === 'superacion' ? 'border-cyan-500 border-opacity-50' : 'border-[#333]'}`}
          onClick={() => setActiveButton('superacion')}
        >
          {t('certificate_button_challengeSuccess')}
        </button>
        <button 
          className={`bg-transparent text-white py-2 px-4 rounded-full text-center border focus:outline-none ${activeButton === 'pago' ? 'border-cyan-500 border-opacity-50' : 'border-[#333]'}`}
          onClick={() => setActiveButton('pago')}
        >
          {t('certificate_button_paymentCertificate')}
        </button>
      </div>
    </div>
  );
};

export default CertificateComponent;