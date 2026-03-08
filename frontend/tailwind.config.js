/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette Odoo - Violet professionnel (alignée avec designSystem.ts)
        primary: {
          25: '#f8f6f9',
          50: '#f2edf3',
          100: '#e4d8e7',
          200: '#cab3d0',
          300: '#af8db8',
          400: '#946aa0',
          500: '#7f5189',
          600: '#714B67',  // Main - Odoo inspired purple
          700: '#5f4058',
          800: '#473043',
          900: '#332431',
        },
        // Gris neutres chauds (alignés designSystem.ts)
        gray: {
          50: '#f5f5f6',
          100: '#eeeff0',
          200: '#dddee0',
          300: '#b8babe',
          400: '#8e9196',
          500: '#6b6f75',
          600: '#4f5359',
          700: '#383c42',
          800: '#24272d',
          900: '#16181c',
        },
        // Couleurs sémantiques (alignées designSystem.ts)
        success: {
          25: '#f6f9f7',
          50: '#edf5ef',
          100: '#d4e8d9',
          200: '#a8d4b2',
          500: '#4a9660',
          600: '#3d7f52',
          700: '#336a45',
        },
        danger: {
          25: '#fdf7f7',
          50: '#faeeed',
          100: '#f2d5d2',
          200: '#e0a8a3',
          500: '#a84d45',
          600: '#93403a',
          700: '#7b3531',
        },
        info: {
          25: '#f6f9fa',
          50: '#eaf1f4',
          100: '#cedfea',
          200: '#a3c5d6',
          500: '#42809d',
          600: '#366b84',
          700: '#2d596e',
        },
        warning: {
          25: '#fdfaf5',
          50: '#faf3e3',
          100: '#f0e0b8',
          200: '#e2c880',
          500: '#ad8a20',
          600: '#8f7218',
          700: '#755e15',
        },
        purple: {
          50: '#f0eef6',
          100: '#ddd8ec',
          200: '#b9b0d4',
          500: '#6d6199',
          600: '#5b5187',
          700: '#4c4372',
        },
        // Alias sémantiques
        accent: {
          50: '#f0eef6',
          100: '#ddd8ec',
          200: '#b9b0d4',
          600: '#5b5187',
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
