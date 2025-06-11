# Configuración de Firebase para Flofy Chat

## Paso 1: Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita Firestore Database
4. Configura las reglas de seguridad básicas

## Paso 2: Obtener Configuración

1. En la consola de Firebase, ve a Project Settings
2. En "Your apps", registra una nueva Web App
3. Copia la configuración de Firebase

## Paso 3: Configurar el Proyecto

1. Abre el archivo `firebase-config.js`
2. Reemplaza la configuración con tus datos reales:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-project-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id",
};
```

## Paso 4: Configurar Reglas de Firestore

En la consola de Firebase, ve a Firestore Database > Rules y usa estas reglas básicas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to user's own data
    match /users/{userId} {
      allow read, write: if true; // Cambiar por autenticación real en producción
    }
  }
}
```

## Características del Sistema

### ✅ Sincronización Preservada

- La sincronización entre CRM y chatbot se mantiene intacta
- localStorage sigue siendo la fuente principal de verdad
- Firebase actúa como backup/persistencia adicional

### ✅ Modo Offline

- El sistema funciona sin conexión a internet
- Los datos se sincronizan automáticamente cuando vuelve la conexión
- Fallback automático a localStorage si Firebase falla

### ✅ Migración Automática

- Los datos existentes en localStorage se migran automáticamente a Firebase
- No se pierden conversaciones ni configuraciones
- Proceso transparente para el usuario

### ✅ Compatibilidad Backwards

- El sistema funciona sin Firebase configurado
- Se degradará gradualmente a solo localStorage
- Sin riesgo de romper funcionalidad existente

## Estructura de Datos en Firebase

```
users/{userId}/
├── storage/
│   ├── chatHistory_{userId}
│   ├── chatSummary_{userId}
│   ├── crm_conversations
│   └── flofy_conversations
├── createdAt
└── lastUpdated
```

## Beneficios Adicionales

1. **Persistencia entre dispositivos**: Los usuarios pueden acceder a su historial desde cualquier dispositivo
2. **Backup automático**: Los datos están seguros en la nube
3. **Escalabilidad**: Firebase maneja automáticamente el scaling
4. **Tiempo real**: Posibilidad de agregar sincronización en tiempo real entre múltiples instancias del CRM

## Próximos Pasos (Opcionales)

1. **Autenticación**: Implementar Firebase Auth para usuarios únicos
2. **Tiempo Real**: Agregar listeners para sincronización instantánea
3. **Analytics**: Implementar Firebase Analytics para métricas de uso
4. **Performance**: Optimizar consultas para grandes volúmenes de datos
