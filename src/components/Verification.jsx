import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAuth, confirmPasswordReset } from 'firebase/auth';

export default function Verification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (!oobCode) {
      setError('Código de verificación inválido.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
    } catch (err) {
      setError('Error al restablecer la contraseña. El enlace puede haber expirado o ya fue usado.');
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
            ✅ ¡Contraseña Restablecida!
          </h2>
          
          <p className="text-gray-300 mb-6 text-sm">
            Tu contraseña fue cambiada con éxito. Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10">Ir al Login</span>
          </button>
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
          🔐 Restablecer Contraseña
        </h2>
        
        <p className="text-gray-300 text-sm">
          Ingresa tu nueva contraseña para completar el restablecimiento
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
      
      <form onSubmit={handleReset} className="space-y-6">
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-4 rounded-full bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12 bg-opacity-20 placeholder-gray-400"
            placeholder="Nueva contraseña"
            minLength={6}
            required
            disabled={loading}
          />
          <svg className="absolute top-4 left-4 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <div className="relative">
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-4 rounded-full bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12 bg-opacity-20 placeholder-gray-400"
            placeholder="Confirmar nueva contraseña"
            minLength={6}
            required
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
                Restableciendo...
              </>
            ) : (
              '🔐 Restablecer contraseña'
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
  );
} 