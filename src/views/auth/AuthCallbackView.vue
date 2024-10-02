<template>
  <div
    class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900"
  >
    <Card class="w-full max-w-md">
      <template #title>
        <h1
          class="text-2xl font-bold text-center text-gray-900 dark:text-white"
        >
          {{ $t('auth.completingLogin') }}
        </h1>
      </template>
      <template #content>
        <ProgressSpinner v-if="loading" class="w-16 h-16 mx-auto" />
        <Message v-if="error" severity="error" :closable="false" class="mt-4">
          {{ error }}
        </Message>
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

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    await authStore.handleAuthCallback()
    router.push({ name: 'dashboard' })
  } catch (err) {
    console.error('Auth callback failed:', err)
    error.value = t('auth.loginFailed')
  } finally {
    loading.value = false
  }
})
</script>
