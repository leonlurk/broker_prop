# 🚀 Configuración de Netlify Functions para AGM PROP

## 📋 Pasos para configurar el envío de emails en producción

### 1. **Variables de Entorno en Netlify**

Ve a tu dashboard de Netlify → Site settings → Environment variables y agrega:

```bash
SENDGRID_API_KEY=SG.tu_api_key_de_sendgrid_aqui
SENDGRID_FROM_EMAIL=team@alphaglobalmarket.io
SENDGRID_FROM_NAME=Alpha Global Market
```

> ⚠️ **Importante**: Reemplaza `SG.tu_api_key_de_sendgrid_aqui` con tu API key real de SendGrid

### 2. **Verificar la configuración**

- ✅ La función estará disponible en: `https://front-broker.netlify.app/.netlify/functions/send-verification-email`
- ✅ El sistema automáticamente detectará si está en desarrollo o producción
- ✅ En desarrollo usará el proxy local (`/api/send-verification-email`)
- ✅ En producción usará la Netlify Function (`/.netlify/functions/send-verification-email`)

### 3. **Deploy y prueba**

1. Hacer push de los cambios:
   ```bash
   git add .
   git commit -m "Add Netlify Functions for email verification"
   git push
   ```

2. Netlify automáticamente detectará:
   - El archivo `netlify.toml` con la configuración
   - La carpeta `netlify/functions/` con las funciones
   - Las dependencias en `netlify/functions/package.json`

3. Probar el sistema registrando un usuario nuevo

### 4. **Monitoreo**

- Ve a Functions → Logs en tu dashboard de Netlify para ver los logs
- Los emails se enviarán con el mismo diseño profesional que en desarrollo
- El sistema tiene fallback automático al modo consola si hay problemas

### 5. **Archivos importantes**

- `netlify/functions/send-verification-email.js` - La función serverless
- `netlify/functions/package.json` - Dependencias de la función
- `netlify.toml` - Configuración de Netlify
- `src/services/emailVerificationService.js` - Cliente que usa la función

## 🔧 Troubleshooting

### Si no funciona la función:

1. **Verificar variables de entorno** en Netlify dashboard
2. **Revisar logs** en Functions → Logs
3. **Verificar que el API key de SendGrid sea válido**
4. **Confirmar que el sender email esté verificado en SendGrid**

### Si aparece error CORS:

- El archivo `netlify.toml` ya incluye los headers necesarios
- La función incluye manejo de preflight requests

### URL de la función en producción:

```
https://front-broker.netlify.app/.netlify/functions/send-verification-email
```

## ✅ **Sistema funcionará así:**

1. **Usuario se registra** → Genera código → Llama a la función
2. **Función recibe request** → Valida datos → Envía email via SendGrid  
3. **Usuario recibe email** → Ingresa código → Sistema verifica
4. **Email verificado** → Usuario puede hacer login

¡El sistema está listo para producción! 🎉 