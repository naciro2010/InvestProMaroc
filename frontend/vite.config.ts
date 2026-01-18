import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Déterminer dynamiquement la base path
const getBasePath = () => {
  // Priorité 1: Variable explicite VITE_BASE_PATH (utilisée par GitHub Pages workflow)
  if (process.env.VITE_BASE_PATH && process.env.VITE_BASE_PATH !== '/') {
    return process.env.VITE_BASE_PATH;
  }
  // Priorité 2: GitHub Pages (vérification supplémentaire)
  if (process.env.GITHUB_ACTIONS) {
    return '/InvestProMaroc/';
  }
  // Défaut: Railway et développement local
  return '/';
};

export default defineConfig({
  plugins: [
    react()
  ],
  base: getBasePath(),
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
  },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material']
  }
})
