# Broker Prop Firm

Una plataforma para gestionar desafíos de trading y cuentas de operadores.

## Características

- Autenticación de usuarios con Firebase
- Gestión de cuentas de trading
- Compra de desafíos mediante criptomonedas o tarjeta
- Procesamiento de pagos con criptomonedas integrado
- Monitoreo de transacciones en blockchain (Tron y BSC)
- Creación automática de cuentas MT5

## Requisitos

- Node.js 18+
- Npm o Yarn
- Firebase project
- Acceso a API de BSCScan y TronGrid (opcional)
- Acceso a MT5 Manager API

## Instalación

1. Clonar el repositorio
```bash
git clone <repository-url>
cd broker-front-main
```

2. Instalar dependencias
```bash
npm install
```

3. Crear archivo .env
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido, reemplazando los valores con tus propias credenciales:

```
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Blockchain API Keys
VITE_BSC_API_KEY=your-bscscan-api-key
VITE_BSC_API_URL=https://api.bscscan.com/api
VITE_BSC_URL=https://bsc-dataseed.binance.org
VITE_BSC_CONFIRMATIONS=15

VITE_TRON_API_KEY=your-trongrid-api-key
VITE_TRON_API_URL=https://api.trongrid.io
VITE_TRON_FULL_HOST=https://api.trongrid.io
VITE_TRON_CONFIRMATIONS=20

# Static Wallet Addresses (opcional)
VITE_TRON_WALLET_ADDRESS=your-tron-wallet-address
VITE_BSC_WALLET_ADDRESS=your-bsc-wallet-address

# MT5 API Configuration
VITE_MT5_API_URL=/.netlify/functions/mt5-proxy/api
VITE_MT5_API_KEY=your-mt5-api-key
```

4. Iniciar el servidor de desarrollo
```bash
npm run dev
```

## Estructura de Firestore

Para que el procesamiento de pagos funcione correctamente, asegúrate de tener las siguientes colecciones en Firestore:

1. `payments` - Almacena los detalles de pagos con criptomonedas
2. `cryptoPayments` - Registro de referencias de pagos asociados a compras de desafíos
3. `tradingAccounts` - Cuentas de trading creadas
4. `operations` - Historial de operaciones realizadas
5. `config/wallets` - (Opcional) Documento con direcciones de wallet configuradas

## Integración de Pagos con Criptomonedas

El sistema incluye una integración completa para procesar pagos con criptomonedas directamente en la aplicación:

1. Generación de dirección de pago y código QR
2. Monitoreo de transacciones en la blockchain (Tron y BSC)
3. Verificación y confirmación de pagos
4. Creación automática de cuentas MT5 al confirmar el pago
5. Actualización del estado del pago en tiempo real

## Desarrollo

### Estructura de Directorios

- `/src` - Código fuente de la aplicación
  - `/components` - Componentes React
  - `/contexts` - Contextos React (AuthContext, etc.)
  - `/firebase` - Configuración y servicios de Firebase
  - `/services` - Servicios para APIs externas e internas
  - `/utils` - Utilidades y funciones auxiliares

### Componentes Principales de Pagos

- `TradingChallenge.jsx` - Componente para la compra de desafíos
- `PaymentPage.jsx` - Página de pago con código QR
- `PaymentStatusPage.jsx` - Página de estado del pago
- `PaymentMonitor.jsx` - Componente para monitoreo en segundo plano

### Servicios de Pago

- `PaymentService.js` - Servicio principal para gestión de pagos
- `CryptoWalletManager.js` - Gestión de direcciones de wallet
- `BlockchainMonitor.js` - Monitoreo de transacciones en blockchain

## Licencia

[MIT](LICENSE)
