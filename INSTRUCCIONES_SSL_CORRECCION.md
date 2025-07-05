# 🔧 INSTRUCCIONES DE CORRECCIÓN SSL - PROYECTO BROKER

## ✅ **Correcciones Ya Aplicadas:**

1. **✅ mt5Service.js** - Actualizado con URL HTTPS
2. **✅ axiosConfig.js** - Creado para manejo de certificados
3. **✅ mt5_api_examples.txt** - Actualizado con ejemplos HTTPS

## 🚨 **ACCIÓN REQUERIDA - Crear archivo .env:**

**En el directorio raíz del proyecto** (`prop/broker_prop/`), crea un archivo llamado `.env` con este contenido:

```env
# Configuración de la API MT5
VITE_MT5_API_URL=https://62.171.177.212:8443

# Configuración de la API de Crypto (actualizar si también tiene SSL)
VITE_CRYPTO_API_URL=https://62.171.177.212:3002/api

# Configuración de Firebase (opcional)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here

# Configuración de desarrollo
VITE_ENV=production
```

## 📝 **Comandos para crear el archivo .env:**

**Opción 1 - PowerShell:**
```powershell
# En el directorio prop/broker_prop/
@"
# Configuración de la API MT5
VITE_MT5_API_URL=https://62.171.177.212:8443

# Configuración de la API de Crypto
VITE_CRYPTO_API_URL=https://62.171.177.212:3002/api

# Configuración de Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key_here

# Configuración de desarrollo
VITE_ENV=production
"@ | Out-File -FilePath ".env" -Encoding UTF8
```

**Opción 2 - Editor de texto:**
1. Abrir cualquier editor de texto
2. Copiar el contenido del .env de arriba
3. Guardar como `.env` en `prop/broker_prop/`

## 🔍 **Verificar las Correcciones:**

1. **Verificar archivos modificados:**
   ```bash
   dir src/services/
   # Deberías ver: axiosConfig.js, mt5Service.js, cryptoPaymentService.js
   ```

2. **Verificar que .env existe:**
   ```bash
   dir .env
   # Debería mostrar el archivo .env
   ```

3. **Probar la conexión:**
   ```bash
   npm run dev
   # O yarn dev
   ```

## 🚀 **Cambios Realizados:**

### **mt5Service.js:**
- ✅ URL cambiada de `http://localhost:5000/api` a `https://62.171.177.212:8443`
- ✅ Configuración de axios para certificados auto-firmados
- ✅ Timeout aumentado a 30 segundos
- ✅ Manejo mejorado de respuestas (acepta 'healthy' y 'online')

### **axiosConfig.js (NUEVO):**
- ✅ Configuración centralizada de axios
- ✅ Interceptores para manejo de errores SSL
- ✅ Timeout configurado

### **mt5_api_examples.txt:**
- ✅ Todos los ejemplos actualizados a HTTPS
- ✅ Flag `-k` agregado para curl (certificados auto-firmados)
- ✅ Puerto cambiado a 8443
- ✅ Documentación mejorada

## ⚠️ **Consideraciones Importantes:**

### **Certificados Auto-firmados:**
- Los navegadores mostrarán advertencias de seguridad
- Es normal para desarrollo/testing
- Los usuarios deben "Aceptar riesgo" en el navegador

### **Producción:**
- Considera obtener certificados SSL válidos (Let's Encrypt, etc.)
- Para uso real, evita certificados auto-firmados

### **Firewall:**
- Asegúrate de que el puerto 8443 esté abierto en el VPS
- El puerto 443 debe seguir siendo para MT5 Server

## 🧪 **Pruebas Post-Corrección:**

1. **Probar health check desde navegador:**
   ```
   https://62.171.177.212:8443/health
   ```

2. **Probar desde la aplicación:**
   - Abrir la aplicación React
   - Intentar crear una cuenta de trading
   - Verificar que no hay errores de conexión

3. **Verificar logs:**
   - Abrir DevTools del navegador
   - Verificar que no hay errores de CORS o SSL

## 📞 **En caso de problemas:**

1. **Error de CORS:** 
   - Verificar configuración del servidor API
   - Asegurar que permite requests desde el dominio de la app

2. **Error de certificado:**
   - Asegurar que el navegador acepta el certificado
   - Verificar que el certificado está correctamente instalado en el VPS

3. **Error de conexión:**
   - Verificar que el API está ejecutándose en el VPS
   - Comprobar que el puerto 8443 está abierto
   - Verificar logs del PM2 en el VPS

## 🎯 **Resultado Esperado:**

Después de aplicar estas correcciones, tu aplicación React podrá:
- ✅ Conectarse a la API MT5 via HTTPS
- ✅ Crear cuentas de trading
- ✅ Realizar todas las operaciones MT5
- ✅ Funcionar en producción con SSL

---

**¡Las correcciones están completas! Solo falta crear el archivo .env y probar.** 