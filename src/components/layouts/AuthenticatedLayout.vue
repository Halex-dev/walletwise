<template>
  <div
    class="flex h-screen bg-surface-0 dark:bg-surface-900 text-surface-700 dark:text-surface-0"
  >
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-primary-700 text-white transition-all duration-300 ease-in-out',
        isSidebarCollapsed ? 'w-20' : 'w-64',
      ]"
    >
      <div class="flex items-center justify-between p-4">
        <h1 v-if="!isSidebarCollapsed" class="text-2xl font-semibold">
          WalletWise
        </h1>
        <button
          @click="toggleSidebar"
          class="p-2 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <i
            :class="[
              'pi',
              isSidebarCollapsed ? 'pi-angle-right' : 'pi-angle-left',
            ]"
          ></i>
        </button>
      </div>
      <nav>
        <ul>
          <li v-for="item in menuItems" :key="item.to">
            <router-link
              :to="item.to"
              class="flex items-center p-4 hover:bg-primary-600 transition-colors duration-200"
              :class="{ 'justify-center': isSidebarCollapsed }"
            >
              <i :class="['pi', item.icon, 'mr-2']"></i>
              <span v-if="!isSidebarCollapsed">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-surface-0 dark:bg-surface-800 shadow">
        <div class="container mx-auto px-6 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <button
                @click="toggleSidebar"
                class="text-surface-600 dark:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-400 lg:hidden"
              >
                <i class="pi pi-bars"></i>
              </button>
              <h2
                class="text-2xl font-bold text-surface-800 dark:text-surface-100 ml-4"
              >
                {{ pageTitle }}
              </h2>
            </div>
            <div class="flex items-center space-x-4">
              <Button
                @click="toggleTheme"
                :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
                class="p-button-rounded p-button-text"
                :class="isDark ? 'text-yellow-400' : 'text-surface-600'"
                v-tooltip.bottom="
                  isDark ? $t('common.lightMode') : $t('common.darkMode')
                "
              />
              <Select
                v-model="selectedLocale"
                :options="localeOptions"
                optionLabel="name"
                optionValue="code"
                class="w-32"
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

      <!-- Page Content -->
      <main
        class="flex-1 overflow-x-hidden overflow-y-auto bg-surface-100 dark:bg-gray-900"
      >
        <div class="container mx-auto px-6 py-8">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/composables/useThemes'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { isDark, toggleTheme } = useTheme()

const selectedLocale = ref(localStorage.getItem('locale') || 'en')
const isSidebarCollapsed = ref(
  localStorage.getItem('sidebarCollapsed') === 'true'
)

const localeOptions = [
  { name: 'English', code: 'en' },
  { name: 'Italiano', code: 'it' },
]

const menuItems = computed(() => [
  { label: t('nav.dashboard'), icon: 'pi-home', to: '/user/' },
  {
    label: t('nav.transactions'),
    icon: 'pi-list',
    to: '/user/transactions',
  },
  {
    label: t('nav.categories'),
    icon: 'pi-chart-line',
    to: '/user/categories',
  },
  //{ label: t('nav.assets'), icon: 'pi-wallet', to: '/user/assets' },
  //{ label: t('nav.reports'), icon: 'pi-chart-line', to: '/user/reports' },
  { label: t('nav.settings'), icon: 'pi-cog', to: '/user/settings' },
])

const pageTitle = computed(() => {
  const route = router.currentRoute.value
  return t(`pages.${route.name?.toString()}.title`)
})

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.value.toString())
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Watch for locale changes
watch(selectedLocale, (newLocale) => {
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
