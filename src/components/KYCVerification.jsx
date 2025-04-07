import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Upload } from 'lucide-react';
import { auth, db, storage } from '../firebase/config'; // Añadir storage
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const KYCVerification = ({ onBack }) => {
  const [selectedDocType, setSelectedDocType] = useState('identity');
  const [paises, setPaises] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState('');
  const [cargandoPaises, setCargandoPaises] = useState(false);
  const [userHasApprovedAccount, setUserHasApprovedAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const frontDocInputRef = useRef(null);
  const backDocInputRef = useRef(null);
  // Estados para archivos seleccionados
  const [frontDoc, setFrontDoc] = useState(null);
  const [backDoc, setBackDoc] = useState(null);
  const [frontDocPreview, setFrontDocPreview] = useState('');
  const [backDocPreview, setBackDocPreview] = useState('');
  const [kycStatus, setKycStatus] = useState('not_submitted');

  // Función para enviar documentos
  const submitDocuments = async () => {
    if (!frontDoc || !backDoc) {
      alert("Por favor sube ambos lados del documento");
      return;
    }
    
    try {
      const user = auth.currentUser;
      const userDocRef = doc(db, "users", user.uid);
      
      // Solo actualizar Firestore sin Storage
      await updateDoc(userDocRef, {
        kyc_status: 'pending_approval',
        kyc_submitted_at: new Date(),
        kyc_document_info: {
          document_type: selectedDocType,
          country: paisSeleccionado
        }
      });
      
      alert("Verificación enviada correctamente");
      onBack();
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    }
  };



  // Función para manejar la selección de archivos
const handleFileSelect = (e, side) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    if (side === 'front') {
      setFrontDoc(file);
      setFrontDocPreview(event.target.result);
    } else {
      setBackDoc(file);
      setBackDocPreview(event.target.result);
    }
  };
  reader.readAsDataURL(file);
};

useEffect(() => {
  const checkUserStatus = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserHasApprovedAccount(userData.approved === true);
          
          // Verificar estado KYC
          if (userData.kyc_status === 'pending_approval') {
            setKycStatus('pending_approval');
            
            // Cargar datos enviados
            setPaisSeleccionado(userData.kyc_document_info?.country || '');
            setSelectedDocType(userData.kyc_document_info?.document_type || 'identity');
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  checkUserStatus();
}, []);
  
  // Verificar si el usuario tiene una cuenta aprobada
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
            // Verificar si el usuario tiene una cuenta aprobada
            setUserHasApprovedAccount(userData.approved === true);
          } else {
            setUserHasApprovedAccount(false);
          }
        }
      } catch (error) {
        console.error("Error al verificar el estado de la cuenta:", error);
        setUserHasApprovedAccount(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserAccountStatus();
  }, []);

  // Cargar lista de países al montar el componente
  useEffect(() => {
    if (!userHasApprovedAccount) return;
    
    const fetchPaises = async () => {
      setCargandoPaises(true);
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries');
        const data = await response.json();
        
        if (data.error === false && data.data) {
          // Ordenar países alfabéticamente
          const paisesFiltrados = data.data.map(pais => ({
            nombre: pais.country,
            ciudades: pais.cities
          })).sort((a, b) => a.nombre.localeCompare(b.nombre));
          
          setPaises(paisesFiltrados);
        }
      } catch (error) {
        console.error('Error al cargar países:', error);
      } finally {
        setCargandoPaises(false);
      }
    };
    
    fetchPaises();
  }, [userHasApprovedAccount]);

  // Función para obtener código de país para generar bandera
  const getCountryCode = (countryName) => {
    const countryCodes = {
      'Argentina': 'ar',
      'Brazil': 'br',
      'Chile': 'cl',
      'Colombia': 'co',
      'Mexico': 'mx',
      'Peru': 'pe',
      'United States': 'us',
      'Spain': 'es',
      // Esta es una lista parcial. En producción, necesitarías una biblioteca completa o API
    };
    
    return countryCodes[countryName] || 'xx'; // 'xx' como fallback
  };

  // Mostrar pantalla de carga mientras se verifica el estado de la cuenta
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 bg-[#232323] text-white flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-[#232323] text-white flex flex-col">
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
      </div>
      
      {/* Main Container with border */}
      <div className="border border-[#333] rounded-xl bg-gradient-to-br from-[#232323] to-[#2d2d2d] p-4 md:p-6">
        {!userHasApprovedAccount ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-cyan-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Verificación no disponible</h2>
            <p className="text-gray-300 text-xl mb-2">Todavía no puedes verificarte ya que no tienes una cuenta en formato real.</p>
            <p className="text-gray-400">Completa una de nuestras cuentas de desafío para poder acceder a la verificación KYC.</p>
          </div>
            ) : kycStatus === 'pending_approval' ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">Verificación en proceso</h2>
                <p className="text-gray-300 mb-4">
                  Tu documentación ha sido enviada y está pendiente de revisión.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg w-full max-w-lg text-left">
                  <p className="mb-2"><strong>Tipo de documento:</strong> {selectedDocType}</p>
                  <p><strong>País emisor:</strong> {paisSeleccionado}</p>
                </div>
              </div>
            ) : (
          <>
            {/* Title and Description */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-semibold mb-2">Vamos a verificarte</h1>
              <p className="text-gray-300">Confirme su país de residencia para saber cómo se tratarán sus datos personales</p>
              
              {/* Country Input */}
              <div className="mt-4">
                <input 
                  type="text" 
                  placeholder="Ingrese su país de residencia" 
                  className="w-full py-3 px-4 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-full text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              
              {/* Privacy Agreement */}
              <div className="mt-4 flex items-start">
                <input 
                  type="checkbox" 
                  id="privacyAgreement" 
                  className="mr-2 mt-1"
                />
                <label htmlFor="privacyAgreement" className="text-sm text-gray-300">
                  Confirmo que he leído el <span className="text-cyan-500 cursor-pointer">Aviso de privacidad</span> y doy mi consentimiento al tratamiento de mis datos personales
                </label>
              </div>
            </div>
            
            {/* Document Section */}
            <div className="mt-8">
              <h2 className="text-4xl font-semibold mb-2">Documento de identidad</h2>
              <p className="text-gray-300 mb-4">Seleccione el país emisor</p>
              
              {/* Country Selector - Usando la API */}
              <div className="relative mb-6">
                <div className="relative">
                  <select
                    value={paisSeleccionado}
                    onChange={(e) => setPaisSeleccionado(e.target.value)}
                    disabled={cargandoPaises}
                    className="appearance-none w-full py-3 px-4 bg-[#2a2a2a] border border-[#333] rounded-xl text-white focus:outline-none focus:border-cyan-500 pr-12"
                  >
                    {cargandoPaises ? (
                      <option value="">Cargando países...</option>
                    ) : (
                      <>
                        <option value="" disabled hidden>Seleccionar país emisor</option>
                        {paises.map((pais, index) => (
                          <option key={index} value={pais.nombre}>
                            {pais.nombre}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                
                {paisSeleccionado && (
                  <div className="mt-2 flex items-center">
                    <img 
                      src={`https://flagcdn.com/w40/${getCountryCode(paisSeleccionado).toLowerCase()}.png`} 
                      alt={`Bandera de ${paisSeleccionado}`} 
                      className="w-6 h-6 rounded-full mr-2" 
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect width='24' height='24' fill='%23555'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='white'%3E" + paisSeleccionado.substring(0, 2).toUpperCase() + "%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <span>{paisSeleccionado}</span>
                  </div>
                )}
              </div>
              
              {/* Document Type Selection */}
              <div className="mb-6">
                <p className="text-lg font-medium mb-3">Elija su tipo de documento</p>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    className={`p-3 border ${selectedDocType === 'identity' ? 'border-cyan-500' : 'border-[#333]'} rounded-lg text-center cursor-pointer hover:bg-[#2a2a2a] transition`}
                    onClick={() => setSelectedDocType('identity')}
                  >
                    Documento de identidad
                  </div>
                  <div 
                    className={`p-3 border ${selectedDocType === 'passport' ? 'border-cyan-500' : 'border-[#333]'} rounded-lg text-center cursor-pointer hover:bg-[#2a2a2a] transition`}
                    onClick={() => setSelectedDocType('passport')}
                  >
                    Pasaporte
                  </div>
                  <div 
                    className={`p-3 border ${selectedDocType === 'driverLicense' ? 'border-cyan-500' : 'border-[#333]'} rounded-lg text-center cursor-pointer hover:bg-[#2a2a2a] transition`}
                    onClick={() => setSelectedDocType('driverLicense')}
                  >
                    Permiso de conducir
                  </div>
                  <div 
                    className={`p-3 border ${selectedDocType === 'residencePermit' ? 'border-cyan-500' : 'border-[#333]'} rounded-lg text-center cursor-pointer hover:bg-[#2a2a2a] transition`}
                    onClick={() => setSelectedDocType('residencePermit')}
                  >
                    Permiso de residencia
                  </div>
                </div>
              </div>
              
              {/* Photo Instructions */}
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-2">Haga una foto de su documento de identidad.</h3>
                <p className="text-xl mb-2">La foto debe:</p>
                <ul className="list-disc pl-5 mb-4 text-gray-300">
                  <li>Estar bien iluminada y ser clara.</li>
                  <li>Todas las esquinas del documento se deben ver bien</li>
                </ul>
              </div>
              
            {/* Document Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Frente del documento */}
              {frontDocPreview ? (
                <div className="h-48 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-lg overflow-hidden">
                  <img 
                    src={frontDocPreview} 
                    alt="Vista previa del frente" 
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              ) : (
                <div 
                  className="h-48 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#252525] transition"
                  onClick={() => frontDocInputRef.current?.click()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-gray-300 text-center">
                    Subir Frente del<br />documento
                  </p>
                </div>
              )}
              
              <input 
                type="file" 
                ref={frontDocInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'front')}
              />
              
              {/* Dorso del documento */}
              {backDocPreview ? (
                <div className="h-48 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-lg overflow-hidden">
                  <img 
                    src={backDocPreview} 
                    alt="Vista previa del dorso" 
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              ) : (
                <div 
                  className="h-48 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#252525] transition"
                  onClick={() => backDocInputRef.current?.click()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-gray-300 text-center">
                    Subir Dorso del<br />documento
                  </p>
                </div>
              )}
              
              <input 
                type="file" 
                ref={backDocInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'back')}
              />
            </div>
            <div className="mt-8 flex justify-center">
              <button 
                className={`py-3 px-8 rounded-full ${
                  frontDoc && backDoc ? 'bg-gradient-to-br from-cyan-500 to-cyan-800 hover:bg-cyan-500' : 'bg-gray-700 cursor-not-allowed opacity-60'
                } transition-colors`}
                disabled={!frontDoc || !backDoc}
                onClick={submitDocuments}
              >
                Enviar documentos para verificación
              </button>
            </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KYCVerification;