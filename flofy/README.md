# Flofy Chatbot

Un chatbot moderno y responsive para Alpha Global Market, construido con HTML, CSS (Tailwind) y JavaScript.

## Características

- Interfaz moderna y responsive
- Integración con Firebase para almacenamiento
- Sistema de FAQs expandible
- Chat en tiempo real
- Soporte para múltiples idiomas
- Diseño adaptable a móviles y escritorio

## Requisitos

- Node.js (v14 o superior)
- NPM o Yarn
- Cuenta de Firebase
- API Key de Gemini

## Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd flofy
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
- Crear un archivo `.env` en la raíz del proyecto
- Agregar las siguientes variables:
```
FIREBASE_API_KEY=tu_api_key
FIREBASE_AUTH_DOMAIN=tu_auth_domain
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_STORAGE_BUCKET=tu_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
FIREBASE_APP_ID=tu_app_id
GEMINI_API_KEY=tu_gemini_api_key
```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:8000`

## Producción

Para construir la versión de producción:

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

## Despliegue

### Opción 1: Netlify (Recomendado)

1. Crear una cuenta en [Netlify](https://www.netlify.com/)

2. Instalar Netlify CLI (opcional):
```bash
npm install -g netlify-cli
```

3. Desplegar desde la interfaz web:
   - Ir a [app.netlify.com](https://app.netlify.com)
   - Arrastrar y soltar la carpeta `dist/` o conectar con tu repositorio de GitHub
   - Configurar las variables de entorno en la sección "Site settings > Build & deploy > Environment"

4. Desplegar desde la línea de comandos:
```bash
netlify deploy
```

### Opción 2: Firebase Hosting

1. Instalar Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Iniciar sesión en Firebase:
```bash
firebase login
```

3. Inicializar el proyecto:
```bash
firebase init
```

4. Desplegar:
```bash
firebase deploy
```

### Opción 3: Servidor Web Estático

1. Copiar los archivos de la carpeta `dist/` a tu servidor web
2. Configurar el servidor web para servir los archivos estáticos
3. Asegurarse de que todas las rutas redirijan a `index.html`

## Estructura del Proyecto

```
flofy/
├── index.html          # Página principal
├── script.js           # Lógica principal
├── faq.js             # Manejo de FAQs
├── firebase-config.js  # Configuración de Firebase
├── config.js          # Configuración general
├── storage-adapter.js # Adaptador de almacenamiento
└── migration-helper.js # Ayudante de migración
```

## Seguridad

- Todas las claves API deben estar en variables de entorno
- Implementar CORS adecuadamente
- Usar HTTPS en producción
- Configurar reglas de seguridad en Firebase

## Mantenimiento

- Actualizar dependencias regularmente
- Monitorear el uso de la API
- Revisar logs de errores
- Realizar backups periódicos

## Soporte

Para soporte técnico o preguntas, contactar a [EMAIL_DE_SOPORTE]

## Licencia

[ESPECIFICAR_LICENCIA]
