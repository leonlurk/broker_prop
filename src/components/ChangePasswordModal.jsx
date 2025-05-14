import React, { useState } from 'react';
import { resetPassword, getCurrentUser } from '../firebase/auth';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { language } = useAuth();
  const t = getTranslator(language);

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    
    try {
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.email) {
        throw new Error(t('changePasswordModal_error_noEmailFound'));
      }
      
      const result = await resetPassword(currentUser.email);
      
      if (result.success) {
        setStatus({
          type: 'success',
          message: t('changePasswordModal_success_emailSent', { email: currentUser.email })
        });
      } else {
        setStatus({
          type: 'error',
          message: result.error?.message || t('changePasswordModal_error_sendResetEmailFailed') 
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || t('changePasswordModal_error_generic')
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-2xl border border-[#333] w-full max-w-md p-5 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-semibold text-white mb-4">{t('changePasswordModal_title')}</h2>
        
        {status?.type === 'success' ? (
          <div className="text-center py-4">
            <div className="mb-4 text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white mb-6">{status.message}</p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-[#0F7490] to-[#0A5A72] text-white py-2 px-6 rounded-xl hover:opacity-90 transition w-full"
            >
              {t('changePasswordModal_button_close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-gray-400 mb-4">
              {t('changePasswordModal_text_infoLine1')}
            </p>
            
            <div className="mb-4">
              <div className="p-3 bg-[#1d1d1d] border border-[#333] rounded-xl text-gray-400">
                <p>{t('changePasswordModal_text_infoBox')}</p>
              </div>
            </div>
            
            {status?.type === 'error' && (
              <p className="text-red-400 mb-4">{status.message}</p>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#333] hover:border-cyan-500 transition-colors text-white"
              >
                {t('changePasswordModal_button_cancel')}
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-[#0F7490] to-[#0A5A72] text-white py-2 px-4 rounded-xl hover:opacity-90 transition"
                disabled={loading}
              >
                {loading ? t('changePasswordModal_button_sending') : t('changePasswordModal_button_sendEmail')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;