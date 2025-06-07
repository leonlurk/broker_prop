import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Calendar, ArrowLeft, Save, Loader, AlertTriangle, Phone, Camera } from 'lucide-react';
import { auth, db, storage } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { getTranslator } from '../utils/i18n';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import styles from './UserInformationContent.module.css';

const fieldStyle = {
  background: 'rgba(44,44,44,0.95)',
  border: '1.5px solid #3C3C3C',
  outline: 'none',
  color: '#fff',
  fontSize: 16,
  paddingLeft: 20,
  width: '100%',
  height: 40,
  borderRadius: 20,
  fontFamily: 'Poppins',
  fontWeight: 400,
  boxSizing: 'border-box',
  marginTop: 2,
  marginBottom: 2,
  transition: 'border 0.2s',
};
const labelStyle = {
  fontFamily: 'Poppins',
  fontWeight: 500,
  fontSize: 15,
  color: '#fff',
  marginBottom: 2,
  marginLeft: 4,
  letterSpacing: 0.1,
};
const placeholderStyle = {
  color: 'rgba(255,255,255,0.5)',
  fontWeight: 400,
  fontFamily: 'Poppins',
  fontSize: 15,
};
const titleStyle = {
  fontFamily: 'Poppins',
  fontWeight: 600,
  fontSize: 28,
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  letterSpacing: 0.1,
};
const saveBtnStyle = {
  position: 'absolute',
  right: 23,
  top: 20,
  border: '1.5px solid #1CC4F9',
  background: 'none',
  color: '#fff',
  fontFamily: 'Poppins',
  fontSize: 15,
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 38,
  borderRadius: 19,
  padding: '0 22px',
  minWidth: 140,
  boxShadow: '0 2px 8px 0 rgba(28,196,249,0.08)',
  transition: 'box-shadow 0.2s',
};

// Lista completa de códigos internacionales de país
const codigosPaisesFull = [
  { pais: 'Afghanistan', codigo: '+93' },
  { pais: 'Albania', codigo: '+355' },
  { pais: 'Algeria', codigo: '+213' },
  { pais: 'Andorra', codigo: '+376' },
  { pais: 'Angola', codigo: '+244' },
  { pais: 'Argentina', codigo: '+54' },
  { pais: 'Armenia', codigo: '+374' },
  { pais: 'Australia', codigo: '+61' },
  { pais: 'Austria', codigo: '+43' },
  { pais: 'Azerbaijan', codigo: '+994' },
  { pais: 'Bahamas', codigo: '+1-242' },
  { pais: 'Bahrain', codigo: '+973' },
  { pais: 'Bangladesh', codigo: '+880' },
  { pais: 'Barbados', codigo: '+1-246' },
  { pais: 'Belarus', codigo: '+375' },
  { pais: 'Belgium', codigo: '+32' },
  { pais: 'Belize', codigo: '+501' },
  { pais: 'Benin', codigo: '+229' },
  { pais: 'Bhutan', codigo: '+975' },
  { pais: 'Bolivia', codigo: '+591' },
  { pais: 'Bosnia and Herzegovina', codigo: '+387' },
  { pais: 'Botswana', codigo: '+267' },
  { pais: 'Brazil', codigo: '+55' },
  { pais: 'Brunei', codigo: '+673' },
  { pais: 'Bulgaria', codigo: '+359' },
  { pais: 'Burkina Faso', codigo: '+226' },
  { pais: 'Burundi', codigo: '+257' },
  { pais: 'Cambodia', codigo: '+855' },
  { pais: 'Cameroon', codigo: '+237' },
  { pais: 'Canada', codigo: '+1' },
  { pais: 'Cape Verde', codigo: '+238' },
  { pais: 'Central African Republic', codigo: '+236' },
  { pais: 'Chad', codigo: '+235' },
  { pais: 'Chile', codigo: '+56' },
  { pais: 'China', codigo: '+86' },
  { pais: 'Colombia', codigo: '+57' },
  { pais: 'Comoros', codigo: '+269' },
  { pais: 'Congo', codigo: '+242' },
  { pais: 'Costa Rica', codigo: '+506' },
  { pais: 'Croatia', codigo: '+385' },
  { pais: 'Cuba', codigo: '+53' },
  { pais: 'Cyprus', codigo: '+357' },
  { pais: 'Czech Republic', codigo: '+420' },
  { pais: 'Denmark', codigo: '+45' },
  { pais: 'Djibouti', codigo: '+253' },
  { pais: 'Dominica', codigo: '+1-767' },
  { pais: 'Dominican Republic', codigo: '+1-809' },
  { pais: 'Ecuador', codigo: '+593' },
  { pais: 'Egypt', codigo: '+20' },
  { pais: 'El Salvador', codigo: '+503' },
  { pais: 'Equatorial Guinea', codigo: '+240' },
  { pais: 'Eritrea', codigo: '+291' },
  { pais: 'Estonia', codigo: '+372' },
  { pais: 'Eswatini', codigo: '+268' },
  { pais: 'Ethiopia', codigo: '+251' },
  { pais: 'Fiji', codigo: '+679' },
  { pais: 'Finland', codigo: '+358' },
  { pais: 'France', codigo: '+33' },
  { pais: 'Gabon', codigo: '+241' },
  { pais: 'Gambia', codigo: '+220' },
  { pais: 'Georgia', codigo: '+995' },
  { pais: 'Germany', codigo: '+49' },
  { pais: 'Ghana', codigo: '+233' },
  { pais: 'Greece', codigo: '+30' },
  { pais: 'Grenada', codigo: '+1-473' },
  { pais: 'Guatemala', codigo: '+502' },
  { pais: 'Guinea', codigo: '+224' },
  { pais: 'Guinea-Bissau', codigo: '+245' },
  { pais: 'Guyana', codigo: '+592' },
  { pais: 'Haiti', codigo: '+509' },
  { pais: 'Honduras', codigo: '+504' },
  { pais: 'Hungary', codigo: '+36' },
  { pais: 'Iceland', codigo: '+354' },
  { pais: 'India', codigo: '+91' },
  { pais: 'Indonesia', codigo: '+62' },
  { pais: 'Iran', codigo: '+98' },
  { pais: 'Iraq', codigo: '+964' },
  { pais: 'Ireland', codigo: '+353' },
  { pais: 'Israel', codigo: '+972' },
  { pais: 'Italy', codigo: '+39' },
  { pais: 'Jamaica', codigo: '+1-876' },
  { pais: 'Japan', codigo: '+81' },
  { pais: 'Jordan', codigo: '+962' },
  { pais: 'Kazakhstan', codigo: '+7' },
  { pais: 'Kenya', codigo: '+254' },
  { pais: 'Kiribati', codigo: '+686' },
  { pais: 'Kuwait', codigo: '+965' },
  { pais: 'Kyrgyzstan', codigo: '+996' },
  { pais: 'Laos', codigo: '+856' },
  { pais: 'Latvia', codigo: '+371' },
  { pais: 'Lebanon', codigo: '+961' },
  { pais: 'Lesotho', codigo: '+266' },
  { pais: 'Liberia', codigo: '+231' },
  { pais: 'Libya', codigo: '+218' },
  { pais: 'Liechtenstein', codigo: '+423' },
  { pais: 'Lithuania', codigo: '+370' },
  { pais: 'Luxembourg', codigo: '+352' },
  { pais: 'Madagascar', codigo: '+261' },
  { pais: 'Malawi', codigo: '+265' },
  { pais: 'Malaysia', codigo: '+60' },
  { pais: 'Maldives', codigo: '+960' },
  { pais: 'Mali', codigo: '+223' },
  { pais: 'Malta', codigo: '+356' },
  { pais: 'Marshall Islands', codigo: '+692' },
  { pais: 'Mauritania', codigo: '+222' },
  { pais: 'Mauritius', codigo: '+230' },
  { pais: 'Mexico', codigo: '+52' },
  { pais: 'Micronesia', codigo: '+691' },
  { pais: 'Moldova', codigo: '+373' },
  { pais: 'Monaco', codigo: '+377' },
  { pais: 'Mongolia', codigo: '+976' },
  { pais: 'Montenegro', codigo: '+382' },
  { pais: 'Morocco', codigo: '+212' },
  { pais: 'Mozambique', codigo: '+258' },
  { pais: 'Myanmar', codigo: '+95' },
  { pais: 'Namibia', codigo: '+264' },
  { pais: 'Nauru', codigo: '+674' },
  { pais: 'Nepal', codigo: '+977' },
  { pais: 'Netherlands', codigo: '+31' },
  { pais: 'New Zealand', codigo: '+64' },
  { pais: 'Nicaragua', codigo: '+505' },
  { pais: 'Niger', codigo: '+227' },
  { pais: 'Nigeria', codigo: '+234' },
  { pais: 'North Korea', codigo: '+850' },
  { pais: 'North Macedonia', codigo: '+389' },
  { pais: 'Norway', codigo: '+47' },
  { pais: 'Oman', codigo: '+968' },
  { pais: 'Pakistan', codigo: '+92' },
  { pais: 'Palau', codigo: '+680' },
  { pais: 'Palestine', codigo: '+970' },
  { pais: 'Panama', codigo: '+507' },
  { pais: 'Papua New Guinea', codigo: '+675' },
  { pais: 'Paraguay', codigo: '+595' },
  { pais: 'Peru', codigo: '+51' },
  { pais: 'Philippines', codigo: '+63' },
  { pais: 'Poland', codigo: '+48' },
  { pais: 'Portugal', codigo: '+351' },
  { pais: 'Qatar', codigo: '+974' },
  { pais: 'Romania', codigo: '+40' },
  { pais: 'Russia', codigo: '+7' },
  { pais: 'Rwanda', codigo: '+250' },
  { pais: 'Saint Kitts and Nevis', codigo: '+1-869' },
  { pais: 'Saint Lucia', codigo: '+1-758' },
  { pais: 'Saint Vincent and the Grenadines', codigo: '+1-784' },
  { pais: 'Samoa', codigo: '+685' },
  { pais: 'San Marino', codigo: '+378' },
  { pais: 'Sao Tome and Principe', codigo: '+239' },
  { pais: 'Saudi Arabia', codigo: '+966' },
  { pais: 'Senegal', codigo: '+221' },
  { pais: 'Serbia', codigo: '+381' },
  { pais: 'Seychelles', codigo: '+248' },
  { pais: 'Sierra Leone', codigo: '+232' },
  { pais: 'Singapore', codigo: '+65' },
  { pais: 'Slovakia', codigo: '+421' },
  { pais: 'Slovenia', codigo: '+386' },
  { pais: 'Solomon Islands', codigo: '+677' },
  { pais: 'Somalia', codigo: '+252' },
  { pais: 'South Africa', codigo: '+27' },
  { pais: 'South Korea', codigo: '+82' },
  { pais: 'South Sudan', codigo: '+211' },
  { pais: 'Spain', codigo: '+34' },
  { pais: 'Sri Lanka', codigo: '+94' },
  { pais: 'Sudan', codigo: '+249' },
  { pais: 'Suriname', codigo: '+597' },
  { pais: 'Sweden', codigo: '+46' },
  { pais: 'Switzerland', codigo: '+41' },
  { pais: 'Syria', codigo: '+963' },
  { pais: 'Taiwan', codigo: '+886' },
  { pais: 'Tajikistan', codigo: '+992' },
  { pais: 'Tanzania', codigo: '+255' },
  { pais: 'Thailand', codigo: '+66' },
  { pais: 'Togo', codigo: '+228' },
  { pais: 'Tonga', codigo: '+676' },
  { pais: 'Trinidad and Tobago', codigo: '+1-868' },
  { pais: 'Tunisia', codigo: '+216' },
  { pais: 'Turkey', codigo: '+90' },
  { pais: 'Turkmenistan', codigo: '+993' },
  { pais: 'Tuvalu', codigo: '+688' },
  { pais: 'Uganda', codigo: '+256' },
  { pais: 'Ukraine', codigo: '+380' },
  { pais: 'United Arab Emirates', codigo: '+971' },
  { pais: 'United Kingdom', codigo: '+44' },
  { pais: 'United States', codigo: '+1' },
  { pais: 'Uruguay', codigo: '+598' },
  { pais: 'Uzbekistan', codigo: '+998' },
  { pais: 'Vanuatu', codigo: '+678' },
  { pais: 'Vatican City', codigo: '+39' },
  { pais: 'Venezuela', codigo: '+58' },
  { pais: 'Vietnam', codigo: '+84' },
  { pais: 'Yemen', codigo: '+967' },
  { pais: 'Zambia', codigo: '+260' },
  { pais: 'Zimbabwe', codigo: '+263' },
];

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
              const codigoEncontrado = codigosPaisesFull.find(cp => 
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
    <div className={styles.container}>
      {/* Botón volver tipo dashboard - arriba del contenedor interno */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center mb-2 sm:mb-4">
          <button
            onClick={onBack}
            className="text-white bg-[#2c2c2c] hover:bg-[#252525] rounded-full p-1.5 sm:p-2 border border-cyan-500 focus:outline-none transition-colors"
            aria-label={t('common_back')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-2xl w-full flex flex-col gap-6 relative bg-opacity-90 mb-4 md:mb-6">
        {/* Header: Título */}
        <div className="mt-2 md:mt-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-white text-left">{t('userInfo_title')}</h2>
        </div>
        
        {/* Contenedor principal responsive */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Foto de perfil - Side en desktop, top en mobile */}
          <div className="flex flex-col items-center lg:items-start lg:w-auto">
            <div className="relative mb-4 lg:mb-0">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Foto de perfil"
                  className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full object-cover border border-[#3C3C3C] shadow-lg"
                  style={{ boxShadow: 'inset 0px 4px 4px rgba(0, 0, 0, 0.5)' }}
                />
              ) : (
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border border-[#3C3C3C] shadow-lg flex items-center justify-center text-white font-semibold text-2xl sm:text-3xl lg:text-4xl uppercase"
                  style={{ 
                    background: 'linear-gradient(122.63deg, #222222 0%, #353535 100%)',
                    boxShadow: 'inset 0px 4px 4px rgba(0, 0, 0, 0.5)' 
                  }}
                >
                  {currentUser?.email?.charAt(0) || 'U'}
                </div>
              )}
              <button
                type="button"
                className="absolute bottom-0 right-0 w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full border border-[#3C3C3C] flex items-center justify-center hover:bg-gray-800/50 transition"
                style={{ 
                  background: 'transparent'
                }}
                onClick={() => document.getElementById('profilePicInputUserInfo').click()}
                aria-label={t('userInfo_button_changePhoto')}
              >
                <Camera size={32} className="text-white" />
              </button>
              <input
                id="profilePicInputUserInfo"
                name="profilePicInputUserInfo"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* Formulario responsive */}
          <div className="flex-1">
            {/* Grid responsive para campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="block text-white text-sm sm:text-base font-medium">
                  {t('userInfo_label_firstName')}
                </label>
            <input 
              type="text" 
              id="nombre" 
              value={nombre}
                  onChange={e => setNombre(e.target.value)}
              placeholder={t('userInfo_placeholder_firstName')}
                  className="w-full h-12 sm:h-14 px-4 sm:px-5 text-white text-sm sm:text-base font-normal font-['Poppins'] border border-[#3C3C3C] rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-white/50"
                  style={{ 
                    background: 'linear-gradient(122.63deg, rgba(34, 34, 34, 0.5) 0%, rgba(53, 53, 53, 0.5) 100%)'
                  }}
            />
          </div>

              {/* Apellido */}
              <div className="space-y-2">
                <label className="block text-white text-sm sm:text-base font-medium">
                  {t('userInfo_label_lastName')}
                </label>
            <input 
              type="text" 
              id="apellido" 
              value={apellido}
                  onChange={e => setApellido(e.target.value)}
              placeholder={t('userInfo_placeholder_lastName')}
                  className="w-full h-12 sm:h-14 px-4 sm:px-5 text-white text-sm sm:text-base font-normal font-['Poppins'] border border-[#3C3C3C] rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-white/50"
                  style={{ 
                    background: 'linear-gradient(122.63deg, rgba(34, 34, 34, 0.5) 0%, rgba(53, 53, 53, 0.5) 100%)'
                  }}
            />
        </div>

              {/* Fecha de nacimiento */}
              <div className="space-y-2">
                <label className="block text-white text-sm sm:text-base font-medium">
                  {t('userInfo_label_dob')}
                </label>
          <div className="relative">
                  <input
                    type="text"
                    id="fechaNacimiento"
                    value={fechaNacimiento}
              onClick={() => setShowCalendar(!showCalendar)} 
                    placeholder={t('userInfo_placeholder_dob')}
                    className="w-full h-12 sm:h-14 px-4 sm:px-5 pr-12 text-white text-sm sm:text-base font-normal font-['Poppins'] border border-[#3C3C3C] rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-white/50 cursor-pointer"
                    style={{ 
                      background: 'linear-gradient(122.63deg, rgba(34, 34, 34, 0.5) 0%, rgba(53, 53, 53, 0.5) 100%)'
                    }}
                    readOnly
                  />
                  <Calendar size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] pointer-events-none" />
            {showCalendar && renderCalendar()}
          </div>
              </div>

              {/* Género */}
              <div className="space-y-2">
                <label className="block text-white text-sm sm:text-base font-medium">
                  {t('userInfo_label_gender')}
                </label>
                <div className="relative">
            <select 
              id="genero" 
              value={genero} 
                    onChange={e => setGenero(e.target.value)}
                    className="w-full h-12 sm:h-14 px-4 sm:px-5 pr-12 text-white text-sm sm:text-base font-normal font-['Poppins'] border border-[#3C3C3C] rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
                    style={{ 
                      background: 'linear-gradient(122.63deg, rgba(34, 34, 34, 0.5) 0%, rgba(53, 53, 53, 0.5) 100%)'
                    }}
            >
                    <option value="" className="text-white/50">{t('userInfo_placeholder_gender')}</option>
              <option value="masculino">{t('gender_male')}</option>
              <option value="femenino">{t('gender_female')}</option>
              <option value="otro">{t('gender_other')}</option>
              <option value="prefiero_no_decirlo">{t('gender_preferNotToSay')}</option>
            </select>
                  <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] pointer-events-none" />
          </div>
        </div>

              {/* País */}
              <div className="space-y-2">
                <label className="block text-white text-sm sm:text-base font-medium">
                  {t('userInfo_label_country')}
                </label>
                <div className="relative">
            <select 
              id="pais" 
              value={paisSeleccionado} 
              onChange={e => {
                setPaisSeleccionado(e.target.value);
                // Lógica existente para actualizar código de país
                const normalize = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                const selected = e.target.value;
                let codeObj = codigosPaisesFull.find(cp => normalize(cp.pais) === normalize(selected));
                if (!codeObj) {
                  codeObj = codigosPaisesFull.find(cp => normalize(selected).includes(normalize(cp.pais)) || normalize(cp.pais).includes(normalize(selected)));
                }
                if (!codeObj) {
                  const clean = s => normalize(s).replace(/(republic|federation|state|states|kingdom|democratic|people|islamic|arab|of|the|and|union|united|plurinational|bolivarian|province|provinces|city|country|nation|territory|islands|island|coast|north|south|east|west|central|new|old|great|little|upper|lower|mount|saint|st|sao|san|santa|la|el|los|las|le|les|de|del|da|do|das|du|di|al|el|a|o|u|i|e|y|z|x|c|d|b|g|h|j|k|l|m|n|p|q|r|s|t|v|w|z|\s+)/g, '');
                  codeObj = codigosPaisesFull.find(cp => clean(cp.pais) === clean(selected));
                }
                if (!codeObj) {
                  codeObj = codigosPaisesFull.find(cp => cp.pais_en && normalize(cp.pais_en) === normalize(selected));
                }
                setCodigoPais(codeObj ? codeObj.codigo : '');
              }}
              className="w-full h-12 sm:h-14 px-4 sm:px-5 pr-12 text-white text-sm sm:text-base font-normal font-['Poppins'] border border-[#3C3C3C] rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
              style={{ 
                background: 'linear-gradient(122.63deg, rgba(34, 34, 34, 0.5) 0%, rgba(53, 53, 53, 0.5) 100%)'
              }}
              disabled={cargandoPaises}
            >
              <option value="" className="text-white/50">{cargandoPaises ? t('userInfo_loading_countries') : t('userInfo_placeholder_country')}</option>
              {paises.map(pais => (
                <option key={pais.nombre} value={pais.nombre}>{pais.nombre}</option>
              ))}
            </select>
                  <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] pointer-events-none" />
          </div>
              </div>

              {/* Ciudad */}
              <div className="space-y-2">
                <label className="block text-white text-sm sm:text-base font-medium">
                  {t('userInfo_label_city')}
                </label>
                <div className="relative">
            <select 
              id="ciudad" 
              value={ciudadSeleccionada} 
              onChange={e => setCiudadSeleccionada(e.target.value)}
              className="w-full h-12 sm:h-14 px-4 sm:px-5 pr-12 text-white text-sm sm:text-base font-normal font-['Poppins'] border border-[#3C3C3C] rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
              style={{ 
                background: 'linear-gradient(122.63deg, rgba(34, 34, 34, 0.5) 0%, rgba(53, 53, 53, 0.5) 100%)'
              }}
              disabled={cargandoCiudades || !paisSeleccionado}
            >
              <option value="" className="text-white/50">
                {cargandoCiudades ? t('userInfo_loading_cities') || 'Cargando ciudades...' : 
                 !paisSeleccionado ? 'Selecciona un país primero' : t('userInfo_placeholder_city')}
              </option>
              {ciudades.map(ciudad => (
                <option key={ciudad} value={ciudad}>{ciudad}</option>
              ))}
            </select>
                  <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] pointer-events-none" />
          </div>
        </div>

              {/* Teléfono - Span completo en mobile, individual en desktop */}
              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <label className="block text-white text-sm sm:text-base font-medium">
                  {t('userInfo_label_phone')}
                </label>
                <div className="flex h-12 sm:h-14">
                  {/* Código de país */}
                  <div className="flex items-center px-3 sm:px-4 border border-r-0 border-[#3C3C3C] rounded-l-full text-white text-sm sm:text-base font-normal font-['Poppins'] min-w-[70px] sm:min-w-[80px] justify-center"
                       style={{ 
                         background: 'linear-gradient(122.63deg, rgba(34, 34, 34, 0.5) 0%, rgba(53, 53, 53, 0.5) 100%)'
                       }}>
                    {codigoPais || '+54'}
                  </div>
                  {/* Número de teléfono */}
            <input 
              type="tel" 
              id="telefono" 
              value={numeroTelefono}
              onChange={handlePhoneChange}
              placeholder={t('userInfo_placeholder_phoneNumber')}
                    className="flex-1 h-full px-3 sm:px-4 text-white text-sm sm:text-base font-normal font-['Poppins'] border border-l-0 border-[#3C3C3C] rounded-r-full focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-white/50"
                    style={{ 
                      background: 'linear-gradient(122.63deg, rgba(34, 34, 34, 0.5) 0%, rgba(53, 53, 53, 0.5) 100%)'
                    }}
            />
          </div>
        </div>
                    </div>

            {/* Botón Guardar - Full width en mobile, auto en desktop */}
            <div className="mt-6 lg:mt-8">
                <button
                    type="button"
                onClick={handleSaveChanges}
                className="w-full lg:w-auto lg:min-w-[200px] h-12 sm:h-14 border border-[#1CC4F9] rounded-full text-white text-sm sm:text-base font-medium font-['Poppins'] hover:bg-cyan-900/20 transition flex items-center justify-center gap-2 px-6"
                style={{ 
                  background: 'linear-gradient(122.63deg, rgba(34, 34, 34, 0.5) 0%, rgba(53, 53, 53, 0.5) 100%)'
                }}
                disabled={isSaving}
                >
                {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                {t('userInfo_button_saveChanges')}
                </button>
            </div>
            </div>
        </div>

        {/* Mensajes de error y éxito */}
        {saveError && (
          <div className="mt-6 bg-red-500 bg-opacity-10 text-red-500 rounded-lg px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 text-sm sm:text-base">
            <AlertTriangle size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}
        {saveSuccess && (
          <div className="mt-6 bg-green-500 bg-opacity-10 text-green-500 rounded-lg px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 text-sm sm:text-base">
            <Save size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
            <span>{t('userInfo_success_saved')}</span>
          </div>
        )}
        
        {/* Crop modal responsive */}
      {showCropModal && imageSrcForCropper && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out" style={{ backdropFilter: 'blur(4px)' }}>
            <div className="bg-slate-900 p-4 sm:p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg sm:text-xl leading-6 font-semibold text-white mb-4 sm:mb-5 text-center">
              {t('settings_cropImage_title')}
            </h3>
              <div className="flex justify-center mb-4 sm:mb-5">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)} 
                  onComplete={c => setCompletedCrop(c)}
                aspect={aspect} 
                minWidth={100}
                minHeight={100}
                circularCrop={false} 
                  className="max-h-[50vh] sm:max-h-[60vh]"
              >
                <img
                  ref={imgRefForCropper} 
                  alt="Crop preview"
                  src={imageSrcForCropper} 
                    style={{ maxHeight: '50vh', objectFit: 'contain' }}
                    className="sm:max-h-[60vh]"
                  onLoad={onImageLoadForCropper} 
                />
              </ReactCrop>
            </div>
              {profilePicError && <p className="mb-3 text-xs sm:text-sm text-red-500 text-center">{profilePicError}</p>}
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 sm:px-6 py-2 sm:py-3 bg-cyan-600 text-sm sm:text-base font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-colors duration-150"
                onClick={handleCropImageAndInitiateUpload} 
                disabled={isUploadingProfilePic} 
              >
                {isUploadingProfilePic ? t('settings_cropImage_button_cropping') : t('settings_cropImage_button_crop')}
              </button>
              <button
                type="button"
                  className="w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 sm:px-6 py-2 sm:py-3 bg-slate-800 text-sm sm:text-base font-medium text-gray-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-colors duration-150"
                onClick={handleCancelProfilePicUpdateAndCloseModal} 
                disabled={isUploadingProfilePic} 
              >
                {t('settings_cropImage_button_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default UserInformationContent;