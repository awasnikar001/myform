const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Poppins', ...defaultTheme.fontFamily.sans]
    },
    extend: {}
  },
  variants: {
    extend: {}
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/forms')]
}
