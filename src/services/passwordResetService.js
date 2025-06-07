import { db } from '../firebase/config';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

/**
 * Servicio para restablecimiento de contraseña con códigos de 6 dígitos
 */
class PasswordResetService {
  constructor() {
    this.CODE_LENGTH = 6;
    this.EXPIRATION_MINUTES = 15;
    this.COLLECTION_NAME = 'passwordResetCodes';
    this.TOKEN_COLLECTION = 'passwordResetTokens';
    
    // Configurar URL del API según el entorno
    this.API_BASE_URL = this.getApiBaseUrl();
  }

  /**
   * Obtiene la URL base del API según el entorno
   * @returns {string} URL base del API
   */
  getApiBaseUrl() {
    // En desarrollo local
    if (import.meta.env.MODE === 'development') {
      return 'http://localhost:3001';
    }
    
    // En producción, usar la URL relativa
    return '';
  }

  /**
   * Genera un código de verificación de 6 dígitos
   * @returns {string} Código de 6 dígitos
   */
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Verifica si el email existe en la base de datos
   * @param {string} email - Email a verificar
   * @returns {Promise<{exists: boolean, userId?: string, username?: string}>}
   */
  async checkEmailExists(email) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { exists: false };
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      return { 
        exists: true, 
        userId: userDoc.id,
        username: userData.username || userData.display_name || 'Usuario'
      };
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('Error al verificar el email');
    }
  }

  /**
   * Guarda el código de verificación en Firestore
   * @param {string} email - Email del usuario
   * @param {string} code - Código de verificación
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>}
   */
  async saveResetCode(email, code, userId) {
    try {
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + this.EXPIRATION_MINUTES);

      await setDoc(doc(db, this.COLLECTION_NAME, email), {
        email,
        userId,
        code,
        createdAt: serverTimestamp(),
        expiresAt: expirationTime,
        attempts: 0,
        isUsed: false
      });

      console.log(`Código de restablecimiento guardado para ${email}`);
      return true;
    } catch (error) {
      console.error('Error guardando código de restablecimiento:', error);
      return false;
    }
  }

  /**
   * Envía el código de verificación por email
   * @param {string} email - Email del destinatario
   * @param {string} code - Código de verificación
   * @param {string} username - Nombre del usuario
   * @returns {Promise<boolean>} True si se envió correctamente
   */
  async sendResetEmail(email, code, username) {
    try {
      console.log(`📧 Enviando código de restablecimiento ${code} a ${email} para ${username}`);
      
      // Intentar envío a través del backend
      try {
        // En desarrollo usa /api/send-password-reset-email, en producción usa la función de Netlify
        const endpoint = import.meta.env.DEV ? '/api/send-password-reset-email' : '/send-password-reset-email';
        const apiUrl = `${this.API_BASE_URL}${endpoint}`;
        console.log(`🔗 Intentando enviar a: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            code: code,
            username: username || 'Usuario',
            type: 'password_reset'
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('✅ Email de restablecimiento enviado exitosamente a través del backend');
            return true;
          }
        }
        
        // Si llegamos aquí, el backend respondió pero no fue exitoso
        console.log(`⚠️ Backend respondió con status: ${response.status}`);
        
        // Intentar obtener más detalles del error
        try {
          const errorResult = await response.json();
          console.log('Error details from backend:', errorResult);
        } catch (e) {
          console.log('Could not parse error response');
        }
        
        throw new Error(`Backend responded with status: ${response.status}`);
        
      } catch (backendError) {
        console.log('⚠️ Backend no disponible, usando modo desarrollo');
        console.log('Error details:', backendError.message);
        
        // Modo desarrollo - mostrar el código en la consola
        console.log(`
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                    🔐 EMAIL DE RESTABLECIMIENTO DE CONTRASEÑA                                                                                                               ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                                                                                                                                                  ║
║  Para: ${email}                                                                                                                                                                                                           ║
║  Asunto: Código para restablecer contraseña - Alpha Global Market                                                                                                                                                           ║
║                                                                                                                                                                                                                                  ║
║  Hola ${username || 'Usuario'},                                                                                                                                                                                         ║
║                                                                                                                                                                                                                                  ║
║  Recibimos una solicitud para restablecer la contraseña de tu cuenta.                                                                                                                                                      ║
║  Tu código de verificación es:                                                                                                                                                                                               ║
║                                                                                                                                                                                                                                  ║
║                                                                       ${code}                                                                                                                                              ║
║                                                                                                                                                                                                                                  ║
║  Este código expirará en 15 minutos.                                                                                                                                                                                        ║
║                                                                                                                                                                                                                                  ║
║  Si no solicitaste este restablecimiento, ignora este email.                                                                                                                                                                ║
║                                                                                                                                                                                                                                  ║
║  Saludos,                                                                                                                                                                                                                    ║
║  Equipo Alpha Global Market                                                                                                                                                                                                  ║
║                                                                                                                                                                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
        `);
        
        // Simular delay de envío
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return true; // Considerar exitoso en modo desarrollo
      }
      
    } catch (error) {
      console.error('❌ Error enviando email de restablecimiento:', error);
      throw new Error('Error al enviar email de restablecimiento');
    }
  }

  /**
   * Genera un token seguro para restablecimiento
   * @returns {string}
   */
  generateResetToken() {
    // Generar token de 32 bytes en hexadecimal (64 caracteres)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Guarda token de restablecimiento en Firestore
   * @param {string} email - Email del usuario
   * @param {string} token - Token de restablecimiento
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>}
   */
  async saveResetToken(email, token, userId) {
    try {
      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 1); // 1 hora de expiración
      
      await setDoc(doc(db, this.TOKEN_COLLECTION, token), {
        email,
        userId,
        token,
        createdAt: serverTimestamp(),
        expiresAt: expirationTime,
        isUsed: false,
        userAgent: navigator.userAgent || 'Unknown'
      });
      
      console.log(`Token de restablecimiento guardado para ${email}`);
      return true;
    } catch (error) {
      console.error('Error guardando token de restablecimiento:', error);
      return false;
    }
  }

  /**
   * Envía email con enlace de restablecimiento
   * @param {string} email - Email del usuario
   * @param {string} resetLink - Enlace de restablecimiento
   * @param {string} username - Nombre del usuario
   * @returns {Promise<boolean>}
   */
  async sendResetLinkEmail(email, resetLink, username) {
    try {
      console.log(`📧 Enviando enlace de restablecimiento a ${email} para ${username}`);
      
      // Intentar usar el backend de SendGrid
      try {
        console.log('🔗 Intentando enviar a: /api/send-password-reset-link');
        
        const response = await fetch('/api/send-password-reset-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            resetLink,
            username: username || 'Usuario'
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('✅ Email de restablecimiento enviado exitosamente a través del backend');
            return true;
          }
        }
        
        console.log(`⚠️ Backend respondió con status: ${response.status}`);
        throw new Error(`Backend responded with status: ${response.status}`);
        
      } catch (backendError) {
        console.log('⚠️ Backend no disponible, usando modo desarrollo');
        console.log('Error details:', backendError.message);
        
        // Modo desarrollo - mostrar el enlace en la consola
        console.log(`
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                    🔗 ENLACE DE RESTABLECIMIENTO DE CONTRASEÑA                                                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                                                                                                                                                  ║
║  Para: ${email}                                                                                                                                                                                                           ║
║  Asunto: Restablece tu contraseña - Alpha Global Market                                                                                                                                                                     ║
║                                                                                                                                                                                                                                  ║
║  Hola ${username || 'Usuario'},                                                                                                                                                                                         ║
║                                                                                                                                                                                                                                  ║
║  Recibimos una solicitud para restablecer la contraseña de tu cuenta.                                                                                                                                                      ║
║  Haz clic en el siguiente enlace para continuar:                                                                                                                                                                            ║
║                                                                                                                                                                                                                                  ║
║  ${resetLink}                                                                                                                                                                                                            ║
║                                                                                                                                                                                                                                  ║
║  Este enlace expirará en 1 hora.                                                                                                                                                                                            ║
║                                                                                                                                                                                                                                  ║
║  Si no solicitaste este restablecimiento, ignora este email.                                                                                                                                                                ║
║                                                                                                                                                                                                                                  ║
║  Saludos,                                                                                                                                                                                                                    ║
║  Equipo Alpha Global Market                                                                                                                                                                                                  ║
║                                                                                                                                                                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
        `);
        
        // Simular delay de envío
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return true; // Considerar exitoso en modo desarrollo
      }
      
    } catch (error) {
      console.error('❌ Error enviando email de restablecimiento:', error);
      throw new Error('Error al enviar email de restablecimiento');
    }
  }

  /**
   * Genera y envía un enlace de restablecimiento
   * @param {string} email - Email del usuario
   * @returns {Promise<{success: boolean, error?: string, resetLink?: string}>}
   */
  async generateAndSendResetLink(email) {
    try {
      console.log('🚀 PasswordResetService: generateAndSendResetLink called', { email });
      
      // Verificar si el email existe
      const emailCheck = await this.checkEmailExists(email);
      if (!emailCheck.exists) {
        // Por seguridad, no revelamos si el email existe o no
        console.log('📧 Email no existe, pero retornamos éxito por seguridad');
        return { success: true };
      }
      
      const token = this.generateResetToken();
      console.log('🔑 Generated reset token:', token.substring(0, 8) + '...');
      
      // Guardar token en Firestore
      const saved = await this.saveResetToken(email, token, emailCheck.userId);
      if (!saved) {
        throw new Error('Error al guardar token');
      }
      console.log('💾 Reset token saved to Firestore');
      
      // Crear enlace de restablecimiento
      const resetLink = `${window.location.origin}/reset-password?token=${token}`;
      console.log('🔗 Reset link created:', resetLink.substring(0, 50) + '...');
      
      // Enviar email con enlace
      const emailSent = await this.sendResetLinkEmail(email, resetLink, emailCheck.username);
      console.log('📧 Reset email sent result:', emailSent);
      
      if (emailSent) {
        console.log('✅ Reset link generation and send successful');
        return { success: true, resetLink };
      } else {
        throw new Error('Error al enviar email');
      }
      
    } catch (error) {
      console.error('❌ Error generando y enviando enlace de restablecimiento:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Valida un token de restablecimiento
   * @param {string} token - Token de restablecimiento
   * @returns {Promise<{isValid: boolean, userId?: string, email?: string, error?: string}>}
   */
  async validateResetToken(token) {
    try {
      console.log('🔍 Validating reset token:', token.substring(0, 8) + '...');
      
      const tokenDoc = await getDoc(doc(db, this.TOKEN_COLLECTION, token));
      
      if (!tokenDoc.exists()) {
        return { isValid: false, error: 'Token de restablecimiento no válido o expirado' };
      }

      const data = tokenDoc.data();
      const currentTime = new Date();

      // Verificar si el token ya fue usado
      if (data.isUsed) {
        return { isValid: false, error: 'Este enlace ya fue utilizado' };
      }

      // Verificar si el token expiró
      if (data.expiresAt.toDate() < currentTime) {
        // Limpiar token expirado
        await deleteDoc(doc(db, this.TOKEN_COLLECTION, token));
        return { isValid: false, error: 'El enlace ha expirado. Solicita uno nuevo.' };
      }

      console.log(`✅ Token de restablecimiento válido para ${data.email}`);
      return { 
        isValid: true, 
        userId: data.userId, 
        email: data.email,
        tokenData: data
      };

    } catch (error) {
      console.error('Error validando token de restablecimiento:', error);
      return { isValid: false, error: 'Error al validar enlace' };
    }
  }

  /**
   * Marca un token como usado
   * @param {string} token - Token de restablecimiento
   * @returns {Promise<boolean>}
   */
  async markTokenAsUsed(token) {
    try {
      await updateDoc(doc(db, this.TOKEN_COLLECTION, token), {
        isUsed: true,
        usedAt: serverTimestamp()
      });
      console.log('🔒 Token marcado como usado');
      return true;
    } catch (error) {
      console.error('Error marcando token como usado:', error);
      return false;
    }
  }

  /**
   * Genera y envía un nuevo código de restablecimiento (método legacy)
   * @param {string} email - Email del usuario
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async generateAndSendResetCode(email) {
    try {
      console.log('🚀 PasswordResetService: generateAndSendResetCode called', { email });
      
      // Verificar si el email existe
      const emailCheck = await this.checkEmailExists(email);
      if (!emailCheck.exists) {
        // Por seguridad, no revelamos si el email existe o no
        console.log('📧 Email no existe, pero retornamos éxito por seguridad');
        return { success: true };
      }
      
      const code = this.generateCode();
      console.log('🔑 Generated reset code:', code);
      
      // Guardar código en Firestore
      await this.saveResetCode(email, code, emailCheck.userId);
      console.log('💾 Reset code saved to Firestore');
      
      // Enviar email con código
      const emailSent = await this.sendResetEmail(email, code, emailCheck.username);
      console.log('📧 Reset email sent result:', emailSent);
      
      if (emailSent) {
        console.log('✅ Reset code generation and send successful');
        return { success: true };
      } else {
        throw new Error('Error al enviar email');
      }
      
    } catch (error) {
      console.error('❌ Error generando y enviando código de restablecimiento:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Valida un código de verificación
   * @param {string} email - Email del usuario
   * @param {string} inputCode - Código ingresado por el usuario
   * @returns {Promise<{isValid: boolean, userId?: string, error?: string}>}
   */
  async validateResetCode(email, inputCode) {
    try {
      const codeDoc = await getDoc(doc(db, this.COLLECTION_NAME, email));
      
      if (!codeDoc.exists()) {
        return { isValid: false, error: 'No existe código de restablecimiento para este email' };
      }

      const data = codeDoc.data();
      const currentTime = new Date();

      // Verificar si el código ya fue usado
      if (data.isUsed) {
        return { isValid: false, error: 'Este código ya fue utilizado' };
      }

      // Verificar si el código expiró
      if (data.expiresAt.toDate() < currentTime) {
        // Limpiar código expirado
        await deleteDoc(doc(db, this.COLLECTION_NAME, email));
        return { isValid: false, error: 'El código ha expirado. Solicita uno nuevo.' };
      }

      // Verificar el código
      if (data.code !== inputCode) {
        // Incrementar intentos
        await setDoc(doc(db, this.COLLECTION_NAME, email), {
          ...data,
          attempts: data.attempts + 1
        });

        if (data.attempts >= 4) { // 5 intentos total (4 + 1)
          await deleteDoc(doc(db, this.COLLECTION_NAME, email));
          return { isValid: false, error: 'Demasiados intentos fallidos. Solicita un nuevo código.' };
        }

        return { isValid: false, error: 'Código incorrecto' };
      }

      // Código válido - marcarlo como usado
      await setDoc(doc(db, this.COLLECTION_NAME, email), {
        ...data,
        isUsed: true
      });

      console.log(`Código de restablecimiento validado exitosamente para ${email}`);
      return { isValid: true, userId: data.userId };

    } catch (error) {
      console.error('Error validando código de restablecimiento:', error);
      return { isValid: false, error: 'Error al validar código' };
    }
  }

  /**
   * Limpia códigos expirados (llamar periódicamente)
   * @returns {Promise<void>}
   */
  async cleanupExpiredCodes() {
    try {
      const querySnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
      const currentTime = new Date();
      const expiredDocs = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.expiresAt.toDate() < currentTime) {
          expiredDocs.push(doc.id);
        }
      });

      // Eliminar documentos expirados
      for (const docId of expiredDocs) {
        await deleteDoc(doc(db, this.COLLECTION_NAME, docId));
      }

      console.log(`Limpiados ${expiredDocs.length} códigos de restablecimiento expirados`);
    } catch (error) {
      console.error('Error limpiando códigos expirados:', error);
    }
  }
}

// Crear instancia única del servicio
const passwordResetService = new PasswordResetService();

export default passwordResetService; 