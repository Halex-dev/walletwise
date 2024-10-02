<template>
  <div
    class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900"
  >
    <div class="w-full max-w-md">
      <h1
        class="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white"
      >
        {{ $t('pages.auth.login') }}
      </h1>
      <Card class="shadow-lg">
        <template #content>
          <Button
            @click="handleLogin"
            class="w-full p-button-danger mb-4"
            :loading="isLoading"
          >
            <template #icon>
              <i class="pi pi-google mr-2" />
            </template>
            {{ $t('pages.auth.signInWithGoogle') }}
          </Button>
          <Message
            v-if="errorMessage"
            severity="error"
            :closable="true"
            @close="errorMessage = ''"
          >
            {{ errorMessage }}
          </Message>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import Card from 'primevue/card'
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
