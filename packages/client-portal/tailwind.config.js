/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#F6F8F7',
          white: '#FFFFFF',
          50: '#F0F4F2',
          100: '#E8EDEA',
          200: '#D4DDD8',
        },
        ink: {
          DEFAULT: '#1A202C',
          light: '#4A5568',
          muted: '#718096',
          faint: '#A0AEC0',
          ghost: '#CBD5E0',
        },
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        terracotta: {
          50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 300: '#FDBA74',
          400: '#FB923C', 500: '#F97316', 600: '#EA580C', 700: '#C2410C',
          800: '#9A3412', 900: '#7C2D12',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(0,0,0,0.03)',
        'card': '0 1px 2px rgba(0,0,0,0.03), 0 4px 12px -2px rgba(0,0,0,0.04)',
        'elevated': '0 0 0 1px rgba(0,0,0,0.02), 0 2px 8px rgba(0,0,0,0.04), 0 8px 24px -4px rgba(0,0,0,0.06)',
        'float': '0 8px 30px -4px rgba(0,0,0,0.1), 0 4px 10px -2px rgba(0,0,0,0.05)',
        'glow-emerald': '0 0 24px -4px rgba(4,120,87,0.2)',
        'glow-terracotta': '0 0 24px -4px rgba(234,88,12,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out both',
        'fade-in-up-1': 'fadeInUp 0.4s ease-out 0.05s both',
        'fade-in-up-2': 'fadeInUp 0.4s ease-out 0.1s both',
        'fade-in-up-3': 'fadeInUp 0.4s ease-out 0.15s both',
        'fade-in-up-4': 'fadeInUp 0.4s ease-out 0.2s both',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' }, '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
