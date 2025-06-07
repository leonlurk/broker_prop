import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import PasswordResetVerification from './PasswordResetVerification';

const PasswordResetFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('email'); // 'email' or 'verification'
  const [email, setEmail] = useState('');

  const handleEmailSubmitted = (submittedEmail) => {
    setEmail(submittedEmail);
    setCurrentStep('verification');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleBackToEmail = () => {
    setCurrentStep('email');
    setEmail('');
  };

  if (currentStep === 'verification') {
    return (
      <PasswordResetVerification 
        email={email}
        onBackToLogin={handleBackToLogin}
        onBackToEmail={handleBackToEmail}
      />
    );
  }

  return (
    <ForgotPassword 
      onContinue={handleEmailSubmitted}
      onLoginClick={handleBackToLogin}
    />
  );
};

export default PasswordResetFlow; 