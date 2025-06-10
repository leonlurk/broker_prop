import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getTranslator } from '../utils/i18n';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = ({ onLoginClick }) => {
  const { language } = useAuth();
  const t = getTranslator(language);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Configurar la URL personalizada para el action handler
      const actionCodeSettings = {
        url: `${window.location.origin}/firebase-reset`,
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setSuccess(true);
    } catch (error) {
      console.error('Error enviando email de restablecimiento:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError('No existe una cuenta con este email.');
      } else if (error.code === 'auth/invalid-email') {
        setError('El email ingresado no es válido.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Intenta nuevamente más tarde.');
      } else {
        setError('Error al enviar el email. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
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
            ¡Email Enviado!
          </h2>
          
          <p className="text-gray-300 mb-6 text-sm">
            Hemos enviado un enlace de restablecimiento a <strong className="text-white">{email}</strong>
          </p>
          
          <div className="bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-blue-400 mr-2 text-lg"></span>
              <div className="text-sm">
                <p className="text-blue-200 font-medium mb-1">Pasos a seguir:</p>
                <p className="text-blue-100 text-xs">1. Revisa tu email (incluyendo spam)</p>
                <p className="text-blue-100 text-xs">2. Haz clic en el enlace recibido</p>
                <p className="text-blue-100 text-xs">3. Establece tu nueva contraseña</p>
                <p className="text-blue-100 text-xs">4. ¡Listo! Ya podrás iniciar sesión</p>
              </div>
            </div>
          </div>

          <button
            onClick={onLoginClick}
            className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg relative overflow-hidden group mb-4"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10">Volver al Login</span>
          </button>
          
          <button
            onClick={() => setSuccess(false)}
            className="w-full py-3 px-4 rounded-full border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 transition-colors duration-300"
          >
            Enviar otro enlace
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-xs">
              El enlace expirará en 1 hora
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[360px] sm:w-[400px] md:w-[430px] max-w-[450px] h-[700px] px-[30px] py-8 rounded-3xl bg-black bg-opacity-60 border border-gray-800 shadow-xl flex flex-col justify-center mx-auto">
      <div className="flex justify-center mb-8">
        <img src="/logo.png" alt="AGM Logo" className="h-12" />
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Restablecer Contraseña
        </h2>
        
        <p className="text-gray-300 text-sm">
          Ingresa tu email para recibir un enlace de restablecimiento
        </p>
      </div>
      
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-600 text-white px-4 py-3 rounded-lg mb-6 text-sm">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-4 rounded-full bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12 bg-opacity-20 placeholder-gray-400"
            placeholder="tu@email.com"
            required
            disabled={loading}
          />
          <svg className="absolute top-4 left-4 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <button
          type="submit"
          disabled={loading || !email}
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
                Enviando enlace...
              </>
            ) : (
              'Enviar enlace de restablecimiento'
            )}
          </span>
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm">
          ¿Recordaste tu contraseña?{' '}
          <button
            type="button"
            onClick={onLoginClick} 
            className="text-white font-semibold hover:text-blue-400 transition-colors duration-300"
          >
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;