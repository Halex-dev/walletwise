<template>
  <div
    class="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-100 to-primary-300 dark:from-gray-800 dark:to-gray-900"
  >
    <div
      class="w-full max-w-md px-6 py-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl transform transition-all duration-300 hover:scale-105"
    >
      <div class="text-center mb-8">
        <h1
          class="text-4xl font-bold text-primary-700 dark:text-primary-300 mb-2"
        >
          {{ $t('appName') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('pages.auth.welcomeMessage') }}
        </p>
      </div>

      <h2
        class="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white"
      >
        {{ $t('pages.auth.login') }}
      </h2>

      <Button
        @click="handleLogin"
        class="w-full p-3 mb-4 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
        :loading="isLoading"
      >
        <i class="pi pi-google mr-2 text-xl" />
        {{ $t('pages.auth.signInWithGoogle') }}
      </Button>

      <transition name="fade">
        <Message
          v-if="errorMessage"
          severity="error"
          :closable="true"
          @close="errorMessage = ''"
          class="mt-4"
        >
          {{ errorMessage }}
        </Message>
      </transition>

      <div class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>{{ $t('pages.auth.termsNotice') }}</p>
        <div class="mt-2">
          <a href="#" class="text-primary-600 hover:underline">{{
            $t('pages.auth.termsOfService')
          }}</a>
          <span class="mx-2">•</span>
          <a href="#" class="text-primary-600 hover:underline">{{
            $t('pages.auth.privacyPolicy')
          }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import Button from 'primevue/button'
import Message from 'primevue/message'

const authStore = useAuthStore()
const { t } = useI18n()
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    await authStore.loginWithGoogle()
  } catch (error) {
    console.error('Login failed:', error)
    errorMessage.value = t('pages.auth.loginFailed')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
