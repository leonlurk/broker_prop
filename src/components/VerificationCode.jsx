import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';
import { CheckCircle, RefreshCw } from 'lucide-react';

const VerificationCode = ({ onContinue, onResendCode, verificationPurpose = 'generic' }) => {
  const { language } = useAuth();
  const t = getTranslator(language);

  const [code, setCode] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on component mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Clear previous errors
    setError('');
    
    // Only allow digits
    if (value && !/^\d*$/.test(value)) {
      return;
    }
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Move focus to next input if value is entered
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
    
    // If last input and all inputs have values, submit automatically
    if (index === 3 && value && newCode.every(digit => digit)) {
      // Small delay to allow state update
      setTimeout(() => {
        verifyCode(newCode.join(''));
      }, 300);
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    
    // Allow navigation with arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const verifyCode = async (verificationCode) => {
    setIsVerifying(true);
    setError('');
    
    try {
      // Here you would implement your actual verification logic
      console.log('Verifying code:', verificationCode);
      
      // Simulate verification process (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Example validation - replace with actual validation
      if (verificationCode === '1234') { // Demo successful code
        setSuccess(true);
        setTimeout(() => {
          if (onContinue && typeof onContinue === 'function') {
            onContinue(verificationCode);
          }
        }, 1000);
      } else {
        setError(t('verificationCode_error_invalid', 'Código de verificación inválido'));
      }
    } catch (err) {
      setError(t('verificationCode_error_verification', 'Error al verificar el código'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 4) {
      setError(t('verificationCode_error_incomplete', 'Por favor ingresa los 4 dígitos del código'));
      return;
    }
    
    verifyCode(verificationCode);
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');
    
    try {
      console.log('Resending verification code');
      
      if (onResendCode && typeof onResendCode === 'function') {
        await onResendCode();
      } else {
        // Simulate resend process if no callback provided
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Reset the code inputs
      setCode(['', '', '', '']);
      
      // Focus the first input
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      setError(t('verificationCode_error_resend', 'Error al reenviar el código'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 rounded-xl bg-[#2b2b2b] border border-[#333] shadow-lg">
      <div className="flex justify-center mb-8">
        <img src="/logo.png" alt="AGM Logo" className="h-12 sm:h-16" />
      </div>
      
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-white">
          {success 
            ? t('verificationCode_title_success', '¡Verificación exitosa!') 
            : t('verificationCode_title')}
        </h2>
        
        {success ? (
          <div className="flex justify-center my-4">
            <CheckCircle className="text-green-500" size={48} />
          </div>
        ) : (
          <p className="text-gray-300 mt-3 text-sm">
            {verificationPurpose === 'email' 
              ? t('verificationCode_text_checkEmail', 'Hemos enviado un código de verificación a tu correo electrónico')
              : verificationPurpose === 'phone'
              ? t('verificationCode_text_checkPhone', 'Hemos enviado un código de verificación a tu teléfono')
              : t('verificationCode_text_enterCode', 'Ingresa el código de verificación para continuar')}
          </p>
        )}
      </div>
      
      {!success && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-3">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 text-center text-white text-xl font-semibold rounded-lg bg-[#232323] border border-gray-700 focus:outline-none focus:border-cyan-500"
                disabled={isVerifying || isResending}
                required
              />
            ))}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isVerifying || isResending || code.join('').length !== 4}
            >
              {isVerifying 
                ? t('verificationCode_button_verifying', 'Verificando...') 
                : t('verificationCode_button_continueSubmit')}
            </button>
            
            <div className="text-center text-sm">
              <span className="text-gray-400">
                {t('verificationCode_text_didNotReceiveCode')}
              </span>
              <button 
                type="button" 
                onClick={handleResendCode}
                disabled={isVerifying || isResending}
                className="ml-1 text-cyan-500 hover:text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <span className="flex items-center justify-center">
                    <RefreshCw className="animate-spin mr-1" size={14} />
                    {t('verificationCode_button_resending', 'Reenviando...')}
                  </span>
                ) : (
                  t('verificationCode_button_resend')
                )}
              </button>
            </div>
          </div>
        </form>
      )}
      
      {success && (
        <button
          onClick={() => onContinue && onContinue()}
          className="w-full py-3 px-4 mt-4 rounded-full bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
        >
          {t('verificationCode_button_continue', 'Continuar')}
        </button>
      )}
    </div>
  );
};

export default VerificationCode;