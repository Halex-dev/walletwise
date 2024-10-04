/** @type {import('tailwindcss').Config} */
import tailwindcssPrimeUI from 'tailwindcss-primeui'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}', // Assicurati che tutte le cartelle siano incluse
    './node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}', // PrimeVue componenti
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3B82F6',
          600: '#2563EB',
        },
        secondary: {
          500: '#10B981',
          600: '#059669',
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [tailwindcssPrimeUI],
}
