import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config';
import { X, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { language, currentUser } = useAuth();
  const t = getTranslator(language);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePasswordReset = async () => {
    if (!currentUser?.email) {
      setError(t('changePasswordModal_error_noEmail'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Configurar la URL personalizada para el action handler
      const actionCodeSettings = {
        url: `${window.location.origin}/firebase-reset`,
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, currentUser.email, actionCodeSettings);
      setSuccess(true);
    } catch (error) {
      console.error('Error enviando email de restablecimiento:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError(t('changePasswordModal_error_userNotFound'));
      } else if (error.code === 'auth/invalid-email') {
        setError(t('changePasswordModal_error_invalidEmail'));
      } else if (error.code === 'auth/too-many-requests') {
        setError(t('changePasswordModal_error_tooManyRequests'));
      } else {
        setError(t('changePasswordModal_error_sendingEmail'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError('');
    setLoading(false);
    onClose();
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-2xl border border-[#333] w-full max-w-md p-6 relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label={t('modal_close_aria_label')}
          >
            <X size={20} />
          </button>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-500 bg-opacity-20 border border-green-500 p-3">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-3">
              {t('changePasswordModal_success_title')}
            </h2>
            
            <p className="text-gray-300 mb-4 text-sm">
              {t('changePasswordModal_success_message', { email: currentUser?.email })}
            </p>
            
            <div className="bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <span className="text-blue-400 mr-2">💡</span>
                <div className="text-sm text-left">
                  <p className="text-blue-200 font-medium mb-1">{t('changePasswordModal_success_stepsTitle')}</p>
                  <p className="text-blue-100 text-xs mb-1">1. {t('changePasswordModal_success_step1')}</p>
                  <p className="text-blue-100 text-xs mb-1">2. {t('changePasswordModal_success_step2')}</p>
                  <p className="text-blue-100 text-xs mb-1">3. {t('changePasswordModal_success_step3')}</p>
                  <p className="text-blue-100 text-xs">4. {t('changePasswordModal_success_step4')}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-[#0F7490] to-[#0A5A72] text-white py-3 px-6 rounded-xl hover:opacity-90 transition"
            >
              {t('changePasswordModal_button_close')}
            </button>
            
            <div className="mt-3 text-center">
              <p className="text-gray-400 text-xs">
                {t('changePasswordModal_success_expiration')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-2xl border border-[#333] w-full max-w-md p-6 relative">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label={t('modal_close_aria_label')}
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-semibold text-white mb-4">{t('changePasswordModal_title')}</h2>
        
        <div className="text-gray-300 mb-6">
          <p className="mb-2">
            {t('changePasswordModal_description')}
          </p>
          <p className="text-sm text-blue-200">
            {t('changePasswordModal_currentEmail')}: <strong className="text-white">{currentUser?.email}</strong>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-600 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handlePasswordReset}
            disabled={loading || !currentUser?.email}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                {t('changePasswordModal_button_sending')}
              </>
            ) : (
              t('changePasswordModal_button_sendReset')
            )}
          </button>
          
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-[#3a3a3a] to-[#2a2a2a] text-white py-3 px-4 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {t('changePasswordModal_button_cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;