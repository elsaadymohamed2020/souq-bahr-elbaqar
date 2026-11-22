import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        heading: ['Cairo', 'sans-serif'],
        sans: ['IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Semantic tokens (switch with the .dark class, see src/index.css)
        canvas: 'rgb(var(--bg) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          2: 'rgb(var(--surface-2) / <alpha-value>)',
          3: 'rgb(var(--surface-3) / <alpha-value>)',
        },
        fg: {
          DEFAULT: 'rgb(var(--fg) / <alpha-value>)',
          muted: 'rgb(var(--fg-muted) / <alpha-value>)',
          subtle: 'rgb(var(--fg-subtle) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--line) / <alpha-value>)',
          strong: 'rgb(var(--line-strong) / <alpha-value>)',
        },
        // Brand primitives
        ink: {
          DEFAULT: '#0B152B',
          50: '#F0F4FA',
          100: '#D9E3F3',
          200: '#ADC2E3',
          700: '#1A2D55',
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
      borderRadius: {
        card: '1rem',
      },
      boxShadow: {
        'soft-sm': '0 1px 2px rgba(11, 21, 43, 0.04), 0 1px 3px rgba(11, 21, 43, 0.04)',
        soft: '0 8px 24px -6px rgba(11, 21, 43, 0.08), 0 2px 6px -2px rgba(11, 21, 43, 0.04)',
        'soft-lg': '0 24px 48px -12px rgba(11, 21, 43, 0.18), 0 8px 16px -8px rgba(11, 21, 43, 0.08)',
        lift: '0 14px 30px -12px rgba(11, 21, 43, 0.22)',
        'glow-amber': '0 8px 24px -8px rgba(245, 158, 11, 0.55)',
        'glow-blue': '0 0 25px -5px rgba(31, 111, 235, 0.35)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(-100%)' },
        },
        bump: {
          '0%, 100%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.18)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
      animation: {
        bump: 'bump 450ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) 3',
      },
    },
  },
  plugins: [animate],
};
