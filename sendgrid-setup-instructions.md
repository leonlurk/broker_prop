# 📧 Configuración de SendGrid para AGM Trading

## 🚀 Pasos de configuración

### 1. Crear cuenta en SendGrid
1. Ve a [https://sendgrid.com](https://sendgrid.com)
2. Click en "Start for Free"
3. Registrarte con tu email
4. Verificar email de confirmación

### 2. Obtener API Key
1. Ir a **Settings** → **API Keys**
2. Click **Create API Key**
3. Nombre: `AGM Trading API`
4. Permisos: **Full Access** (o solo Mail Send)
5. **Copiar la API Key** (solo se muestra una vez)

### 3. Configurar Sender (remitente)
Tienes 2 opciones:

#### Opción A: Email individual (5 minutos)
1. **Settings** → **Sender Authentication**
2. **Single Sender Verification**
3. Completar datos:
   - From Name: `AGM Trading`
   - From Email: `tu-email@gmail.com` (o el que uses)
   - Reply To: mismo email
   - Company: `AGM Trading`
   - Address: tu dirección
4. **Create** y verificar email

#### Opción B: Dominio completo (más profesional)
1. **Settings** → **Sender Authentication**
2. **Authenticate Your Domain**
3. Ingresar tu dominio: `agmtrading.com`
4. Configurar DNS records en tu proveedor de dominio
5. Verificar configuración

### 4. Variables de entorno
Crear archivo `.env` en la raíz del proyecto:
```env
SENDGRID_API_KEY=SG.tu-api-key-aqui
SENDGRID_FROM_EMAIL=noreply@agmtrading.com
SENDGRID_FROM_NAME=AGM Trading
```

### 5. Probar configuración
Una vez configurado, el sistema automáticamente detectará SendGrid y enviará emails reales.

## 🔧 Troubleshooting

### Si los emails no llegan:
1. Verificar que el sender esté verificado
2. Revisar spam/promotions
3. Verificar API Key en Settings → API Keys
4. Revisar Activity en SendGrid dashboard

### Limits del plan gratuito:
- 100 emails/día
- Todos los features básicos
- Soporte por email

### Para más volumen:
- Essentials: $19.95/mes → 50,000 emails/mes
- Pro: $89.95/mes → 100,000 emails/mes

## 📊 Monitoreo
En SendGrid dashboard puedes ver:
- Emails enviados
- Entregados vs rebotados
- Aperturas y clicks
- Estadísticas en tiempo real 