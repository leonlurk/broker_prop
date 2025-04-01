import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar, ArrowLeft, Save, Loader, AlertTriangle, Phone } from 'lucide-react';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const UserInformationContent = ({ onBack }) => {
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
          // Ordenar países alfabéticamente
          const paisesFiltrados = data.data.map(pais => ({
            nombre: pais.country,
            ciudades: pais.cities
          })).sort((a, b) => a.nombre.localeCompare(b.nombre));
          
          setPaises(paisesFiltrados);
        }
      } catch (error) {
        console.error('Error al cargar países:', error);
        setSaveError('Error al cargar la lista de países');
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
        console.error('Error al cargar datos del usuario:', err);
        setSaveError('Error al cargar los datos del usuario');
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
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
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
            <label className="block text-gray-400 text-sm mb-2">Día</label>
            <select 
              value={day} 
              onChange={(e) => setDatePart('day', e.target.value)}
              className="w-full p-2 bg-[#232323] border border-[#444] rounded text-white"
            >
              <option value="">--</option>
              {days.map(d => (
                <option key={`day-${d}`} value={d}>{d}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">Mes</label>
            <select 
              value={month} 
              onChange={(e) => setDatePart('month', e.target.value)}
              className="w-full p-2 bg-[#232323] border border-[#444] rounded text-white"
            >
              <option value="">--</option>
              {months.map((m, i) => (
                <option key={`month-${i}`} value={i}>{m}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">Año</label>
            <select 
              value={year} 
              onChange={(e) => setDatePart('year', e.target.value)}
              className="w-full p-2 bg-[#232323] border border-[#444] rounded text-white"
            >
              <option value="">----</option>
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
  
  // Guardar datos del usuario en Firebase
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        setSaveError('Debe iniciar sesión para guardar sus datos');
        setIsSaving(false);
        return;
      }
      
      // Validaciones básicas
      if (!nombre.trim()) {
        setSaveError('El nombre es obligatorio');
        setIsSaving(false);
        return;
      }
      
      if (!apellido.trim()) {
        setSaveError('El apellido es obligatorio');
        setIsSaving(false);
        return;
      }
      
      // Validar fecha de nacimiento
      if (fechaNacimiento) {
        const parts = fechaNacimiento.split('/');
        if (parts.length !== 3 || isNaN(Date.parse(`${parts[1]}/${parts[0]}/${parts[2]}`))) {
          setSaveError('Formato de fecha inválido. Use DD/MM/YYYY');
          setIsSaving(false);
          return;
        }
      }
      
      // Combinar código de país y número de teléfono
      const telefonoCompleto = numeroTelefono ? `${codigoPais}${numeroTelefono}` : '';
      
      // Preparar datos para guardar
      const userData = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        fechaNacimiento,
        genero,
        pais: paisSeleccionado,
        ciudad: ciudadSeleccionada,
        telefono: telefonoCompleto,
        last_updated: new Date()
      };
      
      // Guardar en Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, userData, { merge: true });
      
      setSaveSuccess(true);
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error al guardar datos del usuario:', err);
      setSaveError('Error al guardar los cambios. Intente de nuevo más tarde.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border border-[#333] rounded-3xl bg-gradient-to-br from-[#232323] to-[#2d2d2d] bg-opacity-20 p-4 md:p-6 shadow-xl">
      <div className="border border-[#333] rounded-3xl bg-gradient-to-br from-[#232323] to-[#343434] bg-opacity-90 p-6 md:p-8">
        {/* Header con botón de volver */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-cyan-500 hover:text-cyan-400 transition mr-4 focus:outline-none"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Volver</span>
          </button>
          <h1 className="text-3xl text-white font-medium">Informacion de usuario</h1>
        </div>
        
        {/* Mensajes de estado */}
        {saveSuccess && (
          <div className="mb-4 bg-green-900/20 border border-green-600 text-green-400 p-3 rounded-lg">
            Datos guardados correctamente
          </div>
        )}
        
        {saveError && (
          <div className="mb-4 bg-red-900/20 border border-red-600 text-red-400 p-3 rounded-lg flex items-center">
            <AlertTriangle size={16} className="mr-2" />
            {saveError}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Nombre */}
          <div>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
              className="w-full py-6 px-6 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] text-white text-xl focus:outline-none focus:border-cyan-500"
            />
          </div>
          
          {/* Apellido */}
          <div>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Apellido"
              className="w-full py-6 px-6 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] text-xl text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Fecha de nacimiento */}
          <div className="relative">
            <input
              type="text"
              value={fechaNacimiento}
              placeholder="Fecha de nacimiento (DD/MM/YYYY)"
              onClick={() => setShowCalendar(true)}
              readOnly
              className="w-full py-6 px-6 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] text-white text-xl focus:outline-none focus:border-cyan-500 pr-12 cursor-pointer"
            />
            <Calendar 
              size={20} 
              className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" 
              onClick={() => setShowCalendar(!showCalendar)}
            />
            
            {showCalendar && renderCalendar()}
          </div>
          
          {/* Género */}
          <div className="relative">
            <select
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              className="appearance-none w-full py-6 px-6 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] text-[#a3a3a3] text-xl focus:outline-none focus:border-cyan-500 pr-12"
            >
              <option value="" disabled hidden>Genero</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
            <ChevronDown size={20} className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* País - Usando la API */}
          <div className="relative">
            <select
              value={paisSeleccionado}
              onChange={(e) => setPaisSeleccionado(e.target.value)}
              disabled={cargandoPaises}
              className="appearance-none w-full py-6 px-6 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] text-white text-xl focus:outline-none focus:border-cyan-500 pr-12"
            >
              {cargandoPaises ? (
                <option value="">Cargando países...</option>
              ) : (
                <>
                  <option value="" disabled hidden>Seleccionar país</option>
                  {paises.map((pais, index) => (
                    <option key={index} value={pais.nombre}>
                      {pais.nombre}
                    </option>
                  ))}
                </>
              )}
            </select>
            <ChevronDown size={20} className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Ciudad - Usando la API */}
          <div className="relative">
            <select
              value={ciudadSeleccionada}
              onChange={(e) => setCiudadSeleccionada(e.target.value)}
              disabled={cargandoCiudades || !paisSeleccionado}
              className="appearance-none w-full py-6 px-6 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] text-white text-xl focus:outline-none focus:border-cyan-500 pr-12"
            >
              {cargandoCiudades ? (
                <option value="">Cargando ciudades...</option>
              ) : !paisSeleccionado ? (
                <option value="">Seleccione un país primero</option>
              ) : ciudades.length === 0 ? (
                <option value="">No hay ciudades disponibles</option>
              ) : (
                <>
                  <option value="" disabled hidden>Seleccionar ciudad</option>
                  {ciudades.map((ciudad, index) => (
                    <option key={index} value={ciudad}>
                      {ciudad}
                    </option>
                  ))}
                </>
              )}
            </select>
            <ChevronDown size={20} className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <div className="mb-8">
          {/* Teléfono - Mejorado con entrada de número */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-1">
              <select
                value={codigoPais}
                onChange={(e) => setCodigoPais(e.target.value)}
                className="appearance-none w-full py-6 text-xl px-6 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] text-white focus:outline-none focus:border-cyan-500 pr-12"
              >
                <option value="" disabled hidden>Código</option>
                {codigosPaises.map((cp, index) => (
                  <option key={index} value={cp.codigo}>
                    {cp.codigo} ({cp.pais})
                  </option>
                ))}
              </select>
              <ChevronDown size={20} className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="relative md:col-span-3">
              <div className="relative">
                <input
                  type="tel"
                  value={numeroTelefono}
                  onChange={handlePhoneChange}
                  placeholder="Número de teléfono"
                  className="w-full py-6 px-6 rounded-full bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] text-white text-xl focus:outline-none focus:border-cyan-500 pl-10"
                />
                <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="py-4 px-8 rounded-full border border-cyan-500 text-white bg-transparent hover:bg-cyan-500/10 transition-colors focus:outline-none flex items-center"
          >
            {isSaving ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInformationContent;