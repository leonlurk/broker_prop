import axios from 'axios';

// Configuración específica para navegadores con certificados auto-firmados
const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 30000, // 30 segundos timeout
    validateStatus: function (status) {
      return status >= 200 && status < 300; // default
    },
  });

  // Interceptor de respuesta para manejar errores SSL/certificados
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.code === 'CERT_HAS_EXPIRED' || 
          error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
          error.message?.includes('certificate')) {
        console.warn('Certificado SSL auto-firmado detectado, continuando...');
        // En producción, aquí deberías implementar una validación más robusta
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default createAxiosInstance; 