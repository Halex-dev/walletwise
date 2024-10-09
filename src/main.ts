import '@/styles/style.css'
import 'primeicons/primeicons.css'

import App from './App.vue'
import { createApp } from 'vue'

// Router
import router from './router'

// PrimeVue
import PrimeVue from 'primevue/config'
import { MyPreset } from '@/components/theme/myTheme'
import i18n from './config/i18n'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'

// Pinia
import { createPinia } from 'pinia'
const pinia = createPinia()

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
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
app.directive('tooltip', Tooltip)
app.use(ToastService)
app.use(ConfirmationService)
app.use(i18n)
app.use(router)
app.use(pinia)
app.mount('#app')
