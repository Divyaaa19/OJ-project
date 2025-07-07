/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
  animation: {
    'spin-slow': 'spin 10s linear infinite',
    float: 'float 6s ease-in-out infinite',
  },
  keyframes: {
    float: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-20px)' },
    },
  },
},

  },
  plugins: [],
  plugins: [require('@tailwindcss/typography')],

}
