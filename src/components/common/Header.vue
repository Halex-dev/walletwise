<template>
  <header class="bg-white dark:bg-gray-800 shadow">
    <div class="container mx-auto px-6 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <button
            @click="$emit('toggle-sidebar')"
            class="text-gray-500 focus:outline-none lg:hidden"
          >
            <i class="pi pi-bars"></i>
          </button>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white ml-4">
            {{ pageTitle }}
          </h2>
        </div>
        <div class="flex items-center">
          <Button
            @click="toggleDarkMode"
            icon="pi pi-moon"
            class="p-button-rounded p-button-text mr-2"
            v-tooltip.bottom="
              isDarkMode ? $t('common.lightMode') : $t('common.darkMode')
            "
          />
          <Dropdown
            v-model="selectedLocale"
            :options="localeOptions"
            optionLabel="name"
            optionValue="code"
            class="w-32 mr-2"
          />
          <Button
            @click="logout"
            icon="pi pi-sign-out"
            class="p-button-rounded p-button-danger p-button-text"
            v-tooltip.bottom="$t('common.logout')"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import { useAuthStore } from '@/stores/authStore'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const isDarkMode = ref(localStorage.getItem('darkMode') === 'true')
const selectedLocale = ref(localStorage.getItem('locale') || 'en')
const localeOptions = [
  { name: 'English', code: 'en' },
  { name: 'Italiano', code: 'it' },
]

const pageTitle = computed(() => {
  const route = router.currentRoute.value
  return t(`pages.${route.name}`)
})

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('darkMode', isDarkMode.value.toString())
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

defineEmits(['toggle-sidebar'])
</script>
