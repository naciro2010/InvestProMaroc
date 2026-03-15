/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette Bleu Ardoise - ERP financier professionnel (alignée avec designSystem.ts)
        primary: {
          25: '#f5f7fa',
          50: '#edf1f7',
          100: '#d5dde9',
          200: '#adbdd4',
          300: '#849cbd',
          400: '#617fa8',
          500: '#476693',
          600: '#2D4A6F',  // Main - InvestPro slate blue
          700: '#253d5c',
          800: '#1b2e45',
          900: '#131f30',
        },
        // Gris neutres bleu-gris (alignés designSystem.ts)
        gray: {
          50: '#f4f5f7',
          100: '#ebedf0',
          200: '#dadde2',
          300: '#b4b9c1',
          400: '#8a909a',
          500: '#676d79',
          600: '#4c5260',
          700: '#363b47',
          800: '#222730',
          900: '#14171d',
        },
        // Couleurs sémantiques (alignées designSystem.ts)
        success: {
          25: '#f4f8f5',
          50: '#eaf3ec',
          100: '#cfe3d4',
          200: '#a2ccac',
          500: '#3f8a54',
          600: '#347545',
          700: '#2b6239',
        },
        danger: {
          25: '#fcf6f5',
          50: '#f9edeb',
          100: '#f0d3cf',
          200: '#dea9a2',
          500: '#a44e44',
          600: '#8c3e36',
          700: '#75332d',
        },
        info: {
          25: '#f4f9fb',
          50: '#e8f2f6',
          100: '#cbe2ec',
          200: '#9dcada',
          500: '#3888a0',
          600: '#2e7187',
          700: '#265e70',
        },
        warning: {
          25: '#fdf9f3',
          50: '#f9f1e1',
          100: '#eedcb3',
          200: '#dfc27a',
          500: '#a8831f',
          600: '#8a6c17',
          700: '#725913',
        },
        purple: {
          50: '#efeff6',
          100: '#dbdaec',
          200: '#b5b2d5',
          500: '#635d96',
          600: '#524d80',
          700: '#44406b',
        },
        // Alias sémantiques
        accent: {
          50: '#efeff6',
          100: '#dbdaec',
          200: '#b5b2d5',
          600: '#524d80',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Noto Sans', 'Ubuntu', 'Helvetica Neue', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(9, 30, 66, 0.04)',
        'sm': '0 1px 3px rgba(9, 30, 66, 0.08), 0 0 1px rgba(9, 30, 66, 0.08)',
        'DEFAULT': '0 4px 8px -2px rgba(9, 30, 66, 0.08), 0 0 1px rgba(9, 30, 66, 0.08)',
        'md': '0 4px 8px -2px rgba(9, 30, 66, 0.08), 0 0 1px rgba(9, 30, 66, 0.08)',
        'lg': '0 8px 16px -4px rgba(9, 30, 66, 0.12), 0 0 1px rgba(9, 30, 66, 0.12)',
        'xl': '0 16px 32px -8px rgba(9, 30, 66, 0.16), 0 0 1px rgba(9, 30, 66, 0.12)',
      },
      borderRadius: {
        'DEFAULT': '4px',
        'sm': '3px',
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
