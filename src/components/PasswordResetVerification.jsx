import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Lock, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';
import passwordResetService from '../services/passwordResetService';
import { updateUserPassword } from '../firebase/auth';

const PasswordResetVerification = ({ email, onBackToLogin }) => {
  const { language } = useAuth();
  const t = getTranslator(language);
  const navigate = useNavigate();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState('code'); // 'code' or 'password'
  const [userId, setUserId] = useState(null);
  
  // Referencias para los inputs del código
  const inputRefs = useRef([]);
  
  useEffect(() => {
    // Verificar si tenemos email
    if (!email) {
      console.error('No email provided for password reset verification');
      if (onBackToLogin) {
        onBackToLogin();
      } else {
        navigate('/login');
      }
      return;
    }
    
    // Enfocar el primer input al cargar
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email, navigate, onBackToLogin]);

  const handleInputChange = (index, value) => {
    // Solo permitir números
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(''); // Limpiar error al escribir
    
    // Avanzar al siguiente input si se ingresó un dígito
    if (value && index < 5) {
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
      handleSubmitCode(e);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Verificar que solo contenga números y tenga máximo 6 dígitos
    if (/^\d{1,6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newCode = [...code];
      
      for (let i = 0; i < digits.length && i < 6; i++) {
        newCode[i] = digits[i];
      }
      
      setCode(newCode);
      setError('');
      
      // Enfocar el siguiente input disponible
      const nextEmptyIndex = newCode.findIndex(digit => digit === '');
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };

  const handleSubmitCode = async (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Por favor ingresa los 6 dígitos del código');
      return;
    }
    
    setIsVerifying(true);
    setError('');
    
    try {
      console.log('🔑 Attempting to verify reset code:', verificationCode, 'for email:', email);
      
      const result = await passwordResetService.validateResetCode(email, verificationCode);
      
      if (result.isValid) {
        console.log('✅ Password reset code verification successful');
        setUserId(result.userId);
        setStep('password');
      } else {
        console.log('❌ Password reset code verification failed:', result.error);
        setError(result.error || 'Código de verificación inválido');
      }
    } catch (err) {
      console.error('❌ Error during code verification:', err);
      setError('Error al verificar el código. Inténtalo de nuevo.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setIsVerifying(true);
    setError('');
    
    try {
      console.log('🔑 Attempting to update password for user:', userId);
      
      // Actualizar contraseña en Firebase
      const result = await updateUserPassword(userId, newPassword);
      
      if (result.success) {
        console.log('✅ Password updated successfully');
        setSuccess(true);
        setTimeout(() => {
          if (onBackToLogin) {
            onBackToLogin();
          } else {
            navigate('/login?passwordReset=true');
          }
        }, 3000);
      } else {
        console.log('❌ Password update failed:', result.error);
        setError(result.error?.message || 'Error al actualizar la contraseña');
      }
    } catch (err) {
      console.error('❌ Error during password update:', err);
      setError('Error al actualizar la contraseña. Inténtalo de nuevo.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');
    
    try {
      const result = await passwordResetService.generateAndSendResetCode(email);
      
      if (result.success) {
        // Limpiar campos y enfocar el primero
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        console.log('✅ Reset code resent successfully');
      } else {
        setError(result.error || 'Error al reenviar el código');
      }
    } catch (err) {
      setError('Error al reenviar el código de verificación');
    } finally {
      setIsResending(false);
    }
  };

  // Si no hay email, no renderizar nada
  if (!email) {
    return null;
  }

  if (success) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen w-full bg-no-repeat bg-cover bg-center overflow-hidden m-0 p-0 inset-0 fixed px-[20px] sm:px-[60px] lg:px-[100px] py-[120px]"
        style={{ backgroundImage: 'url(/fondo.png)', width: '100vw', height: '100vh' }}
      >
        <div className="w-[90vw] max-w-[380px] sm:w-[420px] sm:max-w-[420px] md:w-[430px] md:max-w-[430px] lg:max-w-[450px] max-h-[80vh] px-[30px] py-12 rounded-3xl bg-black bg-opacity-60 border border-gray-800 shadow-xl flex flex-col mx-auto">
          
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src="/logo.png" alt="AGM Logo" className="h-16 sm:h-20" />
          </div>
          
          <div className="text-center">
            <div className="flex justify-center my-6">
              <CheckCircle className="text-green-500" size={64} />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              ¡Contraseña Actualizada!
            </h2>
            
            <p className="text-gray-300 mb-8">
              Tu contraseña ha sido restablecida exitosamente. 
              Serás redirigido al login en unos segundos.
            </p>
            
            <button
              onClick={() => {
                if (onBackToLogin) {
                  onBackToLogin();
                } else {
                  navigate('/login?passwordReset=true');
                }
              }}
              className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium shadow-lg relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10">
                ✅ Ir al Login
              </span>
            </button>
          </div>
        </div>
      </div>
    );
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
            {step === 'code' ? '🔐 Verificar Código' : '🔑 Nueva Contraseña'}
          </h2>
          
          <p className="text-gray-300 text-sm">
            {step === 'code' 
              ? `Ingresa el código de 6 dígitos enviado a ${email}`
              : 'Establece tu nueva contraseña segura'
            }
          </p>
        </div>
        
        {/* Mensajes de error */}
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-600 text-white px-4 py-3 rounded-lg mb-6 text-sm">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {step === 'code' ? (
          // Paso 1: Verificar código
          <form onSubmit={handleSubmitCode} className="space-y-6">
            {/* Inputs del código */}
            <div className="flex justify-center space-x-2 mb-8">
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
                  className="w-12 h-12 text-center text-lg font-bold bg-gray-900 bg-opacity-20 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isVerifying}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isVerifying || code.some(digit => digit === '')}
              className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center justify-center">
                {isVerifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verificando código...
                  </>
                ) : (
                  '🔐 Verificar código'
                )}
              </span>
            </button>

            {/* Opciones adicionales */}
            <div className="space-y-4 mt-8">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="w-full py-3 px-4 rounded-full bg-gray-700 bg-opacity-50 text-white font-medium border border-gray-600 hover:bg-gray-600 hover:bg-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isResending ? (
                  <>
                    <RotateCcw className="animate-spin mr-2" size={16} />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <RotateCcw className="mr-2" size={16} />
                    Reenviar código
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          // Paso 2: Establecer nueva contraseña
          <form onSubmit={handleSubmitPassword} className="space-y-6">
            <div className="space-y-4">
              {/* Nueva contraseña */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-4 rounded-full bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12 pr-12 bg-opacity-20 placeholder-gray-400"
                  placeholder="Nueva contraseña"
                  required
                  minLength="6"
                  disabled={isVerifying}
                />
                <Lock className="absolute top-4 left-4 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-4 right-4 h-5 w-5 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Confirmar contraseña */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-4 rounded-full bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12 pr-12 bg-opacity-20 placeholder-gray-400"
                  placeholder="Confirmar contraseña"
                  required
                  minLength="6"
                  disabled={isVerifying}
                />
                <Lock className="absolute top-4 left-4 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-4 right-4 h-5 w-5 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Indicador de fortaleza de contraseña */}
            {newPassword && (
              <div className="bg-gray-800 bg-opacity-40 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-300 mb-2">Fortaleza de la contraseña:</p>
                <div className="flex space-x-1">
                  <div className={`h-2 flex-1 rounded ${newPassword.length >= 6 ? 'bg-yellow-500' : 'bg-gray-600'}`}></div>
                  <div className={`h-2 flex-1 rounded ${newPassword.length >= 8 && /[A-Z]/.test(newPassword) ? 'bg-orange-500' : 'bg-gray-600'}`}></div>
                  <div className={`h-2 flex-1 rounded ${newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {newPassword.length < 6 ? 'Muy débil' : 
                   newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'Fuerte' : 
                   newPassword.length >= 8 && /[A-Z]/.test(newPassword) ? 'Media' : 'Débil'}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !newPassword || !confirmPassword}
              className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium shadow-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center justify-center">
                {isVerifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Actualizando contraseña...
                  </>
                ) : (
                  '🔑 Establecer nueva contraseña'
                )}
              </span>
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            ¿Recordaste tu contraseña?{' '}
            <button 
              type="button" 
              onClick={onBackToLogin} 
              className="text-white font-semibold hover:text-blue-400 transition-colors duration-300"
            >
              Volver al login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetVerification; 