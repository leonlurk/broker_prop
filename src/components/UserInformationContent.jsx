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

const fallbackUserPhoto = 'https://randomuser.me/api/portraits/men/1.jpg';

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
    <div style={{ position: 'absolute', width: '100%', maxWidth: 1200, left: 0, top: 20, marginLeft: 337, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)' }} className="bg-gradient-to-br from-[#232323] to-[#2d2d2d] border border-[#333] rounded-2xl p-4 md:p-6 mb-4 md:mb-6 w-full flex flex-col gap-6 relative bg-opacity-90">
      {/* Botón volver tipo dashboard */}
      <button
        type="button"
        onClick={onBack}
        className="absolute top-8 left-8 z-20 flex items-center justify-center w-14 h-14 rounded-full border border-cyan-400 bg-[#232323] text-white hover:bg-cyan-900/20 transition shadow-lg"
        style={{ boxShadow: '0 2px 8px 0 rgba(28,196,249,0.08)' }}
        aria-label={t('common_back')}
      >
        <ChevronDown style={{ transform: 'rotate(90deg)' }} size={36} className="text-cyan-400" />
      </button>
      {/* Header: Título */}
      <div className="mt-[100px] mb-6">
        <h2 className="text-3xl font-semibold text-white text-left">{t('userInfo_title')}</h2>
      </div>
      {/* Foto de perfil y formulario */}
      <div className="flex flex-row gap-8 items-start w-full">
        {/* Foto de perfil */}
        <div className="flex flex-col items-center justify-start pt-2">
          <div className="relative">
            <img
              src={profileImageUrl || fallbackUserPhoto}
              alt="Foto de perfil"
              className="w-28 h-28 rounded-full object-cover border-4 border-[#232323] shadow-md"
            />
            <button
              type="button"
              className="absolute bottom-2 right-2 bg-[#232323] border border-cyan-400 rounded-full p-2 flex items-center justify-center hover:bg-cyan-900/30 transition"
              onClick={() => document.getElementById('profilePicInputUserInfo').click()}
              aria-label={t('userInfo_button_changePhoto')}
            >
              <Camera size={20} className="text-cyan-400" />
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
        {/* Formulario */}
        <form className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8" autoComplete="off" onSubmit={e => { e.preventDefault(); handleSaveChanges(); }}>
          {/* Nombre */}
          <div>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder={t('userInfo_placeholder_firstName')}
              className="bg-[#232323]/80 border border-[#444] rounded-[28px] px-6 h-14 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 w-full"
            />
          </div>
          {/* Apellido */}
          <div>
            <input
              type="text"
              id="apellido"
              value={apellido}
              onChange={e => setApellido(e.target.value)}
              placeholder={t('userInfo_placeholder_lastName')}
              className="bg-[#232323]/80 border border-[#444] rounded-[28px] px-6 h-14 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 w-full"
            />
          </div>
          {/* Fecha de nacimiento */}
          <div>
            <div className="relative">
              <input
                type="text"
                id="fechaNacimiento"
                value={fechaNacimiento}
                onClick={() => setShowCalendar(!showCalendar)}
                placeholder={t('userInfo_placeholder_dob')}
                className="bg-[#232323]/80 border border-[#444] rounded-[28px] px-6 h-14 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 pr-10 cursor-pointer w-full"
                readOnly
              />
              <Calendar size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {showCalendar && renderCalendar()}
          </div>
          {/* Género */}
          <div className="relative">
            <select
              id="genero"
              value={genero}
              onChange={e => setGenero(e.target.value)}
              className="bg-[#232323]/80 border border-[#444] rounded-[28px] px-6 h-14 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 w-full appearance-none"
            >
              <option value="" className="text-gray-500">{t('userInfo_placeholder_gender')}</option>
              <option value="masculino">{t('gender_male')}</option>
              <option value="femenino">{t('gender_female')}</option>
              <option value="otro">{t('gender_other')}</option>
              <option value="prefiero_no_decirlo">{t('gender_preferNotToSay')}</option>
            </select>
            <ChevronDown size={24} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" style={{paddingRight: 5}} />
          </div>
          {/* País */}
          <div className="relative">
            <select
              id="pais"
              value={paisSeleccionado}
              onChange={e => {
                setPaisSeleccionado(e.target.value);
                // Buscar el código del país seleccionado y actualizar codigoPais
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
              className="bg-[#232323]/80 border border-[#444] rounded-[28px] px-6 h-14 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 w-full appearance-none"
              disabled={cargandoPaises}
            >
              <option value="" className="text-gray-500">{cargandoPaises ? t('userInfo_loading_countries') : t('userInfo_placeholder_country')}</option>
              {paises.map(pais => (
                <option key={pais.nombre} value={pais.nombre}>{pais.nombre}</option>
              ))}
            </select>
            <ChevronDown size={24} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" style={{paddingRight: 5}} />
          </div>
          {/* Ciudad */}
          <div className="relative">
            <select
              id="ciudad"
              value={ciudadSeleccionada}
              onChange={e => setCiudadSeleccionada(e.target.value)}
              className="bg-[#232323]/80 border border-[#444] rounded-[28px] px-6 h-14 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 w-full appearance-none"
              disabled={cargandoCiudades || !paisSeleccionado}
            >
              <option value="" className="text-gray-500">
                {cargandoCiudades ? t('userInfo_loading_cities') :
                  (ciudades.length === 0 && paisSeleccionado ? t('userInfo_noCitiesAvailable') : t('userInfo_placeholder_city'))}
              </option>
              {ciudades.map(ciudad => (
                <option key={ciudad} value={ciudad}>{ciudad}</option>
              ))}
            </select>
            <ChevronDown size={24} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" style={{paddingRight: 5}} />
          </div>
          {/* Teléfono */}
          <div className="flex flex-row items-center w-full">
            {codigoPais && (
              <span className="bg-[#232323]/80 border border-[#444] rounded-l-[28px] px-5 h-14 flex items-center text-white text-base select-none" style={{ borderRight: 'none' }}>{codigoPais}</span>
            )}
            <input
              type="tel"
              id="telefono"
              value={numeroTelefono}
              onChange={handlePhoneChange}
              placeholder={t('userInfo_placeholder_phoneNumber')}
              className={`bg-[#232323]/80 border border-[#444] ${codigoPais ? 'rounded-r-[28px]' : 'rounded-[28px]'} px-6 h-14 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 w-full`}
              style={codigoPais ? { borderLeft: 'none' } : {}}
            />
          </div>
          <div className="flex items-end w-full mt-0">
            <button
              type="button"
              onClick={handleSaveChanges}
              className="w-full border border-cyan-400 rounded-[28px] px-10 h-14 text-white font-medium bg-transparent hover:bg-cyan-900/20 transition whitespace-nowrap flex items-center justify-center gap-2 text-lg"
              disabled={isSaving}
            >
              {isSaving ? <Loader size={20} className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
              {t('userInfo_button_saveChanges')}
            </button>
          </div>
        </form>
      </div>
      {/* Mensajes de error y éxito */}
      {saveError && (
        <div className="mt-6 bg-red-500 bg-opacity-10 text-red-500 rounded-lg px-6 py-4 flex items-center gap-2">
          <AlertTriangle size={20} />
          <span>{saveError}</span>
        </div>
      )}
      {saveSuccess && (
        <div className="mt-6 bg-green-500 bg-opacity-10 text-green-500 rounded-lg px-6 py-4 flex items-center gap-2">
          <Save size={20} />
          <span>{t('userInfo_success_saved')}</span>
        </div>
      )}
      {/* Crop modal igual que antes si es necesario */}
      {showCropModal && imageSrcForCropper && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="bg-slate-900 p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-xl leading-6 font-semibold text-white mb-5 text-center">
              {t('settings_cropImage_title')}
            </h3>
            <div className="flex justify-center mb-5">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={c => setCompletedCrop(c)}
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
    </div>
  );
};

export default UserInformationContent;