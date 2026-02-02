import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Déterminer dynamiquement la base path
const getBasePath = () => {
  if (process.env.VITE_BASE_PATH && process.env.VITE_BASE_PATH !== '/') {
    return process.env.VITE_BASE_PATH
  }
  if (process.env.GITHUB_ACTIONS) {
    return '/InvestProMaroc/'
  }
  return '/'
}

export default defineConfig({
  plugins: [react()],
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
    // Modern target for better tree shaking and smaller bundles
    target: 'esnext',
    // esbuild is fastest minifier
    minify: 'esbuild',
    // Disable source maps in production for smaller bundles
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Manual chunks for better caching and parallel loading
        manualChunks: {
          // React core - rarely changes
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // MUI components - large but stable
          'mui-core': ['@mui/material', '@mui/system'],
          'mui-icons': ['@mui/icons-material'],
          // Charts - only loaded when needed
          'charts': ['recharts'],
          // Utilities
          'utils': ['axios', 'date-fns', 'lodash'],
          // DnD Kit
          'dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'recharts',
      'axios',
      'date-fns',
    ],
    // Exclude large dependencies that are already optimized
    exclude: ['@mui/x-date-pickers'],
  },
  // Enable faster HMR in development
  esbuild: {
    // Remove console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
