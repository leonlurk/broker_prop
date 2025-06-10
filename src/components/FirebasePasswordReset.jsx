import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getTranslator } from '../utils/i18n';
import { useAuth } from '../contexts/AuthContext';

const FirebasePasswordReset = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useAuth();
  const t = getTranslator(language);
  
  const [step, setStep] = useState('loading'); // loading, form, success, error
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const actionCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  useEffect(() => {
    const initializeReset = async () => {
      if (!actionCode || mode !== 'resetPassword') {
        setStep('error');
        setError('Enlace de restablecimiento inválido o expirado.');
        return;
      }

      try {
        // Verificar el código y obtener el email
        const emailFromCode = await verifyPasswordResetCode(auth, actionCode);
        setEmail(emailFromCode);
        setStep('form');
      } catch (error) {
        console.error('Error verificando código:', error);
        setStep('error');
        setError('El enlace de restablecimiento es inválido o ha expirado.');
      }
    };

    initializeReset();
  }, [actionCode, mode]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await confirmPasswordReset(auth, actionCode, newPassword);
      setStep('success');
    } catch (error) {
      console.error('Error restableciendo contraseña:', error);
      setError('Error al restablecer la contraseña. El enlace puede haber expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/login');
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
        style={{ backgroundImage: 'url(/fondo.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="flex items-center justify-center">
          <div className="w-[360px] sm:w-[400px] md:w-[430px] max-w-[450px] h-[700px] px-[30px] py-8 rounded-3xl bg-black bg-opacity-60 border border-gray-800 shadow-xl flex flex-col justify-center mx-auto">
            <div className="flex justify-center mb-8">
              <img src="/logo.png" alt="AGM Logo" className="h-12" />
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-white">
                Verificando enlace...
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
        style={{ backgroundImage: 'url(/fondo.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="flex items-center justify-center">
          <div className="w-[360px] sm:w-[400px] md:w-[430px] max-w-[450px] h-[700px] px-[30px] py-8 rounded-3xl bg-black bg-opacity-60 border border-gray-800 shadow-xl flex flex-col justify-center mx-auto">
            <div className="flex justify-center mb-8">
              <img src="/logo.png" alt="AGM Logo" className="h-12" />
            </div>
            
            <div className="text-center">
              <div className="flex justify-center my-6">
                <div className="rounded-full bg-red-500 bg-opacity-20 border border-red-500 p-4">
                  <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Error
              </h2>
              
              <p className="text-gray-300 mb-6 text-sm">
                {error}
              </p>
              
              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">Solicitar nuevo enlace</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
        style={{ backgroundImage: 'url(/fondo.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="flex items-center justify-center">
          <div className="w-[360px] sm:w-[400px] md:w-[430px] max-w-[450px] h-[700px] px-[30px] py-8 rounded-3xl bg-black bg-opacity-60 border border-gray-800 shadow-xl flex flex-col justify-center mx-auto">
            <div className="flex justify-center mb-8">
              <img src="/logo.png" alt="AGM Logo" className="h-12" />
            </div>
            
            <div className="text-center">
              <div className="flex justify-center my-6">
                <div className="rounded-full bg-green-500 bg-opacity-20 border border-green-500 p-4">
                  <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                ¡Contraseña Restablecida!
              </h2>
              
              <p className="text-gray-300 mb-6 text-sm">
                Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              
              <button
                onClick={handleContinue}
                className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">Ir al inicio de sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      style={{ backgroundImage: 'url(/fondo.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="flex items-center justify-center">
        <div className="w-[360px] sm:w-[400px] md:w-[430px] max-w-[450px] h-[700px] px-[30px] py-8 rounded-3xl bg-black bg-opacity-60 border border-gray-800 shadow-xl flex flex-col justify-center mx-auto">
          <div className="flex justify-center mb-8">
            <img src="/logo.png" alt="AGM Logo" className="h-12" />
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Restablecer Contraseña
            </h2>
            
            <p className="text-gray-300 text-sm mb-2">
              Para: <span className="text-white font-medium">{email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-600 text-white px-4 py-3 rounded-lg mb-6 text-sm">
              <div className="flex items-center">
                <span className="mr-2"></span>
                {error}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handlePasswordReset}>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-4 rounded-full bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12 bg-opacity-20 placeholder-gray-400"
                placeholder="Nueva contraseña"
                disabled={loading}
              />
              <svg className="absolute top-4 left-4 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-4 rounded-full bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12 bg-opacity-20 placeholder-gray-400"
                placeholder="Confirmar nueva contraseña"
                disabled={loading}
              />
              <svg className="absolute top-4 left-4 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Actualizando...
                  </>
                ) : (
                  'Actualizar contraseña'
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              ¿Problemas con el enlace?{' '}
              <button
                type="button"
                onClick={() => navigate('/forgot-password')} 
                className="text-white font-semibold hover:text-blue-400 transition-colors duration-300"
              >
                Solicitar nuevo enlace
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebasePasswordReset; 