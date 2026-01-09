import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import connect from 'connect'
import history from 'connect-history-api-fallback'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Dynamic base path:
  // - GitHub Pages: /InvestProMaroc/
  // - Railway/Local: /
  base: process.env.VITE_BASE_PATH || '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
    // Support SPA routing with connect-history-api-fallback
    middleware: () => [
      history({
        disableDotRule: true, // Important for handling files with dots
        rewrites: [
          { from: /\/api/, to: '/api' }, // Preserve API routes
          { from: /./, to: '/index.html' } // Fallback to index.html
        ]
      })
    ]
  },
  // Add build configuration to support SPA routing
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
