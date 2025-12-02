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
        sans: ['Inter', 'Tajawal', 'sans-serif'],
      },
      colors: {
        medical: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e'
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706'
        }
      },
      animation: {
        'bounce-drop': 'bounceDrop 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'shake': 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both'
      },
      keyframes: {
        bounceDrop: {
          '0%': { transform: 'translateY(-500%)', opacity: '0' },
          '60%': { transform: 'translateY(0)', opacity: '1' },
          '75%': { transform: 'translateY(-20px)' },
          '100%': { transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
        }
      }
    },
  },
  plugins: [],
}