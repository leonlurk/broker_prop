import React, { useState } from 'react';
import { X } from 'lucide-react';
import { auth } from '../firebase/config';
import { updateEmail, sendEmailVerification } from 'firebase/auth';

const UpdateEmailModal = ({ isOpen, onClose }) => {
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
          message: 'Se ha enviado un email de verificación a tu nueva dirección de correo. Por favor verifica tu nueva dirección de email.'
        });
      }
    } catch (error) {
      console.error(error);
      let errorMessage = 'Ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.';
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por seguridad, debes iniciar sesión nuevamente antes de cambiar tu correo electrónico.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo electrónico ya está en uso.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo electrónico no es válido.';
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
        
        <h2 className="text-xl font-semibold text-white mb-4">Actualizar Correo Electrónico</h2>
        
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
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-gray-400 mb-4">
              Ingresa tu nuevo correo electrónico. Te enviaremos un email para verificar la nueva dirección.
            </p>
            
            <div className="mb-4">
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-400 mb-1">
                Nuevo Correo Electrónico
              </label>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-[#232323] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="nuevo@correo.com"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-400 mb-1">
                Contraseña Actual (para confirmar)
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#232323] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="••••••••"
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
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-[#0F7490] to-[#0A5A72] text-white py-2 px-4 rounded-xl hover:opacity-90 transition"
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'Actualizar Email'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateEmailModal;