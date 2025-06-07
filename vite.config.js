import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
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
    }
  }
})
