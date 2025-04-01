import React, { useState, useEffect } from 'react';
import { ChevronDown, Copy, ArrowUpDown, Save, AlertTriangle, Loader } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AfiliadosDashboard = () => {
  const [activeTab, setActiveTab] = useState('panel');
  const [walletAddress, setWalletAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editWalletAddress, setEditWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Datos para las tablas
  const referenciasData = [];
  const pagosData = [];
  
  // Cargar la dirección de la wallet desde Firebase
  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists() && userDoc.data().withdrawals_wallet) {
            setWalletAddress(userDoc.data().withdrawals_wallet);
            setEditWalletAddress(userDoc.data().withdrawals_wallet);
          }
        }
      } catch (err) {
        console.error('Error al obtener la dirección de wallet:', err);
        setError('Error al cargar los datos. Intente de nuevo más tarde.');
      }
    };
    
    fetchWalletAddress();
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setEditWalletAddress(walletAddress);
    setError('');
    setSuccessMessage('');
  };
  
  const saveWalletAddress = async () => {
    // Validación básica
    if (!editWalletAddress.trim()) {
      setError('Por favor, introduzca una dirección de wallet válida.');
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Actualizar sólo el campo withdrawals_wallet
        await setDoc(userDocRef, { withdrawals_wallet: editWalletAddress.trim() }, { merge: true });
        
        setWalletAddress(editWalletAddress.trim());
        setSuccessMessage('Dirección de wallet actualizada correctamente');
        
        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
        
        setIsEditing(false);
      } else {
        setError('Debe iniciar sesión para actualizar la dirección de wallet.');
      }
    } catch (err) {
      console.error('Error al actualizar la wallet:', err);
      setError('Error al guardar los cambios. Intente de nuevo más tarde.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Dirección copiada al portapapeles');
      })
      .catch(err => {
        console.error('Error al copiar: ', err);
      });
  };

  // Renderizar el contenido según la pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case 'panel':
        return (
          <div className="space-y-6">
            {/* Rendimiento */}
            <div className="space-y-4">
              <h2 className="text-3xl font-medium">Rendimiento</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Comisiones */}
                <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-xl border border-[#333]">
                  <h3 className="text-xl font-medium mb-2">Comisiones</h3>
                  <p className="text-2xl md:text-3xl font-medium">$1.000,00</p>
                </div>
                
                {/* Referencias */}
                <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-xl border border-[#333]">
                  <h3 className="text-xl font-medium mb-2">Referencias</h3>
                  <p className="text-2xl md:text-3xl font-medium">200</p>
                </div>
                
                {/* Pagos */}
                <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-xl border border-[#333]">
                  <h3 className="text-xl font-medium mb-2">Pagos</h3>
                  <p className="text-2xl md:text-3xl font-medium">$1.000,00</p>
                </div>
              </div>
            </div>
            
            {/* Enlace De Afiliados */}
            <div className="space-y-4">
              <h2 className="text-3xl font-medium">Enlace De Afiliados</h2>
              
              <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-xl border border-[#333]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  {/* ID Del Afiliado */}
                  <div>
                    <label className="block text-gray-400 text-base mb-2">ID Del Afiliado</label>
                    <div className="p-5 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-full border border-[#333] text-gray-300 truncate">
                      6265beff-588e-416d-83de-748cb4ce
                    </div>
                  </div>
                  
                  {/* Campaña */}
                  <div>
                    <label className="block text-gray-400 text-base mb-2">Campaña</label>
                    <div className="relative">
                      <select className="appearance-none p-5 pr-10 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-full border border-[#333] w-full text-gray-300">
                        <option>Por Defecto</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Pagina De Destino */}
                  <div>
                    <label className="block text-gray-400 text-base mb-2">Pagina De Destino</label>
                    <div className="relative">
                      <select className="appearance-none p-5 pr-10 bg-gradient-to-br from-[#232323] to-[#2b2b2b] rounded-full border border-[#333] w-full text-gray-300">
                        <option>Pagina De Compra</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Direccion De Pago USDT */}
            <div className="space-y-4">
              <h2 className="text-3xl font-medium">Direccion De Pago USDT</h2>
              <p className="text-gray-400">Proporcionar Una Dirección USDT TRC20 Válida</p>
              
              {successMessage && (
                <div className="bg-green-900/20 border border-green-600 text-green-400 p-3 rounded-lg mb-3">
                  {successMessage}
                </div>
              )}
              
              {error && (
                <div className="bg-red-900/20 border border-red-600 text-red-400 p-3 rounded-lg mb-3 flex items-center">
                  <AlertTriangle size={16} className="mr-2" />
                  {error}
                </div>
              )}
              
              {isEditing ? (
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
                      disabled={isSaving}
                    >
                      {isSaving ? (
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
                      onClick={toggleEditMode}
                      disabled={isSaving}
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
                    onClick={toggleEditMode}
                  >
                    Editar
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case 'referencias':
        return (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="py-4 px-3 font-medium">Identificacion de referencia</th>
                    <th className="py-4 px-3 font-medium">Nombre Completo</th>
                    <th className="py-4 px-3 font-medium">País</th>
                    <th className="py-4 px-3 font-medium">Creado en</th>
                    <th className="py-4 px-3 font-medium">Identificacion de campaña</th>
                    <th className="py-4 px-3 font-medium">Nombre de la campaña</th>
                    <th className="py-4 px-3 font-medium">N° de compras</th>
                    <th className="py-4 px-3 font-medium">Ingresos totales</th>
                    <th className="py-4 px-3 font-medium">Comisiones</th>
                  </tr>
                </thead>
                <tbody>
                  {referenciasData.length > 0 ? (
                    referenciasData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-800 text-sm">
                        {/* Datos dinámicos aquí */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-gray-400">
                        No hay datos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'pagos':
        return (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="py-4 px-3 font-medium">Identificacion de pago</th>
                    <th className="py-4 px-3 font-medium">
                      <div className="flex items-center">
                        Creado en
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </th>
                    <th className="py-4 px-3 font-medium">Cantidad a pagar</th>
                    <th className="py-4 px-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosData.length > 0 ? (
                    pagosData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-800 text-sm">
                        {/* Datos dinámicos aquí */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-400">
                        No hay datos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#232323] text-white p-4 md:p-6">
      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          className={`px-4 py-3 rounded-full focus:outline-none bg-gradient-to-br from-[#232323] to-[#2d2d2d] border-[#333] font-regular flex items-center space-x-2 ${
            activeTab === 'panel' 
              ? 'border border-cyan-500 text-white' 
              : 'border border-[#333] text-gray-300 hover:bg-[#2a2a2a]'
          }`}
          onClick={() => handleTabClick('panel')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          <span>Panel</span>
        </button>
        
        <button
          className={`px-4 py-3 rounded-full focus:outline-none font-regular bg-gradient-to-br from-[#232323] to-[#2d2d2d] border-[#333] flex items-center space-x-2 ${
            activeTab === 'referencias' 
              ? 'border border-cyan-500 text-white' 
              : 'border border-[#333] text-gray-300 hover:bg-[#2a2a2a]'
          }`}
          onClick={() => handleTabClick('referencias')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
          <span>Referencias</span>
        </button>
        
        <button
          className={`px-4 py-3 rounded-full flex focus:outline-none font-regular bg-gradient-to-br from-[#232323] to-[#2d2d2d] border-[#333] items-center space-x-2 ${
            activeTab === 'pagos' 
              ? 'border border-cyan-500 text-white' 
              : 'border border-[#333] text-gray-300 hover:bg-[#2a2a2a]'
          }`}
          onClick={() => handleTabClick('pagos')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
          <span>Pagos</span>
        </button>
      </div>
      
      {/* Content Container */}
      <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] rounded-xl border border-[#333] mb-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default AfiliadosDashboard;