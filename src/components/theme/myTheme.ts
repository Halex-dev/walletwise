import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'

export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#E8EFF8', // Blu molto chiaro, quasi bianco
      100: '#C9D8EF', // Blu chiarissimo
      200: '#A8BFE4', // Blu leggero
      300: '#87A5D6', // Blu medio-chiaro
      400: '#6C8FC7', // Blu chiaro, ma più intenso
      500: '#5076B7', // Blu medio
      600: '#3B66A5', // Blu più scuro, intenso
      700: '#315992', // Blu profondo, ma meno intenso del 800
      800: '#284C85', // Blu profondo, quasi navy
      900: '#1F4E8C', // Colore fornito (blu scuro, ricco e vibrante)
      950: '#163B6D', // Blu molto scuro, profondo e intenso
    },
    secondary: {
      50: '#FFF8E5', // Arancione chiaro
      100: '#FFE7BF', // Arancione delicato
      200: '#FFD597', // Arancione tenue
      300: '#FFC36D', // Arancione medio
      400: '#FFB34B', // Arancione acceso
      500: '#FFAB40', // Colore fornito per secondario
      600: '#FF9A36', // Variante più scura
      700: '#FF892B', // Più intensa
      800: '#FF7821', // Quasi rosso-arancione
      900: '#FF610E', // Molto intenso
      950: '#CC4D0A', // Variante profonda
    },
  },
})
