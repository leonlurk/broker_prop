import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Mail, RotateCcw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';
import { verifyEmailWithCode } from '../firebase/auth';
import emailVerificationService from '../services/emailVerificationService';

const EmailVerificationPage = () => {
  const { language } = useAuth();
  const t = getTranslator(language);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get user data from URL params or sessionStorage
  const emailFromUrl = searchParams.get('email');
  const usernameFromUrl = searchParams.get('username');
  const emailFromStorage = sessionStorage.getItem('verification_email');
  const usernameFromStorage = sessionStorage.getItem('verification_username');
  
  const email = emailFromUrl || emailFromStorage;
  const username = usernameFromUrl || usernameFromStorage;
  
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  // Referencias para los inputs
  const inputRefs = useRef([]);
  
  useEffect(() => {
    // Verificar si tenemos los datos necesarios
    if (!email) {
      console.error('No email found for verification');
      navigate('/register');
      return;
    }
    
    // Enfocar el primer input al cargar
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    
    // Limpiar sessionStorage después de obtener los datos
    if (emailFromStorage) {
      sessionStorage.removeItem('verification_email');
      sessionStorage.removeItem('verification_username');
    }
  }, [email, navigate, emailFromStorage]);

  const handleInputChange = (index, value) => {
    // Solo permitir números
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(''); // Limpiar error al escribir
    
    // Avanzar al siguiente input si se ingresó un dígito
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Retroceder al input anterior si se presiona backspace y el campo está vacío
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Enviar formulario si se presiona Enter y todos los campos están llenos
    if (e.key === 'Enter' && code.every(digit => digit !== '')) {
      handleSubmit(e);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Verificar que solo contenga números y tenga máximo 4 dígitos
    if (/^\d{1,4}$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newCode = [...code];
      
      for (let i = 0; i < digits.length && i < 4; i++) {
        newCode[i] = digits[i];
      }
      
      setCode(newCode);
      setError('');
      
      // Enfocar el siguiente input disponible
      const nextEmptyIndex = newCode.findIndex(digit => digit === '');
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[3]?.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 4) {
      setError('Por favor ingresa los 4 dígitos del código');
      return;
    }
    
    setIsVerifying(true);
    setError('');
    
    try {
      console.log('🔑 Attempting to verify code:', verificationCode, 'for email:', email);
      
      // Use the integrated auth function that handles both validation and Firebase update
      const result = await verifyEmailWithCode(email, verificationCode);
      
      if (result.success) {
        console.log('✅ Email verification successful');
        setSuccess(true);
        setTimeout(() => {
          navigate('/login?verified=true');
        }, 2000);
      } else {
        console.log('❌ Email verification failed:', result.error);
        setError(result.error?.message || 'Código de verificación inválido');
      }
    } catch (err) {
      console.error('❌ Error during verification:', err);
      setError('Error al verificar el código. Inténtalo de nuevo.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');
    
    try {
      const result = await emailVerificationService.resendCode(email);
      
      if (result.success) {
        // Limpiar campos y enfocar el primero
        setCode(['', '', '', '']);
        inputRefs.current[0]?.focus();
        
        // Mostrar mensaje de éxito brevemente
        console.log('✅ Code resent successfully');
      } else {
        setError(result.error || 'Error al reenviar el código');
      }
    } catch (err) {
      setError('Error al reenviar el código de verificación');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToRegister = () => {
    navigate('/register');
  };

  // Si no hay email, no renderizar nada (se redirigirá en useEffect)
  if (!email) {
    return null;
  }

  return (
    <div 
      className="flex items-center justify-center min-h-screen w-full bg-no-repeat bg-cover bg-center overflow-hidden m-0 p-0 inset-0 fixed px-[20px] sm:px-[60px] lg:px-[100px] py-[120px]"
      style={{ backgroundImage: 'url(/fondo.png)', width: '100vw', height: '100vh' }}
    >
      <div className="w-[90vw] max-w-[380px] sm:w-[420px] sm:max-w-[420px] md:w-[430px] md:max-w-[430px] lg:max-w-[450px] max-h-[80vh] px-[30px] py-12 rounded-3xl bg-black bg-opacity-60 border border-gray-800 shadow-xl flex flex-col mx-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="AGM Logo" className="h-16 sm:h-20" />
        </div>

        {/* Título y descripción */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {success 
              ? '¡Verificación Exitosa!' 
              : 'Verificar Email'
            }
          </h2>
          
          {success ? (
            <div className="flex justify-center my-4">
              <CheckCircle className="text-green-500" size={48} />
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <Mail className="text-cyan-500" size={48} />
              </div>
              <p className="text-gray-300 text-sm mb-2">
                Hemos enviado un código de verificación de 4 dígitos a:
              </p>
              <p className="text-cyan-400 font-medium text-sm">
                {email}
              </p>
            </>
          )}
        </div>

        {/* Inputs de código */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center space-x-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-14 h-14 text-center text-xl font-bold bg-[#2b2b2b] border-2 border-gray-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors"
                  disabled={isVerifying}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500 bg-opacity-20 border border-red-600 rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Botón de verificar */}
            <button
              type="submit"
              disabled={isVerifying || code.some(digit => digit === '')}
              className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10">
                {isVerifying ? 'Verificando...' : 'Verificar Código'}
              </span>
            </button>

            {/* Botón de reenviar */}
            <div className="text-center text-sm">
              <span className="text-gray-400">¿No recibiste el código? </span>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <RotateCcw className="animate-spin" size={14} />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} />
                    Reenviar código
                  </>
                )}
              </button>
            </div>

            {/* Botón de volver */}
            <button
              type="button"
              onClick={handleBackToRegister}
              className="w-full py-3 px-4 rounded-full border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
            >
              Volver al registro
            </button>
          </form>
        )}

        {/* Mensaje de éxito */}
        {success && (
          <div className="text-center">
            <p className="text-gray-300 text-sm mb-6">
              Tu email ha sido verificado correctamente. Serás redirigido al login en unos segundos...
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default EmailVerificationPage; 