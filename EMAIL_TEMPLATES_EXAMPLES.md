# 📧 **Plantillas de Email AGM PROP - Ejemplos de Uso**

## 🎯 **Plantillas Disponibles:**

### 1. **✅ Verificación de Email**
```bash
curl -X POST https://tu-dominio.netlify.app/.netlify/functions/send-email \
-H "Content-Type: application/json" \
-d '{
  "email": "usuario@ejemplo.com",
  "type": "email_verification",
  "username": "Juan Pérez",
  "code": "1234"
}'
```

### 2. **🎉 Email de Bienvenida**
```bash
curl -X POST https://tu-dominio.netlify.app/.netlify/functions/send-email \
-H "Content-Type: application/json" \
-d '{
  "email": "usuario@ejemplo.com",
  "type": "welcome",
  "username": "Juan Pérez"
}'
```

### 3. **🔑 Recuperación de Contraseña**
```bash
curl -X POST https://tu-dominio.netlify.app/.netlify/functions/send-email \
-H "Content-Type: application/json" \
-d '{
  "email": "usuario@ejemplo.com",
  "type": "password_reset",
  "username": "Juan Pérez",
  "resetLink": "https://agmprop.com/reset-password?token=abc123"
}'
```

### 4. **💰 Confirmación de Depósito**
```bash
curl -X POST https://tu-dominio.netlify.app/.netlify/functions/send-email \
-H "Content-Type: application/json" \
-d '{
  "email": "usuario@ejemplo.com",
  "type": "deposit_confirmation",
  "username": "Juan Pérez",
  "amount": "1000",
  "currency": "USD",
  "transactionId": "TXN-12345678"
}'
```

### 5. **🚨 Alerta de Trading**
```bash
curl -X POST https://tu-dominio.netlify.app/.netlify/functions/send-email \
-H "Content-Type: application/json" \
-d '{
  "email": "usuario@ejemplo.com",
  "type": "trading_alert",
  "username": "Juan Pérez",
  "alertType": "Stop Loss Activado",
  "message": "Tu posición en EUR/USD se cerró automáticamente con Stop Loss en 1.0850"
}'
```

---

## 🔧 **Integración en el Frontend:**

### **Servicio de Email Actualizado**

```javascript
// src/services/emailService.js
class EmailService {
  
  async sendVerificationEmail(email, code, username) {
    return this.sendEmail({
      email,
      type: 'email_verification',
      username,
      code
    });
  }
  
  async sendWelcomeEmail(email, username) {
    return this.sendEmail({
      email,
      type: 'welcome', 
      username
    });
  }
  
  async sendPasswordResetEmail(email, username, resetLink) {
    return this.sendEmail({
      email,
      type: 'password_reset',
      username,
      resetLink
    });
  }
  
  async sendDepositConfirmation(email, username, amount, currency, transactionId) {
    return this.sendEmail({
      email,
      type: 'deposit_confirmation',
      username,
      amount,
      currency, 
      transactionId
    });
  }
  
  async sendTradingAlert(email, username, alertType, message) {
    return this.sendEmail({
      email,
      type: 'trading_alert',
      username,
      alertType,
      message
    });
  }
  
  async sendEmail(data) {
    try {
      const apiUrl = import.meta.env.DEV 
        ? '/api/send-email' 
        : '/.netlify/functions/send-email';
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error enviando email:', error);
      throw error;
    }
  }
}

export default new EmailService();
```

---

## 🎨 **Características de las Plantillas:**

### **🎯 Diseño Unificado:**
- ✅ Banner AGM PROP fullwidth
- ✅ Diseño responsive
- ✅ Colores corporativos
- ✅ Footer profesional

### **📱 Responsive:**
- ✅ Adaptable a móviles
- ✅ Tipografía optimizada
- ✅ Botones táctiles

### **🔒 Seguridad:**
- ✅ Links con expiración
- ✅ Códigos temporales
- ✅ Mensajes de advertencia

### **📊 Componentes Visuales:**
- 🟢 **Alertas Éxito** (verde)
- 🟡 **Alertas Advertencia** (amarillo)  
- 🔴 **Alertas Peligro** (rojo)
- 🔵 **Botones de Acción** (gradiente azul)

---

## 🚀 **Próximas Plantillas a Agregar:**

### **6. Newsletter/Actualizaciones**
- 📰 Noticias del mercado
- 📈 Análisis técnicos
- 🎯 Tips de trading

### **7. Reportes Mensuales**
- 📊 Resumen de performance
- 💰 Ganancias/pérdidas
- 📈 Estadísticas de trading

### **8. Alertas de Seguridad**
- 🔐 Cambios en la cuenta
- 🌍 Accesos desde nuevas IPs
- 📱 Activación de 2FA

### **9. Promociones**
- 🎁 Bonos especiales
- 🏆 Programas VIP
- 💎 Ofertas exclusivas

### **10. Retiros**
- 💸 Confirmación de retiros
- ⏰ Notificaciones de procesamiento
- ✅ Retiros completados

---

## ✅ **¿Cómo Usar Este Sistema?**

1. **En Desarrollo**: Los emails van al backend local
2. **En Producción**: Van a las Netlify Functions  
3. **Automático**: El sistema detecta el entorno
4. **Escalable**: Fácil agregar nuevas plantillas

¡El sistema está listo para manejar todos los emails de tu plataforma! 🎉 