# Configuración Segura para GitHub

## 🔒 Configuración Local

### 1. Crear archivo .env (NO se sube a GitHub)

```bash
# En la carpeta del proyecto, crea .env
VITE_FIREBASE_API_KEY=AIzaSyBShk6aC6TGNU_eFwGPyHR3WSHTy0oz7uU
VITE_FIREBASE_AUTH_DOMAIN=flofychat-c36b0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=flofychat-c36b0
VITE_FIREBASE_STORAGE_BUCKET=flofychat-c36b0.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=272268182841
VITE_FIREBASE_APP_ID=1:272268182841:web:520c78be6c7817eee254e8
VITE_FIREBASE_MEASUREMENT_ID=G-Y9Q3H396PD
```

### 2. Copiar firebase-config.example.js a firebase-config.js

```bash
cp firebase-config.example.js firebase-config.js
```

### 3. Editar firebase-config.js con tus credenciales reales

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBShk6aC6TGNU_eFwGPyHR3WSHTy0oz7uU",
  authDomain: "flofychat-c36b0.firebaseapp.com",
  projectId: "flofychat-c36b0",
  storageBucket: "flofychat-c36b0.firebasestorage.app",
  messagingSenderId: "272268182841",
  appId: "1:272268182841:web:520c78be6c7817eee254e8",
  measurementId: "G-Y9Q3H396PD",
};
```

## 📂 Estructura de Archivos

```
flofychat/
├── .env                      # ❌ NO se sube (credenciales)
├── .gitignore               # ✅ Sí se sube
├── env.example              # ✅ Sí se sube (plantilla)
├── firebase-config.js       # ❌ NO se sube (credenciales)
├── firebase-config.example.js  # ✅ Sí se sube (plantilla)
├── config.js               # ✅ Sí se sube
├── script.js               # ✅ Sí se sube
├── crm.js                  # ✅ Sí se sube
└── ...otros archivos       # ✅ Sí se suben
```

## 🚀 Comandos GitHub

### Inicializar repositorio

```bash
git init
git add .
git commit -m "Initial commit - Flofy Chat with Firebase integration"
```

### Conectar con GitHub

```bash
git remote add origin https://github.com/tu-usuario/flofychat.git
git branch -M main
git push -u origin main
```

## 👥 Para Otros Desarrolladores

### Instrucciones en README.md

```markdown
## Configuración Local

1. Clona el repositorio
2. Copia `env.example` a `.env`
3. Copia `firebase-config.example.js` a `firebase-config.js`
4. Configura tus credenciales de Firebase en ambos archivos
5. Abre `index.html` en tu navegador
```

## 🌐 Para Producción (Netlify/Vercel)

### Variables de Entorno en Netlify:

```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

## ✅ Verificación de Seguridad

### Lo que NO se sube a GitHub:

- ❌ `.env` - Variables de entorno locales
- ❌ `firebase-config.js` - Configuración con credenciales

### Lo que SÍ se sube a GitHub:

- ✅ `.gitignore` - Lista de archivos a excluir
- ✅ `env.example` - Plantilla de variables
- ✅ `firebase-config.example.js` - Plantilla de configuración
- ✅ Todos los demás archivos del proyecto

## 🔧 Comandos Útiles

```bash
# Verificar estado de git
git status

# Ver qué archivos están siendo ignorados
git ls-files --others --ignored --exclude-standard

# Verificar que las credenciales no estén en el historial
git log --oneline -p | grep -i "firebase"
```
