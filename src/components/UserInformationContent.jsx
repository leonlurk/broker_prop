import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Calendar, ArrowLeft, Save, Loader, AlertTriangle, Phone } from 'lucide-react';
import { auth, db, storage } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const UserInformationContent = ({ onBack }) => {
  const { currentUser, language, reloadUserDetails } = useAuth();
  const t = useMemo(() => getTranslator(language), [language]);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [genero, setGenero] = useState('');
  
  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState('');
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState('');
  const [cargandoPaises, setCargandoPaises] = useState(false);
  const [cargandoCiudades, setCargandoCiudades] = useState(false);
  
  const [codigoPais, setCodigoPais] = useState('');
  const [numeroTelefono, setNumeroTelefono] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [profileImageUrl, setProfileImageUrl] = useState(currentUser?.photoURL || '');
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const [profilePicError, setProfilePicError] = useState('');
  const [profilePicSuccessMessage, setProfilePicSuccessMessage] = useState('');

  const [imageSrcForCropper, setImageSrcForCropper] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const imgRefForCropper = useRef(null);
  const aspect = 1 / 1;
  
  const codigosPaises = [
    { codigo: '+54', pais: t('country_argentina') || 'Argentina' },
    { codigo: '+598', pais: t('country_uruguay') || 'Uruguay' },
    { codigo: '+56', pais: t('country_chile') || 'Chile' },
    { codigo: '+55', pais: t('country_brazil') || 'Brasil' },
    { codigo: '+595', pais: t('country_paraguay') || 'Paraguay' },
    { codigo: '+51', pais: t('country_peru') || 'Perú' },
    { codigo: '+593', pais: t('country_ecuador') || 'Ecuador' },
    { codigo: '+57', pais: t('country_colombia') || 'Colombia' },
    { codigo: '+58', pais: t('country_venezuela') || 'Venezuela' },
    { codigo: '+52', pais: t('country_mexico') || 'México' },
  ];
  
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
      } finally {
        setCargandoPaises(false);
      }
    };
    
    fetchPaises();
  }, [t]);
  
  useEffect(() => {
    if (!paisSeleccionado || paises.length === 0) return;
    
    setCargandoCiudades(true);
    const paisEncontrado = paises.find(pais => pais.nombre === paisSeleccionado);
    
    if (paisEncontrado && paisEncontrado.ciudades) {
      const ciudadesOrdenadas = [...paisEncontrado.ciudades].sort();
      setCiudades(ciudadesOrdenadas);
    } else {
      setCiudades([]);
    }
    
    setCargandoCiudades(false);
  }, [paisSeleccionado, paises]);
  
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
            
            if (userData.pais) {
              setPaisSeleccionado(userData.pais);
            }
            if (userData.ciudad) {
                setCiudadSeleccionada(userData.ciudad);
            }
            
            if (userData.telefono) {
              const fullPhone = userData.telefono;
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
            if (userData.photoURL) {
                setProfileImageUrl(userData.photoURL);
            } else if (currentUser.photoURL) { 
                setProfileImageUrl(currentUser.photoURL);
            } else {
                setProfileImageUrl('');
            }
          }
        }
      } catch (err) {
        console.error(t('userInfo_error_loadUserData'), err);
      }
    };
    if (paises.length > 0) { 
        fetchUserData();
    }
  }, [currentUser, t, paises]);

  useEffect(() => {
    if (currentUser?.photoURL) {
      setProfileImageUrl(currentUser.photoURL);
    } else {
      setProfileImageUrl('');
    }
  }, [currentUser?.photoURL]);

  const renderCalendar = () => {
    const today = new Date();
    const minYear = today.getFullYear() - 100;
    const maxYear = today.getFullYear() - 18;  
    
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
    const months = [
      t('month_january'), t('month_february'), t('month_march'), t('month_april'),
      t('month_may'), t('month_june'), t('month_july'), t('month_august'),
      t('month_september'), t('month_october'), t('month_november'), t('month_december')
    ];
    
    let currentDay = '', currentMonthIndex = '', currentYear = '';
    if (fechaNacimiento) {
      const parts = fechaNacimiento.split('/');
      if (parts.length === 3) {
        currentDay = parts[0]; 
        currentMonthIndex = (parseInt(parts[1]) - 1).toString();
        currentYear = parts[2];
      }
    }
    
    const getDaysInMonth = (monthIndex, yr) => {
      if (monthIndex === '' || yr === '') return Array.from({ length: 31 }, (_, i) => (i + 1).toString());
      const daysInMonthVal = new Date(parseInt(yr), parseInt(monthIndex) + 1, 0).getDate();
      return Array.from({ length: daysInMonthVal }, (_, i) => (i + 1).toString());
    };
    
    const days = getDaysInMonth(currentMonthIndex, currentYear);
    
    const setDatePart = (part, value) => {
      let newDay = currentDay, newMonthIndex = currentMonthIndex, newYear = currentYear;
      
      if (part === 'day') newDay = value;
      if (part === 'month') newMonthIndex = value;
      if (part === 'year') newYear = value;
      
      if (newDay && newMonthIndex !== '' && newYear) {
        const daysInSelectedMonth = new Date(parseInt(newYear), parseInt(newMonthIndex) + 1, 0).getDate();
        if (parseInt(newDay) > daysInSelectedMonth) {
          newDay = daysInSelectedMonth.toString();
        }
      }
      
      currentDay = newDay;
      currentMonthIndex = newMonthIndex;
      currentYear = newYear;

      if (newDay && newMonthIndex !== '' && newYear){
        const formattedDay = newDay.padStart(2, '0');
        const formattedMonth = (parseInt(newMonthIndex) + 1).toString().padStart(2, '0');
        setFechaNacimiento(`${formattedDay}/${formattedMonth}/${newYear}`);
      } else {
        setFechaNacimiento('');
      }
    };
    
    return (
      <div className="absolute top-full left-0 mt-2 p-4 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-lg z-20 w-full max-w-xs sm:max-w-sm md:max-w-md">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div>
            <label className="block text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">{t('calendar_day')}</label>
            <select 
              value={currentDay} 
              onChange={(e) => setDatePart('day', e.target.value)}
              className="w-full p-2 bg-[#232323] border border-[#444] rounded text-white text-xs sm:text-sm"
            >
              <option value="">{t('calendar_select_day')}</option>
              {days.map(d => (
                <option key={`day-${d}`} value={d}>{d}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">{t('calendar_month')}</label>
            <select 
              value={currentMonthIndex}
              onChange={(e) => setDatePart('month', e.target.value)}
              className="w-full p-2 bg-[#232323] border border-[#444] rounded text-white text-xs sm:text-sm"
            >
              <option value="">{t('calendar_select_month')}</option>
              {months.map((m, i) => (
                <option key={`month-${i}`} value={i.toString()}>{m}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">{t('calendar_year')}</label>
            <select 
              value={currentYear} 
              onChange={(e) => setDatePart('year', e.target.value)}
              className="w-full p-2 bg-[#232323] border border-[#444] rounded text-white text-xs sm:text-sm"
            >
              <option value="">{t('calendar_select_year')}</option>
              {years.map(y => (
                <option key={`year-${y}`} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-3 sm:mt-4 flex justify-end">
          <button 
            onClick={() => setShowCalendar(false)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-600 transition text-xs sm:text-sm"
          >
            {t('common_accept')}
          </button>
        </div>
      </div>
    );
  };
  
  const handlePhoneChange = (e) => {
    const value = e.target.value;
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
    const month = parseInt(dateParts[1], 10) - 1;
    const year = parseInt(dateParts[2], 10);
    const birthDate = new Date(year, month, day);
    const ageDiffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 18) {
      setSaveError(t('userInfo_error_ageRequirement'));
      return false;
    }
    
    if (isNaN(birthDate.getTime()) || birthDate.getDate() !== day || birthDate.getMonth() !== month || birthDate.getFullYear() !== year) {
        setSaveError(t('userInfo_error_invalidDobFormat'));
        return false;
    }

    setSaveError('');
    return true;
  };
  
  const handleSaveChanges = async () => {
    setSaveSuccess(false);
    setSaveError('');
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
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
          telefono: `${codigoPais}${numeroTelefono}`,
        }, { merge: true });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error guardando datos:", err);
      setSaveError(t('userInfo_error_saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  function onImageLoadForCropper(e) {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 50,
        },
        aspect,
        naturalWidth,
        naturalHeight
      ),
      naturalWidth,
      naturalHeight
    );
    setCrop(initialCrop);
  }

  const handleFileSelect = (event) => {
    setProfilePicError('');
    setProfilePicSuccessMessage('');

    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (!file.type.startsWith('image/')) {
        setProfilePicError(t('settings_profilePic_error_invalidFile'));
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrcForCropper(reader.result?.toString() || '');
        setShowCropModal(true);
      });
      reader.readAsDataURL(file);
      event.target.value = null;
    }
  };

  const handleCancelProfilePicUpdateAndCloseModal = () => {
    setProfilePicError('');
    setProfilePicSuccessMessage('');
    setImageSrcForCropper(null);
    setShowCropModal(false);
    setCrop(undefined);
    setCompletedCrop(null);
  };

  function getCroppedImg(image, cropData, fileName) { 
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = cropData.width;
      canvas.height = cropData.height;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        image,
        cropData.x * scaleX,
        cropData.y * scaleY,
        cropData.width * scaleX,
        cropData.height * scaleY,
        0,
        0,
        cropData.width,
        cropData.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          blob.name = fileName;
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  }

  const handleCropImageAndInitiateUpload = async () => {
    if (!completedCrop || !imgRefForCropper.current) {
      setProfilePicError(t('settings_cropImage_error_noSelection'));
      return;
    }
    
    try {
      setIsUploadingProfilePic(true);
      setProfilePicError('');
      setProfilePicSuccessMessage('');
      const croppedBlob = await getCroppedImg(
        imgRefForCropper.current, 
        completedCrop, 
        'profileImage.jpeg'
      );
      
      if (croppedBlob) {
        await handleProfilePicUpload(croppedBlob);
        handleCancelProfilePicUpdateAndCloseModal(); 
      } else {
        setProfilePicError(t('settings_cropImage_error_failed'));
      }
    } catch (error) {
      console.error("Error cropping image:", error);
      setProfilePicError(t('settings_cropImage_error_failed') + ': ' + error.message);
    } finally {
      setIsUploadingProfilePic(false);
    }
  };

  const handleProfilePicUpload = async (imageBlob) => {
    if (!currentUser) {
      setProfilePicError(t('settings_profilePic_error_mustLogin'));
      return;
    }
    if (!imageBlob) {
      setProfilePicError(t('settings_profilePic_error_noFileSelected'));
      return;
    }

    setIsUploadingProfilePic(true); 
    setProfilePicError('');
    setProfilePicSuccessMessage('');
    const fileExtension = imageBlob.type.split('/')[1] || 'jpeg';
    const fileName = `profileImage_${currentUser.uid}.${fileExtension}`;
    const storagePath = `profilePictures/${currentUser.uid}/${fileName}`;
    const imageStorageRef = ref(storage, storagePath); 

    try {
      await uploadBytes(imageStorageRef, imageBlob);
      const downloadURL = await getDownloadURL(imageStorageRef);

      await updateProfile(auth.currentUser, { photoURL: downloadURL }); 
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { photoURL: downloadURL });

      setProfileImageUrl(downloadURL);
      if (typeof reloadUserDetails === 'function') { 
         reloadUserDetails(); 
      }
      setProfilePicSuccessMessage(t('settings_profilePic_success_updated'));
      setTimeout(() => setProfilePicSuccessMessage(''), 3000);
      setSaveError(''); 
      setSaveSuccess(false);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setProfilePicError(t('settings_profilePic_error_uploadFailed') + (error.message ? `: ${error.message}` : ''));
    } finally {
      setIsUploadingProfilePic(false);
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

      <div className="space-y-6 flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#555 #333' }}>
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
              onChange={handlePhoneChange}
              placeholder={t('userInfo_placeholder_phoneNumber')}
              className="w-2/3 md:w-3/4 p-3 bg-[#2c2c2c] border border-l-0 border-[#444] rounded-r-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('settings_item_profilePicture')}</label>
            <div className="flex flex-col items-center space-y-4">
                <img 
                    src={profileImageUrl || '/default-avatar.png'} 
                    alt={t('settings_profilePic_alt')} 
                    className="w-32 h-32 rounded-full object-cover border-2 border-cyan-500"
                    onError={(e) => { e.target.onerror = null; e.target.src='/default-avatar.png'; }} 
                />
                
                {profilePicSuccessMessage && (
                    <div className="text-green-400 text-sm text-center py-2">{profilePicSuccessMessage}</div>
                )}
                {profilePicError && (
                    <div className="text-red-400 text-sm text-center flex items-center justify-center py-2">
                    <AlertTriangle size={16} className="mr-1" /> {profilePicError}
                    </div>
                )}

                <input
                    id="profilePicInputUserInfo"
                    name="profilePicInputUserInfo"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                />
                <button
                    type="button"
                    onClick={() => document.getElementById('profilePicInputUserInfo').click()}
                    disabled={isUploadingProfilePic}
                    className="px-4 py-2 border border-cyan-500 text-sm font-medium rounded-md text-cyan-400 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 disabled:opacity-50"
                >
                    {isUploadingProfilePic ? 
                        <><Loader size={16} className="animate-spin mr-2" /> {t('settings_profilePic_uploading') || 'Uploading...'}</> :
                        t('settings_button_changePicture')
                    }
                </button>
            </div>
        </div>

        {saveError && (
          <div className="flex items-center p-3 mt-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400">
            <AlertTriangle size={20} className="mr-2" />
            <span>{saveError}</span>
          </div>
        )}
        {saveSuccess && (
          <div className="flex items-center p-3 mt-4 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg text-green-400">
            <Save size={20} className="mr-2" />
            <span>{t('userInfo_success_saved')}</span>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700">
        <button 
          onClick={handleSaveChanges} 
          disabled={isSaving || isUploadingProfilePic}
          className="w-full flex items-center justify-center p-3 bg-gradient-to-r from-[#0F7490] to-[#0A5A72] hover:opacity-90 transition text-white rounded-lg text-lg font-semibold disabled:opacity-50"
        >
          {isSaving ? (
            <><Loader size={20} className="animate-spin mr-2" /> {t('userInfo_button_saving')}</>
          ) : (
            <>{t('userInfo_button_saveChanges')}</>
          )}
        </button>
      </div>

      {showCropModal && imageSrcForCropper && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="bg-slate-900 p-6 rounded-lg shadow-xl max-w-lg w-full transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modalFadeInScaleUp">
            <h3 className="text-xl leading-6 font-semibold text-white mb-5 text-center">
              {t('settings_cropImage_title')}
            </h3>
            <div className="flex justify-center mb-5">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)} 
                onComplete={(c) => setCompletedCrop(c)} 
                aspect={aspect} 
                minWidth={100}
                minHeight={100}
                circularCrop={false} 
                className="max-h-[60vh]"
              >
                <img
                  ref={imgRefForCropper} 
                  alt="Crop preview"
                  src={imageSrcForCropper} 
                  style={{ maxHeight: '60vh', objectFit: 'contain' }}
                  onLoad={onImageLoadForCropper} 
                />
              </ReactCrop>
            </div>
            {profilePicError && <p className="mb-3 text-sm text-red-500 text-center">{profilePicError}</p>}
            <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-3 bg-cyan-600 text-base font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 sm:text-sm transition-colors duration-150"
                onClick={handleCropImageAndInitiateUpload} 
                disabled={isUploadingProfilePic} 
              >
                {isUploadingProfilePic ? t('settings_cropImage_button_cropping') : t('settings_cropImage_button_crop')}
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-6 py-3 bg-slate-800 text-base font-medium text-gray-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 sm:text-sm transition-colors duration-150"
                onClick={handleCancelProfilePicUpdateAndCloseModal} 
                disabled={isUploadingProfilePic} 
              >
                {t('settings_cropImage_button_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes modalFadeInScaleUp {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modalFadeInScaleUp {
          animation: modalFadeInScaleUp 0.3s forwards ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserInformationContent;