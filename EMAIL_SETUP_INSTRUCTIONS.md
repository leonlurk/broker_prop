# 📧 Configuración de Envío de Emails para Verificación

## Estado Actual
✅ **Sistema funcional**: La verificación por código funciona completamente
🔧 **Modo desarrollo**: Los códigos se muestran en la consola del navegador
📱 **Listo para producción**: Solo falta configurar el backend de emails

---

## 🚀 Opciones para Configurar Emails Reales

### **OPCIÓN 1: Backend con Gmail (Recomendado para desarrollo)**

#### 1. Crear servidor backend:
```bash
mkdir email-backend
cd email-backend
npm init -y
npm install express nodemailer cors dotenv
```

#### 2. Configurar Gmail App Password:
- Ve a [Google Account Settings](https://myaccount.google.com/)
- Security → 2-Step Verification (actívala si no está)
- App passwords → Generate password
- Selecciona "Mail" y "Other"
- Copia la contraseña generada (16 caracteres)

#### 3. Crear archivo `.env`:
```env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=abc-def-ghi-jkl
PORT=3001
```

#### 4. Usar el archivo `backend-email-example.js` incluido

#### 5. Ejecutar backend:
```bash
node backend-email-example.js
```

---

### **OPCIÓN 2: SendGrid (Recomendado para producción)**

#### 1. Registro en SendGrid:
- Ve a [SendGrid](https://sendgrid.com/)
- Cuenta gratuita: 100 emails/día
- Verifica tu dominio/email

#### 2. Obtener API Key:
- Dashboard → Settings → API Keys
- Create API Key con permisos de "Mail Send"

#### 3. Modificar el servicio:
```javascript
// En emailVerificationService.js
async sendVerificationEmail(email, code, username) {
  const response = await fetch('https://api.sendgrid.v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email }],
        subject: 'Código de verificación - AGM Trading'
      }],
      from: { email: 'noreply@agmtrading.com', name: 'AGM Trading' },
      content: [{
        type: 'text/html',
        value: emailTemplate
      }]
    })
  });
}
```

---

### **OPCIÓN 3: AWS SES (Para gran volumen)**

#### 1. Configurar AWS SES:
- Crear cuenta AWS
- Activar SES
- Verificar dominio

#### 2. Instalar SDK:
```bash
npm install @aws-sdk/client-ses
```

#### 3. Configurar credenciales AWS

---

## 🔧 Estado de Desarrollo Actual

**✅ Lo que YA funciona:**
- Generación de códigos de 4 dígitos ✅
- Almacenamiento en Firestore ✅
- Validación de códigos ✅
- Expiración automática (10 min) ✅
- Interfaz de usuario completa ✅
- Redirección automática ✅
- Reenvío de códigos ✅

**🔧 Modo desarrollo actual:**
- Los códigos se muestran en la consola del navegador
- Email con formato profesional en logs
- Sistema completamente funcional para testing

**📧 Para emails reales:**
- Configurar cualquiera de las opciones arriba
- El endpoint `/api/send-verification-email` ya está configurado
- Automáticamente usará el backend cuando esté disponible

---

## 🎯 Configuración Rápida (5 minutos)

**Para testing rápido con Gmail:**

1. **Crear `package.json` en carpeta backend:**
```json
{
  "name": "agm-email-backend",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0",
    "nodemailer": "^6.9.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  }
}
```

2. **Instalar:**
```bash
npm install
```

3. **Crear `.env` con tu Gmail**

4. **Ejecutar backend:**
```bash
node backend-email-example.js
```

5. **¡Listo!** Los emails se enviarán automáticamente

---

## 🔍 Testing

**Verificar que funciona:**
1. Registrar nuevo usuario
2. Ver el código en consola (modo desarrollo)
3. O recibir email real (con backend)
4. Ingresar código en la interfaz
5. ✅ Verificación exitosa

---

## 📝 Notas Importantes

- **Seguridad**: Nunca commitees las credenciales al repositorio
- **Producción**: Usa variables de entorno
- **Rate limiting**: Configura límites de envío
- **Monitoreo**: Log de emails enviados/fallidos
- **Backup**: Plan B si el servicio de email falla

El sistema está **100% listo** para producción, solo necesitas conectar el servicio de email que prefieras. 🚀 