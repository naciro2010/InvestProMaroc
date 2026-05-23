/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette Emeraude private banking (alignée avec designSystem.ts)
        primary: {
          25: '#f3fbf7',
          50: '#e7f7ef',
          100: '#c8ecdc',
          200: '#97dcc0',
          300: '#5fcca0',
          400: '#2dbf90',
          500: '#1bb482',
          600: '#14a374',  // Main - accent emeraude
          700: '#059669',
          800: '#047857',
          900: '#065f46',
        },
        // Gris neutres "ink" (alignés designSystem.ts)
        gray: {
          50: '#f1f5f9',
          100: '#e8eaee',
          200: '#c4c8d2',
          300: '#a0a6b4',
          400: '#7d8494',
          500: '#5a6275',
          600: '#3d4556',
          700: '#2a3142',
          800: '#1c2333',
          900: '#0a0f1a',
        },
        // Couleurs sémantiques (alignées designSystem.ts)
        success: {
          25: '#f3fbf7',
          50: '#ecfdf5',
          100: '#c8ecdc',
          200: '#97dcc0',
          500: '#16b386',
          600: '#14a374',
          700: '#047857',
        },
        danger: {
          25: '#fef5f5',
          50: '#fef2f2',
          100: '#fde0e0',
          200: '#fab8b8',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          25: '#f5f9ff',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        warning: {
          25: '#fffcf2',
          50: '#fffbeb',
          100: '#fdf0c8',
          200: '#fbdf8c',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        purple: {
          50: '#f3effe',
          100: '#e9e0fd',
          200: '#d4c4fb',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // Alias sémantiques
        accent: {
          50: '#e7f7ef',
          100: '#c8ecdc',
          200: '#97dcc0',
          600: '#14a374',
        },
      },
      fontFamily: {
        sans: ["'Instrument Sans'", 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ["'IBM Plex Mono'", 'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(15, 23, 42, 0.04)',
        'sm': '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 0 rgba(15, 23, 42, 0.02)',
        'DEFAULT': '0 2px 4px rgba(15, 23, 42, 0.04), 0 1px 0 rgba(15, 23, 42, 0.02)',
        'md': '0 2px 4px rgba(15, 23, 42, 0.04), 0 1px 0 rgba(15, 23, 42, 0.02)',
        'lg': '0 8px 24px rgba(15, 23, 42, 0.06), 0 2px 4px rgba(15, 23, 42, 0.03)',
        'xl': '0 24px 60px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        'DEFAULT': '6px',
        'xs': '3px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
