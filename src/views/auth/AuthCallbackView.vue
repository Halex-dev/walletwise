<template>
  <div
    class="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-100 to-primary-300 dark:from-gray-800 dark:to-gray-900"
  >
    <Card class="w-full max-w-md shadow-2xl">
      <template #title>
        <h1
          class="text-3xl font-bold text-center text-primary-700 dark:text-primary-300 mb-4"
        >
          {{ $t('appName') }}
        </h1>
      </template>
      <template #content>
        <div class="text-center">
          <h2 class="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
            {{ $t('pages.auth.completingLogin') }}
          </h2>

          <div v-if="loading" class="mb-6">
            <ProgressSpinner
              class="w-20 h-20 mx-auto"
              strokeWidth="4"
              fill="var(--surface-ground)"
              animationDuration=".5s"
            />
            <p class="mt-4 text-gray-600 dark:text-gray-400">
              {{ loadingMessage }}
            </p>
          </div>

          <div v-if="success" class="mb-6">
            <i class="pi pi-check-circle text-5xl text-green-500 mb-4"></i>
            <p class="text-lg text-gray-800 dark:text-white">
              {{ $t('pages.auth.loginSuccessful') }}
            </p>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              {{ $t('pages.auth.redirecting') }}
            </p>
          </div>

          <Message v-if="error" severity="error" :closable="false" class="mt-4">
            <template #content>
              <div class="flex flex-col items-center">
                <i class="pi pi-times-circle text-4xl mb-2"></i>
                <p>{{ error }}</p>
                <Button @click="retryLogin" class="mt-4 p-button-outlined">
                  {{ $t('pages.auth.retryLogin') }}
                </Button>
              </div>
            </template>
          </Message>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import Card from 'primevue/card'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Button from 'primevue/button'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const success = ref(false)
const loadingMessage = ref(t('pages.auth.verifyingCredentials'))

const loadingMessages = [
  t('pages.auth.verifyingCredentials'),
  t('pages.auth.settingUpAccount'),
  t('pages.auth.almostThere'),
]

let messageIndex = 0
const messageInterval = setInterval(() => {
  messageIndex = (messageIndex + 1) % loadingMessages.length
  loadingMessage.value = loadingMessages[messageIndex]
}, 3000)

onMounted(async () => {
  try {
    await authStore.handleAuthCallback()
    loading.value = false
    success.value = true
    setTimeout(() => {
      router.push({ name: 'dashboard' })
    }, 2000)
  } catch (err) {
    console.error('Auth callback failed:', err)
    loading.value = false
    error.value = t('pages.auth.loginFailed')
  } finally {
    clearInterval(messageInterval)
  }
})

const retryLogin = () => {
  router.push({ name: 'login' })
}
</script>

<style scoped>
.p-card {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.dark .p-card {
  background-color: rgba(30, 41, 59, 0.9);
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.p-progressspinner {
  animation: pulse 2s infinite;
}
</style>
