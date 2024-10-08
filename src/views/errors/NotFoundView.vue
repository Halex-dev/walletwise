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
          {{ t('appName') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('pages.404.subtitle') }}
        </p>
      </div>

      <h2
        class="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white"
      >
        {{ t('pages.404.title') }}
      </h2>

      <p class="text-center text-gray-600 dark:text-gray-400 mb-6">
        {{ t('pages.404.message') }}
      </p>

      <Button
        @click="goHome"
        class="w-full p-3 mb-4 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
      >
        <i class="pi pi-home mr-2 text-xl" />
        {{ t('pages.404.backToHome') }}
      </Button>

      <Button
        @click="goBack"
        class="w-full p-3 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
      >
        <i class="pi pi-arrow-left mr-2 text-xl" />
        {{ t('pages.404.goBack') }}
      </Button>

      <div class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>{{ t('pages.404.helpMessage') }}</p>
        <div class="mt-2">
          <a href="#" class="text-primary-600 hover:underline">{{
            t('pages.404.contactSupport')
          }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'

const router = useRouter()
const { t } = useI18n()

const goHome = () => {
  router.push({ name: 'Home' })
}

const goBack = () => {
  router.go(-1)
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
