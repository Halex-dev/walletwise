/** @type {import('tailwindcss').Config} */
import tailwindcssPrimeUI from 'tailwindcss-primeui'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}', // Assicurati che tutte le cartelle siano incluse
    './node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}', // PrimeVue componenti
  ],
  darkMode: 'class',
  plugins: [tailwindcssPrimeUI],
}
