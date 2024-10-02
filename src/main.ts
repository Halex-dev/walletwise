import '@/styles/style.css'
import 'primeicons/primeicons.css'

import App from './App.vue'
import { createApp } from 'vue'

// Router
import router from './router'

// PrimeVue
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import i18n from './config/i18n'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
// Pinia
import { createPinia } from 'pinia'
const pinia = createPinia()

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      cssLayer: {
        name: 'primevue',
        order: 'tailwind-base, primevue, tailwind-utilities',
      },
      darkModeSelector: '.darkManager',
    },
  },
  ripple: true,
  unstyled: false,
})
app.use(ToastService)
app.use(ConfirmationService)
app.use(i18n)
app.use(router)
app.use(pinia)
app.mount('#app')
