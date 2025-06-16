import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    open: true,
    cors: {
      origin: [
        'http://localhost:3000', 
        'http://localhost:5173', 
        'http://whapy.com',
        'https://whapy.com'
      ],
      credentials: true
    }
    // 🔧 PROXY DESHABILITADO - Usando directamente whapy.com
    // proxy: {
    //   // Configuración de proxy comentada temporalmente
    // }
  },
  optimizeDeps: {
    include: ['tronweb/dist/TronWeb.js'],
    exclude: ['tronweb/dist/TronWeb.node.js']
  },
  resolve: {
    alias: {
      'crypto': 'crypto-js'
    }
  },
  build: {
    target: 'es2020',
    commonjsOptions: {
      include: [/tronweb/, /node_modules/]
    },
    outDir: 'dist',
    sourcemap: true
  },
  // 🔧 Definiciones globales para variables de entorno
  define: {
    __MT5_API_URL__: JSON.stringify(process.env.VITE_MT5_API_URL),
    __ENVIRONMENT__: JSON.stringify(process.env.VITE_ENVIRONMENT || 'development'),
    __API_VERSION__: JSON.stringify(process.env.VITE_API_VERSION || 'v1')
  }
})
