/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        sans: ['IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0B152B',
          50: '#F0F4FA',
          100: '#D9E3F3',
          200: '#ADC2E3',
          800: '#132448',
          900: '#0B152B',
          950: '#070D1C',
        },
        brand: {
          amber: '#F59E0B',
          'amber-hover': '#D97706',
          'amber-light': '#FEF3C7',
          blue: '#1F6FEB',
          'blue-light': '#E0EDFF',
        },
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(11, 21, 43, 0.05), 0 1px 4px -1px rgba(11, 21, 43, 0.03)',
        'soft': '0 10px 30px -4px rgba(11, 21, 43, 0.06), 0 4px 12px -2px rgba(11, 21, 43, 0.03)',
        'soft-lg': '0 20px 40px -6px rgba(11, 21, 43, 0.1), 0 8px 16px -4px rgba(11, 21, 43, 0.04)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glow-blue': '0 0 25px -5px rgba(31, 111, 235, 0.35)',
      },
    },
  },
  plugins: [],
}
