<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-100 to-primary-300 dark:from-gray-800 dark:to-gray-900"
  >
    <div class="container mx-auto px-4 py-12">
      <header class="text-center mb-12">
        <h1
          class="text-5xl font-bold text-primary-700 dark:text-primary-300 mb-4"
        >
          {{ t('appName') }}
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400">
          {{ t('pages.home.tagline') }}
        </p>
      </header>

      <main
        class="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
      >
        <div class="p-8">
          <h2 class="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
            {{ t('pages.home.welcome') }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ t('pages.home.description') }}
          </p>

          <div class="grid md:grid-cols-2 gap-6 mb-8">
            <div
              v-for="feature in features"
              :key="feature"
              class="flex items-start"
            >
              <i class="pi pi-check-circle text-green-500 mr-2 mt-1"></i>
              <span class="text-gray-700 dark:text-gray-300">{{
                t(`pages.home.features.${feature}`)
              }}</span>
            </div>
          </div>

          <div class="flex justify-center mb-8">
            <Button
              @click="goToLogin"
              class="p-3 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              {{ t('pages.home.getStarted') }}
            </Button>
          </div>

          <div
            class="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 p-4 rounded"
          >
            <p class="text-yellow-700 dark:text-yellow-300">
              <i class="pi pi-info-circle mr-2"></i>
              {{ t('pages.home.developmentNotice') }}
            </p>
          </div>
        </div>
      </main>

      <footer class="text-center mt-12 text-gray-600 dark:text-gray-400">
        <p>{{ t('pages.home.footer') }}</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'

const router = useRouter()
const { t } = useI18n()

const features = ['easyTracking', 'budgeting', 'insights', 'secure']

const goToLogin = () => {
  router.push({ name: 'Login' })
}
</script>
