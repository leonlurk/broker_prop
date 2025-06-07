import { useState, useEffect } from 'react';
import { loginUser, resendEmailVerification } from '../firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';
import { useLocation } from 'react-router-dom';

const Login = ({ onRegisterClick, onForgotClick, onLoginSuccess }) => {
  const { language } = useAuth();
  const t = getTranslator(language);
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showEmailNotVerified, setShowEmailNotVerified] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [lastEmail, setLastEmail] = useState('');

  // Debug: Log state changes
  useEffect(() => {
    console.log("[Login] State updated - error:", error, "showEmailNotVerified:", showEmailNotVerified);
  }, [error, showEmailNotVerified]);

  // Check for registration success parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('registered') === 'true') {
      setShowSuccessMessage(true);
      // Hide the message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
    if (params.get('verified') === 'true') {
      setShowSuccessMessage(true);
      // Hide the message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
  }, [location]);

  // Clear error states when user starts typing in either field after showing error
  useEffect(() => {
    if (error && username.length > 0 && password.length > 0) {
      // Only clear errors if user has typed in both fields after an error
      const timeoutId = setTimeout(() => {
        setError('');
        setShowEmailNotVerified(false);
      }, 2000); // Wait 2 seconds before clearing
      
      return () => clearTimeout(timeoutId);
    }
  }, [username, password, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Check if username is email format or just username
      const isEmail = /\S+@\S+\.\S+/.test(username);
      const email = isEmail ? username : `${username}@example.com`; // Adjust as needed
      
      console.log("[Login] Calling loginUser with email:", email);
      const { user, error } = await loginUser(email, password);
      
      console.log("[Login] loginUser response:", { user, error });
      
      if (error) {
        console.log("[Login] Error received:", error);
        // Handle specific error for unverified email
        if (error.code === 'auth/email-not-verified') {
          console.log("[Login] Email not verified error detected");
          setError(t('login_error_emailNotVerified'));
          setShowEmailNotVerified(true);
          setLastEmail(email);
        } else {
          console.log("[Login] Other error:", error.message);
          setError(error.message || t('login_error_loginFailed'));
        }
        return;
      }
      
      console.log('Login successful:', user);
      onLoginSuccess();
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || t('login_error_loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendingEmail(true);
    try {
      await resendEmailVerification(lastEmail);
      setError(t('login_error_emailResent'));
    } catch (err) {
      console.error('Error resending email:', err);
      setError(err.message || t('login_error_emailResendFailed'));
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-no-repeat bg-cover bg-center overflow-hidden m-0 p-0 inset-0 fixed px-[100px] py-[80px]">
      {/* Success Snackbar */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 transition-all duration-300 ease-in-out transform translate-x-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span className="font-medium">
            {new URLSearchParams(location.search).get('verified') === 'true' 
              ? '¡Email Verificado Exitosamente!' 
              : '¡Registro Exitoso!'}
          </span>
          <button 
            onClick={() => setShowSuccessMessage(false)}
            className="ml-2 text-white hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      )}
      
      <div className="w-[360px] sm:w-[400px] md:w-[430px] max-w-[450px] h-[700px] px-[30px] py-8 rounded-3xl bg-black bg-opacity-60 border border-gray-800 shadow-xl flex flex-col justify-center mx-auto">
        <div className="flex justify-center mb-12">
          <img src="/logo.png" alt="AGM Logo" className="h-12" />
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-600 text-white px-4 py-2 rounded-lg mb-8">
            <div className="mb-2">{error}</div>
            {showEmailNotVerified && (
              <button
                onClick={handleResendEmail}
                disabled={resendingEmail}
                className="mt-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-3 py-1 rounded transition-colors"
              >
                {resendingEmail ? 'Enviando...' : t('login_button_resendEmail')}
              </button>
            )}
          </div>
        )}

        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-4 rounded-full bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 bg-opacity-20"
                placeholder={t('login_placeholder_usernameOrEmail')}
                required
              />
              <svg className="absolute top-4 left-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 rounded-full bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 bg-opacity-20"
                placeholder={t('login_placeholder_password')}
                required
              />
              <svg className="absolute top-4 left-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm mt-6">
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember_me" className="ml-2 block text-gray-300">
                {t('login_label_rememberMe')}
              </label>
            </div>
            <button
              type="button"
              onClick={onForgotClick}
              className="text-white hover:text-blue-500 bg-transparent whitespace-nowrap text-xs sm:text-sm"
            >
              {t('login_button_forgotPassword')}
            </button>
          </div>

          <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg relative overflow-hidden group mt-8 mb-8"
              >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10">{loading ? t('login_button_loggingIn') : t('login_button_login')}</span>
          </button>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-gray-300 hover:text-white bg-transparent"
            >
              {t('login_button_verifyNow')}
            </button>
            <p className="text-gray-400 mt-2">
              {t('login_text_noAccount')} <button type="button" onClick={onRegisterClick} className="text-white font-semibold bg-transparent">{t('login_button_register')}</button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;