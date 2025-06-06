import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import VerificationCode from './components/VerificationCode';
import Dashboard from './Dashboard';
import PaymentStatus from './components/PaymentStatus';
import { useAuth } from './contexts/AuthContext';
import { logoutUser } from './firebase/auth';
import Verification from './components/Verification';
import ActionRedirector from './components/ActionRedirector';

function App() {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Asegurar modo oscuro
  useEffect(() => {
    // Garantizar que el modo oscuro esté siempre activado
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }, []);
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && window.location.pathname === '/login') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
 
  // Common background wrapper for auth pages
  const AuthPageWrapper = ({ children }) => (
    <div className="min-h-screen w-full flex items-center justify-end bg-black bg-no-repeat bg-cover bg-center dark"
      style={{ backgroundImage: 'url(/fondo.png)', width: '100vw', height: '100vh' }}>
      <div className="mr-6 md:mr-6 sm:mx-auto">
        {children}
      </div>
    </div>
  );

  return (
    <div className="dark">
      <ActionRedirector />
      <Routes>
        <Route 
          path="/login" 
          element={
            <AuthPageWrapper>
              <Login 
                onRegisterClick={() => navigate('/register')} 
                onForgotClick={() => navigate('/forgot-password')}
                onLoginSuccess={() => navigate('/dashboard')} 
              />
            </AuthPageWrapper>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <AuthPageWrapper>
              <Register onLoginClick={() => navigate('/login')} />
            </AuthPageWrapper>
          } 
        />
        
        <Route 
          path="/forgot-password" 
          element={
            <AuthPageWrapper>
              <ForgotPassword 
                onContinue={() => navigate('/verification')} 
                onLoginClick={() => navigate('/login')} 
              />
            </AuthPageWrapper>
          } 
        />
        
        <Route 
          path="/verification" 
          element={
            <AuthPageWrapper>
              <Verification />
            </AuthPageWrapper>
          } 
        />
        
        <Route 
          path="/payment-status/:uniqueId" 
          element={
            isAuthenticated ? (
              <PaymentStatus />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/dashboard/*" 
          element={
            isAuthenticated ? (
              <Dashboard onLogout={handleLogout} user={currentUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Redirect all other routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;