import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
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

const basePath = getBasePath();

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'InvestPro Maroc',
        short_name: 'InvestPro',
        description: 'Gestion des Investissements Publics au Maroc',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: basePath,
        start_url: basePath,
        icons: [
          {
            src: `${basePath}pwa-192x192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: `${basePath}pwa-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: `${basePath}pwa-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        categories: ['finance', 'productivity', 'business'],
        screenshots: [
          {
            src: `${basePath}screenshots/desktop-1.png`,
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide'
          }
        ]
      },
      workbox: {
        // Cache des routes API
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.investpro\.ma\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.investpro\.ma\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400 // 1 jour
              }
            }
          }
        ],
        // Ne pas cacher les routes API en dev
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/api/]
      },
      devOptions: {
        enabled: false // Désactiver en dev pour éviter les problèmes
      }
    })
  ],
  base: basePath,
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
    historyApiFallback: {
      index: '/',
      disableDotRule: true
    }
  },
  build: {
    // Optimisations de build
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer les console.log en production
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Séparer les vendors pour un meilleur cache
          if (id.includes('node_modules')) {
            if (id.includes('@mui')) {
              return 'mui';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            return 'vendor';
          }
        }
      }
    },
    // Augmenter la limite pour éviter les warnings
    chunkSizeWarningLimit: 1000
  },
  // Optimisation des dépendances
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material']
  }
})
