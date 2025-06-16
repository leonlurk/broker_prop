/**
 * 🔍 Validador de Configuración HTTPS
 * Asegura que toda la configuración de la aplicación use HTTPS
 * y que todas las variables de entorno estén correctamente configuradas
 */

// 🌐 Validar URL de API
export const validateApiUrl = (url) => {
  if (!url) {
    console.warn('⚠️ VITE_MT5_API_URL no está configurada');
    return false;
  }
  
  if (!url.startsWith('https://')) {
    console.error('🚨 SECURITY WARNING: API URL debe usar HTTPS:', url);
    return false;
  }
  
  return true;
};

// 🔐 Validar configuración de Firebase
export const validateFirebaseConfig = () => {
  const requiredEnvs = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missing = requiredEnvs.filter(env => !import.meta.env[env]);
  
  if (missing.length > 0) {
    console.error('❌ Variables de entorno Firebase faltantes:', missing);
    return false;
  }
  
  // Validar que el auth domain use HTTPS
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  if (authDomain && !authDomain.includes('firebaseapp.com') && !authDomain.startsWith('https://')) {
    console.warn('⚠️ Firebase Auth Domain debería usar HTTPS');
  }
  
  console.log('✅ Configuración Firebase válida');
  return true;
};

// 🛡️ Verificar headers de seguridad
export const checkSecurityHeaders = async (url = import.meta.env.VITE_MT5_API_URL) => {
  if (!url) return false;
  
  try {
    const response = await fetch(`${url}/`, { method: 'HEAD' });
    const headers = response.headers;
    
    const securityHeaders = {
      'strict-transport-security': headers.get('strict-transport-security'),
      'x-content-type-options': headers.get('x-content-type-options'),
      'x-frame-options': headers.get('x-frame-options'),
      'x-xss-protection': headers.get('x-xss-protection')
    };
    
    const missingHeaders = Object.entries(securityHeaders)
      .filter(([header, value]) => !value)
      .map(([header]) => header);
    
    if (missingHeaders.length > 0) {
      console.warn('⚠️ Headers de seguridad faltantes:', missingHeaders);
    } else {
      console.log('✅ Headers de seguridad presentes');
    }
    
    return {
      hasSecurityHeaders: missingHeaders.length === 0,
      securityHeaders,
      missingHeaders
    };
  } catch (error) {
    console.error('❌ Error verificando headers de seguridad:', error);
    return false;
  }
};

// 🔧 Validación completa del sistema
export const validateCompleteConfig = async () => {
  console.log('🔍 Iniciando validación completa de configuración...');
  
  const results = {
    apiUrl: false,
    firebase: false,
    security: false,
    environment: import.meta.env.MODE
  };
  
  // 1. Validar URL de API
  results.apiUrl = validateApiUrl(import.meta.env.VITE_MT5_API_URL);
  
  // 2. Validar Firebase
  results.firebase = validateFirebaseConfig();
  
  // 3. Verificar headers de seguridad (solo en producción)
  if (import.meta.env.MODE === 'production') {
    results.security = await checkSecurityHeaders();
  } else {
    results.security = true; // Skip en desarrollo
  }
  
  // 4. Resumen
  const isValid = results.apiUrl && results.firebase && results.security;
  
  if (isValid) {
    console.log('✅ Configuración completa válida');
  } else {
    console.error('❌ Configuración tiene errores. Revisa los logs anteriores.');
  }
  
  return {
    isValid,
    results
  };
};

// 🚨 Forzar HTTPS en todas las URLs
export const enforceHttps = (url) => {
  if (!url) return url;
  
  if (url.startsWith('http://')) {
    const httpsUrl = url.replace('http://', 'https://');
    console.warn(`🔄 Convirtiendo a HTTPS: ${url} → ${httpsUrl}`);
    return httpsUrl;
  }
  
  return url;
};

// 📊 Obtener información del entorno
export const getEnvironmentInfo = () => {
  return {
    mode: import.meta.env.MODE,
    apiUrl: import.meta.env.VITE_MT5_API_URL,
    environment: import.meta.env.VITE_ENVIRONMENT,
    apiVersion: import.meta.env.VITE_API_VERSION,
    isProduction: import.meta.env.MODE === 'production',
    isDevelopment: import.meta.env.MODE === 'development',
    firebaseProject: import.meta.env.VITE_FIREBASE_PROJECT_ID
  };
};

// 🔄 Auto-validación en inicialización
export const initializeConfigValidation = async () => {
  console.log('🚀 Inicializando validación de configuración...');
  
  const envInfo = getEnvironmentInfo();
  console.log('📊 Información del entorno:', envInfo);
  
  const validation = await validateCompleteConfig();
  
  if (!validation.isValid && envInfo.isProduction) {
    console.error('🚨 CONFIGURACIÓN INVÁLIDA EN PRODUCCIÓN - La aplicación puede no funcionar correctamente');
  }
  
  return validation;
};

export default {
  validateApiUrl,
  validateFirebaseConfig,
  checkSecurityHeaders,
  validateCompleteConfig,
  enforceHttps,
  getEnvironmentInfo,
  initializeConfigValidation
}; 