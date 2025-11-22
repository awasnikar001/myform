const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['index.html', './src/**/*.{ts,tsx}'],
  theme: {
    fontFamily: {
      sans: [
        ['Inter', ...defaultTheme.fontFamily.sans],
        {
          fontFeatureSettings: '"cv11"'
        }
      ]
    },
    extend: {
      colors: {
        background: 'rgba(var(--hf-background))',
        foreground: 'rgba(var(--hf-foreground))',
        input: 'rgba(var(--hf-input))',
        primary: {
          DEFAULT: 'rgba(var(--hf-primary))',
          light: 'rgba(var(--hf-primary-light))'
        },
        secondary: {
          DEFAULT: 'rgba(var(--hf-secondary))',
          light: 'rgba(var(--hf-secondary-light))'
        },
        accent: {
          DEFAULT: 'rgba(var(--hf-accent))',
          light: 'rgba(var(--hf-accent-light))'
        },
        error: 'rgba(var(--hf-error))',
        slate: {
          50: 'rgba(var(--hf-slate-50))',
          100: 'rgba(var(--hf-slate-100))',
          200: 'rgba(var(--hf-slate-200))',
          600: 'rgba(var(--hf-slate-600))',
          700: 'rgba(var(--hf-slate-700))',
          800: 'rgba(var(--hf-slate-800))'
        },
        'icon-blue': 'rgba(var(--hf-icon-blue))',
        'icon-purple': 'rgba(var(--hf-icon-purple))',
        'icon-green': 'rgba(var(--hf-icon-green))',
        'icon-amber': 'rgba(var(--hf-icon-amber))',
        // Glass effect colors
        glass: {
          light: 'rgba(255, 255, 255, 0.7)',
          border: 'rgba(255, 255, 255, 0.18)',
          dark: 'rgba(0, 0, 0, 0.6)',
          'border-dark': 'rgba(255, 255, 255, 0.08)'
        }
      },
      backdropBlur: {
        xs: '2px',
        '3xl': '64px'
      },
      screens: {
        'builder-md': '1230px',
        'builder-lg': '1440px'
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(var(--hf-primary), 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(var(--hf-primary), 0.6)' }
        }
      }
    }
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/forms')]
}
