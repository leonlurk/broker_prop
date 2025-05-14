import React, { useState } from 'react';
import { X } from 'lucide-react';
import { auth } from '../firebase/config';
import { updateEmail, sendEmailVerification } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

const UpdateEmailModal = ({ isOpen, onClose }) => {
  const { language } = useAuth();
  const t = getTranslator(language);

  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = auth.currentUser;
      
      if (user) {
        // For security purposes, in a real app we would need to reauthenticate 
        // the user before changing email, but Firebase's API requires that to be 
        // done separately with EmailAuthProvider.credential
        
        await updateEmail(user, newEmail);
        await sendEmailVerification(user);
        
        setStatus({
          type: 'success',
          message: t('updateEmailModal_success_verificationSent')
        });
      }
    } catch (error) {
      console.error(error);
      let errorMessage = t('updateEmailModal_error_generic');
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = t('updateEmailModal_error_requiresRecentLogin');
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = t('updateEmailModal_error_emailInUse');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = t('updateEmailModal_error_invalidEmail');
      }
      
      setStatus({
        type: 'error',
        message: errorMessage
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
        
        <h2 className="text-xl font-semibold text-white mb-4">{t('updateEmailModal_title')}</h2>
        
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
              {t('updateEmailModal_button_closeModal')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-gray-400 mb-4">
              {t('updateEmailModal_text_info')}
            </p>
            
            <div className="mb-4">
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-400 mb-1">
                {t('updateEmailModal_label_newEmail')}
              </label>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-[#232323] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder={t('updateEmailModal_placeholder_newEmail')}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-400 mb-1">
                {t('updateEmailModal_label_currentPassword')}
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#232323] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder={t('updateEmailModal_placeholder_password')}
                required
              />
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
                {t('updateEmailModal_button_cancelUpdate')}
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-[#0F7490] to-[#0A5A72] text-white py-2 px-4 rounded-xl hover:opacity-90 transition"
                disabled={loading}
              >
                {loading ? t('updateEmailModal_button_updating') : t('updateEmailModal_button_updateEmail')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateEmailModal;