import { useState, useMemo, useEffect } from 'react';
import { registerUser } from '../firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

const Register = ({ onLoginClick }) => {
  const { language } = useAuth();
  const t = getTranslator(language);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState(null); // Will store { value: 'XX', label: 'Country Name' }
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refId, setRefId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      setRefId(ref);
      console.log("Referral ID captured:", ref);
    }
  }, [location.search]);

  const countryOptions = useMemo(() => countryList().getData(), []);

  const handleCountryChange = (selectedOption) => {
    setCountry(selectedOption);
  };

  const handlePhoneChange = (value, countryData) => {
    setPhoneNumber(value);
    // Update the country selector if the flag dropdown in PhoneInput changes the country
    const newCountry = countryOptions.find(option => option.value === countryData.countryCode.toUpperCase());
    if (newCountry && newCountry.value !== country?.value) {
        setCountry(newCountry);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError(t('register_error_passwordsDoNotMatch'));
    }
    if (!firstName || !lastName || !country || !phoneNumber) {
        return setError(t('register_error_fillAllFields'));
    }
    if (!termsAccepted) {
        return setError(t('register_error_acceptTerms'));
    }
    
    setLoading(true);
    
    try {
      const { user, error } = await registerUser(username, email, password, refId);
      
      if (error) {
        throw new Error(error.message || t('register_error_registrationFailed'));
      }
      
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
            firstName: firstName,
            lastName: lastName,
            country: country.label,
            countryCode: country.value,
            phoneNumber: phoneNumber,
        });
      }

      console.log('Registration successful:', user);
      setMessage(t('register_message_registrationSuccess'));
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || t('register_error_registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-no-repeat bg-cover bg-center overflow-hidden m-0 p-0 inset-0 fixed px-[20px] sm:px-[60px] lg:px-[100px] py-[120px]">
      <div className="w-[90vw] max-w-[380px] sm:w-[420px] sm:max-w-[420px] md:w-[430px] md:max-w-[430px] lg:max-w-[450px] max-h-[80vh] px-[30px] py-12 rounded-3xl bg-black bg-opacity-60 border border-gray-800 shadow-xl flex flex-col mx-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300">
        
        <div className="flex-shrink-0 mb-8">
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-600 text-white px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-green-500 bg-opacity-20 border border-green-600 text-white px-4 py-2 rounded-lg mb-4">
              {message}
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="relative w-1/2">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-opacity-20"
                    placeholder={t('register_placeholder_firstName')}
                    required
                  />
                </div>
                <div className="relative w-1/2">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-opacity-20"
                    placeholder={t('register_placeholder_lastName')}
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-full bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 bg-opacity-20"
                  placeholder={t('register_placeholder_username')}
                  required
                />
                <svg className="absolute top-3.5 left-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-full bg-gray-900 border border-gray-700 bg-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                  placeholder={t('register_placeholder_email')}
                  required
                />
                <svg className="absolute top-3.5 left-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>

              <div className="relative">
                <Select
                  options={countryOptions}
                  value={country}
                  onChange={handleCountryChange}
                  placeholder={t('register_placeholder_country')}
                  required
                  classNamePrefix="react-select"
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      backgroundColor: 'rgba(17, 24, 39, 0.2)', // bg-gray-900 bg-opacity-20
                      borderColor: state.isFocused ? '#3b82f6' : '#4b5563', // focus:ring-blue-500, border-gray-700
                      borderRadius: '9999px', // rounded-full
                      padding: '0.4rem', 
                      color: 'white',
                      boxShadow: state.isFocused ? '0 0 0 2px #3b82f6' : 'none', // focus:ring-2 focus:ring-blue-500
                      '&:hover': {
                        borderColor: '#6b7280', // border-gray-600 (example)
                      },
                    }),
                    singleValue: (baseStyles) => ({
                      ...baseStyles,
                      color: 'white',
                    }),
                    input: (baseStyles) => ({
                      ...baseStyles,
                      color: 'white',
                      paddingLeft: '0.5rem', // Corresponds to pl-10 roughly with an icon
                    }),
                    placeholder: (baseStyles) => ({
                      ...baseStyles,
                      color: '#9ca3af', // text-gray-400
                      paddingLeft: '0.5rem',
                    }),
                    menu: (baseStyles) => ({
                      ...baseStyles,
                      backgroundColor: '#1f2937', // bg-gray-800 (example)
                      borderRadius: '0.5rem',
                    }),
                    option: (baseStyles, state) => ({
                      ...baseStyles,
                      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#374151' : '#1f2937', // selected, focused, default
                      color: 'white',
                      '&:active': {
                        backgroundColor: '#2563eb',
                      },
                    }),
                  }}
                />
              </div>

              <div className="relative">
                <PhoneInput
                  country={country?.value?.toLowerCase() || 'ar'} // Default to Argentina or selected country
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  inputProps={{
                    name: 'phone',
                    required: true,
                    className: "w-full px-4 py-3 rounded-full bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-opacity-20 pl-12 sm:pl-14 md:pl-16", // Adjust padding-left
                  }}
                  containerClass="w-full"
                  dropdownClass="bg-gradient-to-b from-[#232323] to-[#2b2b2b] border border-gray-700 text-white rounded-lg shadow-lg" // Updated for gradient background
                  buttonClass="!bg-transparent !border-0 focus:outline-none focus:ring-0 hover:bg-gray-700" // Added !bg-transparent
                  buttonStyle={{ 
                    backgroundColor: 'transparent',
                    paddingLeft: '0.75rem' // Added padding to move flag right
                  }}
                  inputClass="!w-full !py-3 !rounded-full !bg-gray-900 !border !border-gray-700 !text-white !focus:outline-none !focus:ring-2 !focus:ring-blue-500 !bg-opacity-20"
                  placeholder={t('register_placeholder_phoneNumber')}
                  enableSearch={false}
                  dropdownStyle={{ 
                    width: '230px',
                    backgroundColor: 'transparent', // Ensure dropdown container is also transparent
                    background: 'linear-gradient(to bottom, #232323, #2b2b2b)'
                  }}
                  itemStyle={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.5rem 0.75rem', 
                    color: 'white',
                    backgroundColor: 'transparent' // Ensure items are transparent by default
                  }}
                  activeClass="!bg-gray-700 text-white" // Added !bg-gray-700 for active item
                />
              </div>
              
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-full bg-gray-900 border bg-opacity-20 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                  placeholder={t('register_placeholder_password')}
                  required
                />
                <svg className="absolute top-3.5 left-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-full bg-gray-900 border bg-opacity-20 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                  placeholder={t('register_placeholder_confirmPassword')}
                  required
                />
                <svg className="absolute top-3.5 left-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember_me" className="ml-2 block text-gray-300 text-sm">
                {t('register_label_acceptTermsAndPrivacy')}
              </label>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg relative overflow-hidden group"
                >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">{loading ? t('register_button_processing') : t('register_button_continue')}</span>
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onLoginClick}
                className="text-gray-300 hover:text-white bg-transparent"
              >
                {t('register_button_loginHere')}
              </button>
              <p className="text-gray-400 mt-1">
                {t('register_text_alreadyRegistered')}
                <button type="button" onClick={onLoginClick} className="text-white font-semibold bg-transparent">{t('login_button_login')}</button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;