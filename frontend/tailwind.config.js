/** @type {import('tailwindcss').Config} */
// Palette « Registre » — miroir de src/lib/designSystem.ts
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Encre bleu nuit (600 = principale)
        primary: {
          25: '#f7f3ea',
          50: '#e3e7ef',
          100: '#d5dbe6',
          200: '#c9d0de',
          300: '#9aa6bd',
          400: '#56657f',
          500: '#2f4160',
          600: '#1c2a44',
          700: '#16223a',
          800: '#111a2d',
          900: '#0b1220',
        },
        // Gris chauds (papier / encre)
        gray: {
          50: '#f2ede2',
          100: '#ece5d6',
          200: '#ddd5c4',
          300: '#c9c0ad',
          400: '#a39d90',
          500: '#6f6f68',
          600: '#5f6068',
          700: '#3d4556',
          800: '#24344f',
          900: '#1c2a44',
        },
        success: {
          25: '#f1f6f2',
          50: '#e1ede5',
          100: '#d0e3d6',
          200: '#bfd6c7',
          500: '#3a7552',
          600: '#2e6a47',
          700: '#245b3c',
          800: '#1c4a30',
        },
        danger: {
          25: '#fbf2f0',
          50: '#f6e3df',
          100: '#f0d4ce',
          200: '#e6c4bd',
          500: '#a83e30',
          600: '#8e2a1f',
          700: '#7a2219',
        },
        info: {
          25: '#f3f5f9',
          50: '#e3e7ef',
          100: '#d5dbe6',
          200: '#c9d0de',
          500: '#4a5a78',
          600: '#34466a',
          700: '#24344f',
        },
        warning: {
          25: '#fbf6ea',
          50: '#f5ead2',
          100: '#efe0bd',
          200: '#e6d2a6',
          500: '#a87c24',
          600: '#93691a',
          700: '#7d5a12',
        },
        // Laiton (clé historique « purple »)
        purple: {
          50: '#f3ecd9',
          100: '#ebdfc0',
          200: '#dccaa0',
          500: '#a58a4a',
          600: '#8c7439',
          700: '#735e2d',
        },
        brass: {
          DEFAULT: '#a58a4a',
          light: '#c9b27a',
        },
        paper: '#efe9dd',
        surface: {
          DEFAULT: '#fffdf8',
          alt: '#f7f3ea',
        },
        accent: {
          50: '#f3ecd9',
          100: '#ebdfc0',
          200: '#dccaa0',
          600: '#a58a4a',
        },
      },
      fontFamily: {
        sans: ["'Source Sans 3'", "'Segoe UI'", 'system-ui', '-apple-system', 'sans-serif'],
        serif: ["'EB Garamond'", 'Georgia', "'Times New Roman'", 'serif'],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(28, 42, 68, 0.06)',
        'sm': '0 1px 1px rgba(28, 42, 68, 0.04), 0 1px 0 rgba(28, 42, 68, 0.03)',
        'DEFAULT': '0 1px 1px rgba(28, 42, 68, 0.04), 0 1px 0 rgba(28, 42, 68, 0.03), 0 14px 34px -20px rgba(28, 42, 68, 0.24)',
        'md': '0 1px 1px rgba(28, 42, 68, 0.04), 0 1px 0 rgba(28, 42, 68, 0.03), 0 14px 34px -20px rgba(28, 42, 68, 0.24)',
        'lg': '0 2px 4px rgba(28, 42, 68, 0.08), 0 12px 26px -14px rgba(28, 42, 68, 0.35)',
        'xl': '0 30px 60px -20px rgba(28, 42, 68, 0.55)',
      },
      borderRadius: {
        'DEFAULT': '6px',
        'xs': '4px',
        'sm': '4px',
        'md': '6px',
        'lg': '10px',
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
