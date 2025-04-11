import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Copy, Save, AlertTriangle, Loader } from 'lucide-react';
import KYCVerification from './KYCVerification';
import ChangePasswordModal from './ChangePasswordModal';
import UpdateEmailModal from './UpdateEmailModal';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Settings = ({ onBack }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [showKYC, setShowKYC] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showUpdateEmailModal, setShowUpdateEmailModal] = useState(false);
  const [userHasApprovedAccount, setUserHasApprovedAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userKycStatus, setUserKycStatus] = useState(null);
  
  // Estados para la wallet
  const [walletAddress, setWalletAddress] = useState('');
  const [isEditingWallet, setIsEditingWallet] = useState(false);
  const [editWalletAddress, setEditWalletAddress] = useState('');
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const [walletError, setWalletError] = useState('');
  const [walletSuccessMessage, setWalletSuccessMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    const checkUserAccountStatus = async () => {
      setIsLoading(true);
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserHasApprovedAccount(userData.approved === true);
            setUserKycStatus(userData.kyc_status || null);
            
            // Cargar la dirección de la wallet
            if (userData.withdrawals_wallet) {
              setWalletAddress(userData.withdrawals_wallet);
              setEditWalletAddress(userData.withdrawals_wallet);
            }
          } else {
            setUserHasApprovedAccount(false);
          }
        }
      } catch (error) {
        console.error("Error:", error);
        setWalletError('Error al cargar los datos. Intente de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserAccountStatus();
  }, []);

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  // Funciones para la gestión de la wallet
  const toggleWalletEditMode = () => {
    setIsEditingWallet(!isEditingWallet);
    setEditWalletAddress(walletAddress);
    setWalletError('');
    setWalletSuccessMessage('');
  };
  
  const saveWalletAddress = async () => {
    // Validación básica
    if (!editWalletAddress.trim()) {
      setWalletError('Por favor, introduzca una dirección de wallet válida.');
      return;
    }
    
    setIsSavingWallet(true);
    setWalletError('');
    
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Actualizar sólo el campo withdrawals_wallet
        await setDoc(userDocRef, { withdrawals_wallet: editWalletAddress.trim() }, { merge: true });
        
        setWalletAddress(editWalletAddress.trim());
        setWalletSuccessMessage('Dirección de wallet actualizada correctamente');
        
        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setWalletSuccessMessage('');
        }, 3000);
        
        setIsEditingWallet(false);
      } else {
        setWalletError('Debe iniciar sesión para actualizar la dirección de wallet.');
      }
    } catch (err) {
      console.error('Error al actualizar la wallet:', err);
      setWalletError('Error al guardar los cambios. Intente de nuevo más tarde.');
    } finally {
      setIsSavingWallet(false);
    }
  };
  
  // Función para copiar al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setShowSnackbar(true);
        setTimeout(() => {
          setShowSnackbar(false);
        }, 3000); // Ocultar después de 3 segundos
      })
      .catch(err => {
        console.error('Error al copiar: ', err);
      });
  };

  if (showKYC) {
    return <KYCVerification onBack={() => setShowKYC(false)} />;
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#262626] text-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#262626] text-white flex flex-col">
      {/* Header with back button */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-cyan-500 hover:text-cyan-400 transition mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver
          </button>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold">Ajustes</h1>
      </div>
      
      {/* Main Settings Container with border */}
      <div className="border border-[#333] rounded-2xl bg-gradient-to-br from-[#232323] to-[#2d2d2d] p-4 md:p-6">
        {/* Settings Sections */}
        <div className="space-y-4">
        {/* Account Configuration */}
        <div className="border border-[#333] rounded-3xl bg-gradient-to-br from-[#232323] to-[#2d2d2d]">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('account')}
          >
            <h2 className="text-lg md:text-xl">Configuracion de Cuenta</h2>
            <div className={`transition-transform duration-500 ease-in-out ${expandedSection === 'account' ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div 
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              expandedSection === 'account' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-4 pb-4 border-t border-[#333] pt-4">
              <div className="space-y-4">
              <div 
                className={`p-3 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] ${userHasApprovedAccount ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`} 
                onClick={() => userHasApprovedAccount && setShowKYC(true)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span>Verificacion KYC</span>
                    {!userHasApprovedAccount && (
                      <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                        Requiere cuenta aprobada
                      </span>
                    )}
                    {userHasApprovedAccount && userKycStatus === 'pending_approval' && (
                      <span className="ml-2 text-xs bg-yellow-900/60 text-yellow-300 px-2 py-1 rounded-full">
                        Aprobación pendiente
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] cursor-pointer" onClick={() => setShowChangePasswordModal(true)}>
                  <div className="flex justify-between items-center">
                    <span>Cambiar Contraseña</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] cursor-pointer" onClick={() => setShowUpdateEmailModal(true)}>
                  <div className="flex justify-between items-center">
                    <span>Actualizar Correo Electronico</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="border border-[#333] rounded-3xl bg-gradient-to-br from-[#232323] to-[#202020]">
          <div 
            className="p-4 flex rounded-3xl bg-gradient-to-br from-[#232323] to-[#2d2d2d] justify-between items-center cursor-pointer"
            onClick={() => toggleSection('notifications')}
          >
            <h2 className="text-lg md:text-xl">Notificaciones</h2>
            <div className={`transition-transform duration-500 ease-in-out ${expandedSection === 'notifications' ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div 
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              expandedSection === 'notifications' ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-4 pb-4 border-t border-[#333] bg-gradient-to-br from-[#232323] to-[#2d2d2d] pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Notificaciones Push</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-cyan-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="border border-[#333] rounded-3xl bg-gradient-to-br from-[#232323] to-[#202020]">
          <div 
            className="p-4 flex  rounded-3xl justify-between items-center cursor-pointer bg-gradient-to-br from-[#232323] to-[#2d2d2d]"
            onClick={() => toggleSection('payment')}
          >
            <h2 className="text-lg md:text-xl">Método de pago</h2>
            <div className={`transition-transform duration-500 ease-in-out ${expandedSection === 'payment' ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div 
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              expandedSection === 'payment' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-4 pb-4 border-t border-[#333] pt-4">
              <div className="p-4 bg-gradient-to-br from-[#232323] to-[#2a2a2a] rounded-lg">
                <h3 className="text-lg font-medium mb-3">Direccion De Pago USDT</h3>
                <p className="text-gray-400 mb-4">Proporcionar Una Dirección USDT TRC20 Válida</p>
                
                {walletSuccessMessage && (
                  <div className="bg-green-900/20 border border-green-600 text-green-400 p-3 rounded-lg mb-3">
                    {walletSuccessMessage}
                  </div>
                )}
                
                {walletError && (
                  <div className="bg-red-900/20 border border-red-600 text-red-400 p-3 rounded-lg mb-3 flex items-center">
                    <AlertTriangle size={16} className="mr-2" />
                    {walletError}
                  </div>
                )}
                
                {isEditingWallet ? (
                  <div className="flex flex-col space-y-3">
                    <input
                      type="text"
                      className="flex-grow p-3 bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-lg border border-[#333] text-white"
                      value={editWalletAddress}
                      onChange={(e) => setEditWalletAddress(e.target.value)}
                      placeholder="Ingrese su dirección TRC20 USDT"
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        className="px-6 py-3 bg-gradient-to-br from-[#0F7490] to-[#0A5A72] text-white rounded-full hover:opacity-90 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={saveWalletAddress}
                        disabled={isSavingWallet}
                      >
                        {isSavingWallet ? (
                          <>
                            <Loader size={16} className="animate-spin mr-2" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save size={16} className="mr-2" />
                            Guardar
                          </>
                        )}
                      </button>
                      <button 
                        className="px-6 py-3 bg-[#2a2a2a] text-white rounded-full hover:bg-[#333] transition"
                        onClick={toggleWalletEditMode}
                        disabled={isSavingWallet}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-grow p-3 bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-lg border border-[#333] text-gray-300 overflow-hidden flex items-center">
                      <span className="truncate mr-2">{walletAddress || 'No se ha establecido una dirección de wallet'}</span>
                      {walletAddress && (
                        <button 
                          className="ml-auto p-1 hover:bg-[#333] rounded" 
                          onClick={() => copyToClipboard(walletAddress)}
                        >
                          <Copy size={16} className="text-gray-400" />
                        </button>
                      )}
                    </div>
                    <button 
                      className="px-6 py-3 bg-gradient-to-br focus:outline-none from-[#0F7490] to-[#0A5A72] text-white rounded-full hover:opacity-90 transition"
                      onClick={toggleWalletEditMode}
                    >
                      {walletAddress ? 'Editar' : 'Agregar método de pago'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal 
        isOpen={showChangePasswordModal} 
        onClose={() => setShowChangePasswordModal(false)} 
      />
      
      <UpdateEmailModal 
        isOpen={showUpdateEmailModal} 
        onClose={() => setShowUpdateEmailModal(false)} 
      />
      
      {showSnackbar && (
        <div className="fixed bottom-4 right-4 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-fade-in-out">
          <span>Texto copiado al portapapeles</span>
        </div>
      )}
    </div>
  );
};

export default Settings;