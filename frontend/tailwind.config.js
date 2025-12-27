/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette GitLab - Simple et Épurée
        gitlab: {
          orange: '#FC6D26',          // Orange principal GitLab
          'orange-dark': '#E24329',   // Orange foncé
          'orange-light': '#FCA326',  // Orange clair
        },
        // Gris GitLab (très important pour le look épuré)
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#DBDBDB',
          400: '#BFBFBF',
          500: '#999999',
          600: '#666666',
          700: '#525252',
          800: '#303030',
          900: '#2E2E2E',
          950: '#1F1F1F',
        },
        // Couleurs sémantiques GitLab (douces)
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#108548',   // Vert GitLab
          600: '#0D6B3D',
        },
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#DD2B0E',   // Rouge GitLab
          600: '#C91C00',
        },
        info: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#1F75CB',   // Bleu GitLab
          600: '#1068BF',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#AB6100',   // Jaune/Orange GitLab
          600: '#9E5A00',
        },
        // Alias pour compatibilité
        primary: {
          50: '#FFF5F0',
          100: '#FFE8DC',
          500: '#FC6D26',
          600: '#E24329',
          700: '#C72A1C',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Noto Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', 'sans-serif'],
        mono: ['Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
      },
    },
  },
  plugins: [],
}
