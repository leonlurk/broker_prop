import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar, ArrowLeft, Save, Loader, AlertTriangle, Phone } from 'lucide-react';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';

const UserInformationContent = ({ onBack }) => {
  const { language } = useAuth();
  const t = getTranslator(language);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [genero, setGenero] = useState('');
  
  // Estados para país y ciudad
  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState('');
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState('');
  const [cargandoPaises, setCargandoPaises] = useState(false);
  const [cargandoCiudades, setCargandoCiudades] = useState(false);
  
  // Estados para teléfono
  const [codigoPais, setCodigoPais] = useState('');
  const [numeroTelefono, setNumeroTelefono] = useState('');
  
  // Estados para manejo de guardado
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Códigos de países para teléfonos
  const codigosPaises = [
    { codigo: '+54', pais: 'Argentina' },
    { codigo: '+598', pais: 'Uruguay' },
    { codigo: '+56', pais: 'Chile' },
    { codigo: '+55', pais: 'Brasil' },
    { codigo: '+595', pais: 'Paraguay' },
    { codigo: '+51', pais: 'Perú' },
    { codigo: '+593', pais: 'Ecuador' },
    { codigo: '+57', pais: 'Colombia' },
    { codigo: '+58', pais: 'Venezuela' },
    { codigo: '+52', pais: 'México' },
  ];
  
  // 1. Cargar lista de países al montar el componente
  useEffect(() => {
    const fetchPaises = async () => {
      setCargandoPaises(true);
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries');
        const data = await response.json();
        
        if (data.error === false && data.data) {
          const paisesFiltrados = data.data.map(pais => ({
            nombre: pais.country,
            ciudades: pais.cities
          })).sort((a, b) => a.nombre.localeCompare(b.nombre));
          
          setPaises(paisesFiltrados);
        }
      } catch (error) {
        console.error(t('userInfo_error_loadCountries'), error);
        setSaveError(t('userInfo_error_loadCountries'));
      } finally {
        setCargandoPaises(false);
      }
    };
    
    fetchPaises();
  }, []);
  
  // 2. Actualizar ciudades cuando cambia el país seleccionado
  useEffect(() => {
    if (!paisSeleccionado) return;
    
    setCargandoCiudades(true);
    
    // Buscar el país seleccionado en la lista
    const paisEncontrado = paises.find(pais => pais.nombre === paisSeleccionado);
    
    if (paisEncontrado && paisEncontrado.ciudades) {
      // Ordenar ciudades alfabéticamente
      const ciudadesOrdenadas = [...paisEncontrado.ciudades].sort();
      setCiudades(ciudadesOrdenadas);
      
      // Seleccionar la primera ciudad si hay ciudades disponibles
      if (ciudadesOrdenadas.length > 0 && !ciudadSeleccionada) {
        setCiudadSeleccionada(ciudadesOrdenadas[0]);
      }
    } else {
      setCiudades([]);
    }
    
    setCargandoCiudades(false);
  }, [paisSeleccionado, paises]);
  
  // Cargar datos del usuario desde Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setNombre(userData.nombre || '');
            setApellido(userData.apellido || '');
            setFechaNacimiento(userData.fechaNacimiento || '');
            setGenero(userData.genero || '');
            
            // Establecer país y ciudad si existen en los datos
            if (userData.pais) {
              setPaisSeleccionado(userData.pais);
              // Las ciudades se cargarán automáticamente cuando cambie el país
            }
            
            if (userData.ciudad) {
              setCiudadSeleccionada(userData.ciudad);
            }
            
            // Cargar código de país y número de teléfono
            if (userData.telefono) {
              const fullPhone = userData.telefono;
              
              // Buscar el código de país en el número completo
              const codigoEncontrado = codigosPaises.find(cp => 
                fullPhone.startsWith(cp.codigo)
              );
              
              if (codigoEncontrado) {
                setCodigoPais(codigoEncontrado.codigo);
                setNumeroTelefono(fullPhone.substring(codigoEncontrado.codigo.length));
              } else {
                setNumeroTelefono(fullPhone);
              }
            }
          }
        }
      } catch (err) {
        console.error(t('userInfo_error_loadUserData'), err);
        setSaveError(t('userInfo_error_loadUserData'));
      }
    };
    
    fetchUserData();
  }, []);
  
  // Función para generar el calendario
  const renderCalendar = () => {
    const today = new Date();
    const minYear = today.getFullYear() - 100; // Permitir hasta 100 años atrás
    const maxYear = today.getFullYear() - 18;  // Mínimo 18 años
    
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
    const months = [
      t('month_january'), t('month_february'), t('month_march'), t('month_april'),
      t('month_may'), t('month_june'), t('month_july'), t('month_august'),
      t('month_september'), t('month_october'), t('month_november'), t('month_december')
    ];
    
    // Obtener valores actuales de la fecha
    let day = '', month = '', year = '';
    if (fechaNacimiento) {
      const parts = fechaNacimiento.split('/');
      if (parts.length === 3) {
        day = parseInt(parts[0]).toString(); // Remove leading zeros
        month = parseInt(parts[1]) - 1; // Ajustar a índice base 0
        year = parts[2];
      }
    }
    
    // Función para obtener días del mes
    const getDaysInMonth = (month, year) => {
      // Si no hay mes o año seleccionado, devolver 31 días
      if (month === '' || year === '') return Array.from({ length: 31 }, (_, i) => i + 1);
      
      const daysInMonth = new Date(parseInt(year), parseInt(month) + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    };
    
    // Obtener días basados en el mes y año seleccionados
    const days = getDaysInMonth(month, year);
    
    // Función para establecer un componente de la fecha
    const setDatePart = (part, value) => {
      let newDay = day, newMonth = month, newYear = year;
      
      if (part === 'day') newDay = value;
      if (part === 'month') newMonth = value;
      if (part === 'year') newYear = value;
      
      // Asegurarse de que el día es válido para el mes/año
      if (newDay && newMonth !== '' && newYear) {
        const daysInMonth = new Date(parseInt(newYear), parseInt(newMonth) + 1, 0).getDate();
        if (parseInt(newDay) > daysInMonth) {
          newDay = daysInMonth.toString();
        }
      }
      
      // Formatear la fecha como DD/MM/YYYY
      const formattedDay = newDay.toString().padStart(2, '0');
      const formattedMonth = (parseInt(newMonth) + 1).toString().padStart(2, '0');
      setFechaNacimiento(`${formattedDay}/${formattedMonth}/${newYear}`);
    };
    
    return (
      <div className="absolute top-full left-0 mt-2 p-4 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-lg z-20 w-full">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">{t('calendar_day')}</label>
            <select 
              value={day} 
              onChange={(e) => setDatePart('day', e.target.value)}
              className="w-full p-2 bg-[#232323] border border-[#444] rounded text-white"
            >
              <option value="">{t('calendar_select_day')}</option>
              {days.map(d => (
                <option key={`day-${d}`} value={d}>{d}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">{t('calendar_month')}</label>
            <select 
              value={month} 
              onChange={(e) => setDatePart('month', e.target.value)}
              className="w-full p-2 bg-[#232323] border border-[#444] rounded text-white"
            >
              <option value="">{t('calendar_select_day')}</option>
              {months.map((m, i) => (
                <option key={`month-${i}`} value={i}>{m}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">{t('calendar_year')}</label>
            <select 
              value={year} 
              onChange={(e) => setDatePart('year', e.target.value)}
              className="w-full p-2 bg-[#232323] border border-[#444] rounded text-white"
            >
              <option value="">{t('calendar_select_year')}</option>
              {years.map(y => (
                <option key={`year-${y}`} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => setShowCalendar(false)}
            className="px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-600 transition"
          >
            Aceptar
          </button>
        </div>
      </div>
    );
  };
  
  // Validar y formatear el número de teléfono
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Permitir solo números
    const numerosOnly = value.replace(/[^\d]/g, '');
    setNumeroTelefono(numerosOnly);
  };
  
  const validateForm = () => {
    if (!nombre || !apellido || !fechaNacimiento || !genero || !paisSeleccionado || !ciudadSeleccionada || !codigoPais || !numeroTelefono) {
      setSaveError(t('userInfo_error_allFieldsRequired'));
      return false;
    }

    const dateParts = fechaNacimiento.split('/');
    if (dateParts.length !== 3) {
      setSaveError(t('userInfo_error_invalidDobFormat'));
      return false;
    }
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(dateParts[2], 10);
    const birthDate = new Date(year, month, day);
    const ageDiffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 18) {
      setSaveError(t('userInfo_error_ageRequirement'));
      return false;
    }
    
    // Additional validation for date parts if needed (e.g. valid day for month)
    if (isNaN(birthDate.getTime()) || birthDate.getDate() !== day || birthDate.getMonth() !== month || birthDate.getFullYear() !== year) {
        setSaveError(t('userInfo_error_invalidDobFormat'));
        return false;
    }

    setSaveError('');
    return true;
  };
  
  // Guardar datos del usuario en Firebase
  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          nombre,
          apellido,
          fechaNacimiento,
          genero,
          pais: paisSeleccionado,
          ciudad: ciudadSeleccionada,
          telefono: `${codigoPais}${numeroTelefono}`
        }, { merge: true });
        setSaveSuccess(true);
      }
    } catch (err) {
      console.error("Error guardando datos:", err);
      setSaveError(t('userInfo_error_saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-3xl text-white min-h-screen flex flex-col">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 mr-3">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold text-white">{t('userInfo_title')}</h1>
      </div>

      {/* Formulario */}
      <div className="space-y-6 flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#555 #333' }}>
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-1">{t('userInfo_label_firstName')}</label>
            <input 
              type="text" 
              id="nombre" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={t('userInfo_placeholder_firstName')}
              className="w-full p-3 bg-[#2c2c2c] border border-[#444] rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-300 mb-1">{t('userInfo_label_lastName')}</label>
            <input 
              type="text" 
              id="apellido" 
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder={t('userInfo_placeholder_lastName')}
              className="w-full p-3 bg-[#2c2c2c] border border-[#444] rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Fecha de Nacimiento y Género */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-300 mb-1">{t('userInfo_label_dob')}</label>
            <div 
              onClick={() => setShowCalendar(!showCalendar)} 
              className="w-full p-3 bg-[#2c2c2c] border border-[#444] rounded-lg text-white flex justify-between items-center cursor-pointer"
            >
              <span>{fechaNacimiento || t('userInfo_placeholder_dob')}</span>
              <Calendar size={20} className="text-gray-400" />
            </div>
            {showCalendar && renderCalendar()}
          </div>
          <div>
            <label htmlFor="genero" className="block text-sm font-medium text-gray-300 mb-1">{t('userInfo_label_gender')}</label>
            <select 
              id="genero" 
              value={genero} 
              onChange={(e) => setGenero(e.target.value)}
              className="w-full p-3 bg-[#2c2c2c] border border-[#444] rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500 appearance-none pr-8 bg-no-repeat"
              style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="gray" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em' }}
            >
              <option value="">{t('userInfo_placeholder_gender')}</option>
              <option value="masculino">{t('gender_male')}</option>
              <option value="femenino">{t('gender_female')}</option>
              <option value="otro">{t('gender_other')}</option>
              <option value="prefiero_no_decirlo">{t('gender_preferNotToSay')}</option>
            </select>
          </div>
        </div>

        {/* País y Ciudad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="pais" className="block text-sm font-medium text-gray-300 mb-1">{t('userInfo_label_country')}</label>
            <select 
              id="pais" 
              value={paisSeleccionado} 
              onChange={(e) => setPaisSeleccionado(e.target.value)}
              className="w-full p-3 bg-[#2c2c2c] border border-[#444] rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500 appearance-none pr-8 bg-no-repeat"
              style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="gray" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em' }}
              disabled={cargandoPaises}
            >
              <option value="">{cargandoPaises ? t('userInfo_loading_countries') : t('userInfo_placeholder_country')}</option>
              {paises.map(pais => (
                <option key={pais.nombre} value={pais.nombre}>{pais.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ciudad" className="block text-sm font-medium text-gray-300 mb-1">{t('userInfo_label_city')}</label>
            <select 
              id="ciudad" 
              value={ciudadSeleccionada} 
              onChange={(e) => setCiudadSeleccionada(e.target.value)}
              className="w-full p-3 bg-[#2c2c2c] border border-[#444] rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500 appearance-none pr-8 bg-no-repeat"
              style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="gray" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em' }}
              disabled={cargandoCiudades || !paisSeleccionado}
            >
              <option value="">
                {cargandoCiudades ? t('userInfo_loading_cities') : 
                 (ciudades.length === 0 && paisSeleccionado ? t('userInfo_noCitiesAvailable') : t('userInfo_placeholder_city'))}
              </option>
              {ciudades.map(ciudad => (
                <option key={ciudad} value={ciudad}>{ciudad}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-300 mb-1">{t('userInfo_label_phone')}</label>
          <div className="flex">
            <select 
              value={codigoPais} 
              onChange={(e) => setCodigoPais(e.target.value)}
              className="p-3 bg-[#2c2c2c] border border-[#444] rounded-l-lg text-white focus:ring-cyan-500 focus:border-cyan-500 appearance-none pr-8 bg-no-repeat w-1/3 md:w-1/4"
              style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="gray" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em' }}
            >
              <option value="">{t('userInfo_placeholder_phoneCode')}</option>
              {codigosPaises.map(cp => (
                <option key={cp.codigo} value={cp.codigo}>{cp.pais} ({cp.codigo})</option>
              ))}
            </select>
            <input 
              type="tel" 
              id="telefono" 
              value={numeroTelefono}
              onChange={(e) => setNumeroTelefono(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder={t('userInfo_placeholder_phoneNumber')}
              className="w-2/3 md:w-3/4 p-3 bg-[#2c2c2c] border border-l-0 border-[#444] rounded-r-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Error y Success messages */}
        {saveError && (
          <div className="flex items-center p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400">
            <AlertTriangle size={20} className="mr-2" />
            <span>{saveError}</span>
          </div>
        )}
        {saveSuccess && (
          <div className="flex items-center p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg text-green-400">
            <Save size={20} className="mr-2" />
            <span>{t('userInfo_success_saved')}</span>
          </div>
        )}
      </div>

      {/* Botón Guardar Cambios */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <button 
          onClick={handleSaveChanges} 
          disabled={isSaving}
          className="w-full flex items-center justify-center p-3 bg-gradient-to-r from-[#0F7490] to-[#0A5A72] hover:opacity-90 transition text-white rounded-lg text-lg font-semibold disabled:opacity-50"
        >
          {isSaving ? (
            <><Loader size={20} className="animate-spin mr-2" /> {t('userInfo_button_saving')}</>
          ) : (
            <>{t('userInfo_button_saveChanges')}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default UserInformationContent;