import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Déterminer dynamiquement la base path
const getBasePath = () => {
  // Pour GitHub Pages
  if (process.env.GITHUB_ACTIONS) {
    return '/InvestProMaroc/';
  }
  // Pour Railway et développement local
  return process.env.VITE_BASE_PATH || '/';
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
