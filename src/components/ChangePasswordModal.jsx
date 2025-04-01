import React, { useState } from 'react';
import { resetPassword, getCurrentUser } from '../firebase/auth';
import { X } from 'lucide-react';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.email) {
        throw new Error('No se pudo obtener el correo electrónico actual');
      }
      
      const result = await resetPassword(currentUser.email);
      
      if (result.success) {
        setStatus({
          type: 'success',
          message: `Se ha enviado un email a ${currentUser.email} para restablecer tu contraseña. Por favor revisa tu bandeja de entrada.`
        });
      } else {
        setStatus({
          type: 'error',
          message: 'Ha ocurrido un error al enviar el correo de restablecimiento.'
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.'
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
        
        <h2 className="text-xl font-semibold text-white mb-4">Cambiar Contraseña</h2>
        
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
              Se enviará un enlace para restablecer tu contraseña al correo electrónico asociado a tu cuenta.
            </p>
            
            <div className="mb-4">
              <div className="p-3 bg-[#1d1d1d] border border-[#333] rounded-xl text-gray-400">
                <p>Se enviará un email a la dirección de correo registrada con un enlace para restablecer tu contraseña.</p>
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
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-[#0F7490] to-[#0A5A72] text-white py-2 px-4 rounded-xl hover:opacity-90 transition"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Email'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;