import { useState } from 'react';
import { loginUser } from '../firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

const Login = ({ onRegisterClick, onForgotClick, onLoginSuccess }) => {
  const { language } = useAuth();
  const t = getTranslator(language);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Check if username is email format or just username
      const isEmail = /\S+@\S+\.\S+/.test(username);
      const email = isEmail ? username : `${username}@example.com`; // Adjust as needed
      
      const { user, error } = await loginUser(email, password);
      
      if (error) {
        throw new Error(error.message || t('login_error_loginFailed'));
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

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-no-repeat bg-cover bg-center overflow-hidden m-0 p-0 inset-0 fixed">
      <div className="w-[420px] h-[900px] sm:w-full md:w-[620px] p-10 rounded-3xl bg-black bg-opacity-60 border border-gray-800 shadow-xl flex flex-col justify-center mx-auto">
        <div className="flex justify-center mb-12">
          <img src="/logo.png" alt="AGM Logo" className="h-17" />
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-600 text-white px-4 py-2 rounded-lg mb-8">
            {error}
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
              className="text-white hover:text-blue-500 bg-transparent whitespace-nowrap"
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