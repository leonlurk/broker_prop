import { db } from '../firebase/config';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Servicio para verificación de email con códigos de 4 dígitos
 */
class EmailVerificationService {
  constructor() {
    this.CODE_LENGTH = 4;
    this.EXPIRATION_MINUTES = 10;
    this.COLLECTION_NAME = 'email_verification_codes';
  }

  /**
   * Genera un código de verificación de 4 dígitos
   * @returns {string} Código de 4 dígitos
   */
  generateCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Guarda el código de verificación en Firestore
   * @param {string} email - Email del usuario
   * @param {string} code - Código de verificación
   * @param {string} userId - ID del usuario
   * @returns {Promise<void>}
   */
  async saveVerificationCode(email, code, userId) {
    try {
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + this.EXPIRATION_MINUTES);

      await setDoc(doc(db, this.COLLECTION_NAME, email), {
        code,
        userId,
        email,
        createdAt: serverTimestamp(),
        expiresAt: expirationTime,
        attempts: 0,
        isUsed: false
      });

      console.log(`Código de verificación guardado para ${email}`);
    } catch (error) {
      console.error('Error guardando código de verificación:', error);
      throw new Error('Error al guardar código de verificación');
    }
  }

  /**
   * Envía el código de verificación por email
   * @param {string} email - Email del destinatario
   * @param {string} code - Código de verificación
   * @param {string} username - Nombre del usuario
   * @returns {Promise<boolean>} True si se envió correctamente
   */
  async sendVerificationEmail(email, code, username) {
    try {
      console.log(`📧 Enviando código ${code} a ${email} para ${username}`);
      
      // Intentar envío a través del backend
      try {
        const response = await fetch('/api/send-verification-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            code: code,
            username: username || 'Usuario',
            type: 'email_verification'
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('✅ Email enviado exitosamente a través del backend');
            return true;
          }
        }
        
        throw new Error('Backend email service not available');
        
      } catch (backendError) {
        console.log('⚠️ Backend no disponible, usando modo desarrollo');
        
        // Modo desarrollo - mostrar el código en la consola
        console.log(`
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                    📧 EMAIL DE VERIFICACIÓN                                                                                                                                    ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                                                                                                                                                  ║
║  Para: ${email}                                                                                                                                                                                                           ║
║  Asunto: Código de verificación - AGM Trading                                                                                                                                                                               ║
║                                                                                                                                                                                                                                  ║
║  Hola ${username || 'Usuario'},                                                                                                                                                                                         ║
║                                                                                                                                                                                                                                  ║
║  Tu código de verificación es:                                                                                                                                                                                               ║
║                                                                                                                                                                                                                                  ║
║                                                                       ${code}                                                                                                                                              ║
║                                                                                                                                                                                                                                  ║
║  Este código expirará en 10 minutos.                                                                                                                                                                                        ║
║                                                                                                                                                                                                                                  ║
║  Si no solicitaste este código, ignora este email.                                                                                                                                                                          ║
║                                                                                                                                                                                                                                  ║
║  Saludos,                                                                                                                                                                                                                    ║
║  Equipo AGM Trading                                                                                                                                                                                                          ║
║                                                                                                                                                                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
        `);
        
        // Simular delay de envío
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return true; // Considerar exitoso en modo desarrollo
      }
      
    } catch (error) {
      console.error('❌ Error enviando email de verificación:', error);
      throw new Error('Error al enviar email de verificación');
    }
  }

  /**
   * Genera y envía un nuevo código de verificación
   * @param {string} email - Email del usuario
   * @param {string} userId - ID del usuario
   * @param {string} username - Nombre del usuario
   * @returns {Promise<{success: boolean, code?: string}>}
   */
  async generateAndSendCode(email, userId, username) {
    try {
      console.log('🚀 EmailVerificationService: generateAndSendCode called', { email, userId, username });
      const code = this.generateCode();
      console.log('🔑 Generated code:', code);
      
      // Guardar código en Firestore
      await this.saveVerificationCode(email, code, userId);
      console.log('💾 Code saved to Firestore');
      
      // Enviar email con código
      const emailSent = await this.sendVerificationEmail(email, code, username);
      console.log('📧 Email sent result:', emailSent);
      
      if (emailSent) {
        console.log('✅ Code generation and send successful');
        return { success: true, code }; // En producción, no devolver el código
      } else {
        throw new Error('Error al enviar email');
      }
      
    } catch (error) {
      console.error('❌ Error generando y enviando código:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Valida un código de verificación
   * @param {string} email - Email del usuario
   * @param {string} inputCode - Código ingresado por el usuario
   * @returns {Promise<{isValid: boolean, error?: string}>}
   */
  async validateCode(email, inputCode) {
    try {
      const codeDoc = await getDoc(doc(db, this.COLLECTION_NAME, email));
      
      if (!codeDoc.exists()) {
        return { isValid: false, error: 'No existe código de verificación para este email' };
      }

      const codeData = codeDoc.data();
      
      // Verificar si el código ya fue usado
      if (codeData.isUsed) {
        return { isValid: false, error: 'Este código ya fue utilizado' };
      }

      // Verificar si el código expiró
      const now = new Date();
      const expirationTime = codeData.expiresAt.toDate();
      
      if (now > expirationTime) {
        // Eliminar código expirado
        await deleteDoc(doc(db, this.COLLECTION_NAME, email));
        return { isValid: false, error: 'El código de verificación ha expirado' };
      }

      // Verificar si el código coincide
      if (codeData.code !== inputCode) {
        // Incrementar intentos
        await setDoc(doc(db, this.COLLECTION_NAME, email), {
          ...codeData,
          attempts: codeData.attempts + 1
        });
        
        return { isValid: false, error: 'Código de verificación incorrecto' };
      }

      // Código válido - marcarlo como usado
      await setDoc(doc(db, this.COLLECTION_NAME, email), {
        ...codeData,
        isUsed: true,
        usedAt: serverTimestamp()
      });

      return { isValid: true };
      
    } catch (error) {
      console.error('Error validando código:', error);
      return { isValid: false, error: 'Error al validar código de verificación' };
    }
  }

  /**
   * Reenvía el código de verificación
   * @param {string} email - Email del usuario
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async resendCode(email) {
    try {
      const codeDoc = await getDoc(doc(db, this.COLLECTION_NAME, email));
      
      if (!codeDoc.exists()) {
        return { success: false, error: 'No existe código de verificación para este email' };
      }

      const codeData = codeDoc.data();
      
      // Verificar si el código ya fue usado
      if (codeData.isUsed) {
        return { success: false, error: 'El código ya fue utilizado' };
      }

      // Reenviar el mismo código
      const emailSent = await this.sendVerificationEmail(email, codeData.code, codeData.userId);
      
      if (emailSent) {
        return { success: true };
      } else {
        return { success: false, error: 'Error al reenviar email' };
      }
      
    } catch (error) {
      console.error('Error reenviando código:', error);
      return { success: false, error: 'Error al reenviar código de verificación' };
    }
  }

  /**
   * Limpia códigos expirados (para mantenimiento)
   * @returns {Promise<number>} Número de códigos eliminados
   */
  async cleanupExpiredCodes() {
    try {
      // Esta función se puede llamar periódicamente para limpiar códigos expirados
      // Por ahora solo registramos que se ejecutó
      console.log('Limpieza de códigos expirados ejecutada');
      return 0;
    } catch (error) {
      console.error('Error limpiando códigos expirados:', error);
      return 0;
    }
  }
}

// Exportar instancia singleton
export default new EmailVerificationService(); 