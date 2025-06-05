import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAuth, applyActionCode } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

const RegistrationSuccess = () => {
  const { language } = useAuth();
  const t = getTranslator(language);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const oobCode = searchParams.get('oobCode');
      
      if (!oobCode) {
        setError('Código de verificación inválido o faltante.');
        setVerifying(false);
        return;
      }

      try {
        const auth = getAuth();
        await applyActionCode(auth, oobCode);
        setVerified(true);
        setVerifying(false);
      } catch (err) {
        console.error('Error verifying email:', err);
        setError('Error al verificar el correo electrónico. El enlace puede haber expirado o ya fue usado.');
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-no-repeat bg-cover bg-center overflow-hidden m-0 p-0 inset-0 fixed px-[20px] sm:px-[60px] lg:px-[100px] py-[120px]">
      <div className="w-[90vw] max-w-[380px] sm:w-[420px] sm:max-w-[420px] md:w-[430px] md:max-w-[430px] lg:max-w-[450px] px-[30px] py-12 rounded-3xl bg-black bg-opacity-60 border border-gray-800 shadow-xl flex flex-col mx-auto">
        
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="AGM Logo" className="h-16 sm:h-20" />
        </div>

        {verifying && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">
              {t('registrationSuccess_verifying', 'Verificando tu correo electrónico...')}
            </p>
          </div>
        )}

        {!verifying && verified && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('registrationSuccess_title', '¡Registro Exitoso!')}
              </h2>
              <p className="text-gray-300 text-sm">
                {t('registrationSuccess_message', 'Tu correo electrónico ha sido verificado correctamente. Ya puedes acceder a tu cuenta.')}
              </p>
            </div>

            <button
              onClick={handleGoToDashboard}
              className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10">
                {t('registrationSuccess_button_dashboard', 'Ingresar al Dashboard')}
              </span>
            </button>
          </div>
        )}

        {!verifying && error && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('registrationSuccess_error_title', 'Error de Verificación')}
              </h2>
              <p className="text-gray-300 text-sm mb-4">
                {error}
              </p>
            </div>

            <button
              onClick={handleGoToLogin}
              className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium shadow-lg relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10">
                {t('registrationSuccess_button_login', 'Ir al Login')}
              </span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default RegistrationSuccess; 