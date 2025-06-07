# 📧 Plantillas de Email - AGM PROP

Esta carpeta contiene todas las plantillas de email para la plataforma AGM PROP. Cada plantilla está diseñada con un estilo profesional, responsive y optimizada para diferentes clientes de correo.

## 📁 Estructura de Plantillas

### 1. **email-verification.html** 
**Propósito**: Verificación de correo electrónico para nuevos usuarios  
**Cuándo usar**: Durante el proceso de registro  

**Variables disponibles**:
- `{{USERNAME}}` - Nombre del usuario
- `{{VERIFICATION_CODE}}` - Código de verificación de 4 dígitos

**Ejemplo de uso**:
```javascript
const template = fs.readFileSync('email-templates/email-verification.html', 'utf8');
const html = template
  .replace(/{{USERNAME}}/g, 'Juan Pérez')
  .replace(/{{VERIFICATION_CODE}}/g, '1234');
```

---

### 2. **password-reset-email.html** ✨ **NUEVO SISTEMA**
**Propósito**: Restablecimiento de contraseña con códigos de verificación  
**Cuándo usar**: Cuando el usuario solicita restablecer su contraseña (sistema moderno)  

**Variables disponibles**:
- `{{USERNAME}}` - Nombre del usuario
- `{{RESET_CODE}}` - Código de verificación de 6 dígitos

**Características especiales**:
- ✅ Códigos de 6 dígitos más seguros
- ✅ Expiración automática en 15 minutos
- ✅ Límite de 5 intentos de validación
- ✅ Interfaz moderna con indicadores de seguridad
- ✅ Compatible con el nuevo flujo de UX

**Ejemplo de uso**:
```javascript
const template = fs.readFileSync('email-templates/password-reset-email.html', 'utf8');
const html = template
  .replace(/{{USERNAME}}/g, 'Juan Pérez')
  .replace(/{{RESET_CODE}}/g, '123456');
```

---

### 3. **reset_password_email.html** (LEGACY)
**Propósito**: Restablecimiento de contraseña con enlaces (sistema anterior)  
**Cuándo usar**: Mantenido por compatibilidad  

**Variables disponibles**:
- `%LINK%` - URL para restablecer la contraseña

**Ejemplo de uso**:
```javascript
const template = fs.readFileSync('email-templates/reset_password_email.html', 'utf8');
const html = template.replace('%LINK%', 'https://agmprop.com/reset-password?token=xyz123');
```

---

### 4. **welcome-email.html**
**Propósito**: Email de bienvenida para usuarios verificados  
**Cuándo usar**: Después de que el usuario completa exitosamente la verificación  

**Variables disponibles**:
- `{{USERNAME}}` - Nombre del usuario
- `{{LOGIN_URL}}` - URL para acceder al dashboard
- `{{HELP_CENTER_URL}}` - URL del centro de ayuda
- `{{COMMUNITY_URL}}` - URL de la comunidad

**Ejemplo de uso**:
```javascript
const template = fs.readFileSync('email-templates/welcome-email.html', 'utf8');
const html = template
  .replace(/{{USERNAME}}/g, 'María García')
  .replace(/{{LOGIN_URL}}/g, 'https://agmprop.com/dashboard')
  .replace(/{{HELP_CENTER_URL}}/g, 'https://agmprop.com/help')
  .replace(/{{COMMUNITY_URL}}/g, 'https://agmprop.com/community');
```

---

### 5. **trading-notification.html**
**Propósito**: Notificaciones importantes de trading y actualizaciones de cuenta  
**Cuándo usar**: Para alertas de trading, límites de cuenta, logros, etc.  

**Variables disponibles**:
- `{{USERNAME}}` - Nombre del usuario
- `{{NOTIFICATION_TITLE}}` - Título de la notificación
- `{{ALERT_TYPE}}` - Tipo de alerta: `success`, `warning`, `danger`, `info`
- `{{ICON}}` - Emoji o icono para la notificación
- `{{MAIN_MESSAGE}}` - Mensaje principal
- `{{EXPLANATION_MESSAGE}}` - Explicación detallada

**Variables condicionales**:
- `{{#if SHOW_STATS}}` - Mostrar estadísticas de trading
- `{{ACCOUNT_BALANCE}}`, `{{DAILY_PNL}}`, `{{TRADES_COUNT}}`, `{{MAX_DRAWDOWN}}`
- `{{#if HIGHLIGHT_MESSAGE}}` - Mostrar mensaje destacado
- `{{#if TRADING_DETAILS}}` - Mostrar detalles de operación específica
- `{{#if SHOW_ACTIONS}}` - Mostrar botones de acción

---

### 6. **promotional-email.html**
**Propósito**: Emails promocionales, ofertas especiales y campañas de marketing  
**Cuándo usar**: Para promociones, nuevas funcionalidades, ofertas especiales  

**Variables principales**:
- `{{USERNAME}}` - Nombre del usuario
- `{{PROMO_TITLE}}` - Título principal de la promoción
- `{{PROMO_SUBTITLE}}` - Subtítulo de la promoción
- `{{MAIN_MESSAGE}}` - Mensaje principal
- `{{PRIMARY_CTA_URL}}` - URL del botón principal
- `{{PRIMARY_CTA_TEXT}}` - Texto del botón principal

**Variables condicionales**:
- `{{#if OFFER_BADGE}}` - Badge de oferta especial
- `{{#if URGENCY_MESSAGE}}` - Mensaje de urgencia
- `{{#if HIGHLIGHT_OFFER}}` - Oferta destacada
- `{{#if TESTIMONIAL}}` - Testimonial de cliente
- `{{#if SOCIAL_PROOF}}` - Prueba social con estadísticas
- `{{UNSUBSCRIBE_URL}}` - URL para darse de baja

---

## 🎨 Características de Diseño

### Diseño Común a Todas las Plantillas:
- **Banner AGM PROP**: Logo centrado en fondo negro
- **Diseño responsive**: Optimizado para móviles y desktop
- **Fuentes web-safe**: Compatible con todos los clientes de email
- **Colores consistentes**: Paleta corporativa de AGM PROP

### Compatibilidad:
- ✅ Gmail
- ✅ Outlook (todas las versiones)
- ✅ Apple Mail
- ✅ Yahoo Mail
- ✅ Thunderbird
- ✅ Clientes móviles (iOS, Android)

## 🔧 Integración con SendGrid

### Ejemplo de Integración Básica:

```javascript
const fs = require('fs');
const sgMail = require('@sendgrid/mail');

// Función para enviar email con plantilla
async function sendTemplatedEmail(templateName, recipientEmail, variables) {
  try {
    // Leer la plantilla
    let template = fs.readFileSync(`email-templates/${templateName}`, 'utf8');
    
    // Reemplazar variables
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, variables[key]);
    });
    
    // Configurar mensaje
    const msg = {
      to: recipientEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME
      },
      subject: variables.SUBJECT || 'AGM PROP - Notificación',
      html: template
    };
    
    // Enviar
    await sgMail.send(msg);
    console.log(`Email enviado exitosamente a ${recipientEmail}`);
    
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
}

// Ejemplos de uso:

// 1. Email de verificación
await sendTemplatedEmail('email-verification.html', 'user@example.com', {
  USERNAME: 'Juan Pérez',
  VERIFICATION_CODE: '1234',
  SUBJECT: '🔐 Verifica tu cuenta - AGM PROP'
});

// 2. Email de bienvenida
await sendTemplatedEmail('welcome-email.html', 'user@example.com', {
  USERNAME: 'María García',
  LOGIN_URL: 'https://agmprop.com/dashboard',
  HELP_CENTER_URL: 'https://agmprop.com/help',
  COMMUNITY_URL: 'https://agmprop.com/community',
  SUBJECT: '🎉 ¡Bienvenido a AGM PROP!'
});

// 3. Restablecimiento de contraseña (NUEVO SISTEMA)
await sendTemplatedEmail('password-reset-email.html', 'user@example.com', {
  USERNAME: 'Ana López',
  RESET_CODE: '789012',
  SUBJECT: '🔐 Código para restablecer contraseña - AGM PROP'
});

// 4. Notificación de trading
await sendTemplatedEmail('trading-notification.html', 'user@example.com', {
  USERNAME: 'Carlos Rodríguez',
  NOTIFICATION_TITLE: 'Límite de Drawdown Alcanzado',
  ALERT_TYPE: 'warning',
  ICON: '⚠️',
  MAIN_MESSAGE: 'Tu cuenta ha alcanzado el 80% del límite de drawdown permitido.',
  EXPLANATION_MESSAGE: 'Te recomendamos revisar tu estrategia de trading...',
  SUBJECT: '⚠️ Alerta de Trading - AGM PROP'
});
```

## 📝 Mejores Prácticas

### 1. **Variables de Reemplazo**:
- Siempre valida que las variables existan antes de reemplazar
- Usa valores por defecto para variables opcionales
- Escapa HTML cuando sea necesario

### 2. **Testing**:
- Prueba en diferentes clientes de email
- Verifica en móvil y desktop
- Utiliza herramientas como Litmus o Email on Acid

### 3. **Personalización**:
- Usa el nombre del usuario cuando sea posible
- Adapta el contenido según el contexto del usuario
- Mantén el tono profesional pero cercano

### 4. **Accesibilidad**:
- Alt text en todas las imágenes
- Contraste adecuado en colores
- Texto legible en todos los tamaños

## 🆕 Agregar Nuevas Plantillas

Para crear una nueva plantilla:

1. **Copia una plantilla existente** como base
2. **Mantén la estructura HTML** básica (banner, container, content-section, footer)
3. **Usa variables de reemplazo** con formato `{{VARIABLE_NAME}}`
4. **Testa la compatibilidad** en diferentes clientes
5. **Documenta las variables** en este README
6. **Actualiza el backend** para incluir la nueva plantilla

## 🔄 Mantenimiento

### Actualizaciones Regulares:
- Revisar métricas de entregabilidad
- Actualizar colores/branding según necesidades
- Optimizar para nuevos clientes de email
- Mejorar responsive design

### Control de Versiones:
- Mantener backup de versiones anteriores
- Documentar cambios importantes
- Probar exhaustivamente antes de producción

---

**Última actualización**: Enero 2025  
**Mantenido por**: Equipo de Desarrollo AGM PROP  
**Contacto**: team@alphaglobalmarket.io 