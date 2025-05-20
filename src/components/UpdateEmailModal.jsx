import React, { useState } from 'react';
import { X } from 'lucide-react';
import { auth } from '../firebase/config';
import { updateEmail, sendEmailVerification } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

const UpdateEmailModal = ({ isOpen, onClose }) => {
  const { language } = useAuth();
  const t = getTranslator(language);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-2xl border border-[#333] w-full max-w-md p-5 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label={t('modal_close_aria_label')}
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-semibold text-white mb-4">{t('updateEmailModal_title')}</h2>

        <div className="text-gray-300 mb-6 text-center">
          <p>
            {t('settings_modal_contactAdminForChange', { item: t('settings_label_email') })}
          </p>
        </div>
        
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gradient-to-r from-[#0F7490] to-[#0A5A72] text-white py-2 px-6 rounded-xl hover:opacity-90 transition w-full sm:w-auto"
          >
            {t('updateEmailModal_button_closeModal')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateEmailModal;