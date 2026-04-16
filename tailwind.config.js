/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#edf7f1',
          100: '#d4eddf',
          200: '#a8dbbf',
          300: '#73c49a',
          400: '#3daa72',
          500: '#1e8f57',
          600: '#157544',
          700: '#115e36',
          800: '#0d4828',
          900: '#08321c',
        },
        surface: {
          DEFAULT: '#f5f8f5',
          card:    '#ffffff',
          dark:    '#0f1a13',
          'card-dark': '#162019',
        },
      },
      fontFamily: {
        sans: [
          'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont',
          '"Segoe UI"', 'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15,40,20,0.06), 0 1px 2px -1px rgba(15,40,20,0.04)',
        'card-md': '0 4px 12px 0 rgba(15,40,20,0.08), 0 2px 4px -1px rgba(15,40,20,0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
