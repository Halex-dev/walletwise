<template>
  <div
    class="flex h-screen bg-surface-0 dark:bg-surface-900 text-surface-700 dark:text-surface-0"
  >
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-primary-900 text-white transition-all duration-300 ease-in-out',
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
          :aria-label="
            isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
          "
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
                aria-label="Toggle sidebar"
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
import { ref, computed, provide, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

/*
              <Button
                @click="toggleTheme"
                :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
                class="p-button-rounded p-button-text"
                :class="isDark ? 'text-yellow-400' : 'text-surface-600'"
                v-tooltip.bottom="
                  isDark ? $t('common.lightMode') : $t('common.darkMode')
                "
              />
*/
//const { isDark, toggleTheme } = useTheme()

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { appUser } = storeToRefs(authStore)

import { useToastManager } from '@/utils/toastManager'
import { storeToRefs } from 'pinia'
const toastManager = useToastManager()

const isSidebarCollapsed = ref(
  localStorage.getItem('sidebarCollapsed') === 'true'
)

const updateLanguage = (newLanguage: string) => {
  locale.value = newLanguage
}

onMounted(async () => {
  if (!appUser.value) {
    await authStore.checkAuth()
  }
  if (appUser.value) {
    updateLanguage(appUser.value.language)
  }
})

defineExpose({ updateLanguage })
provide('updateLanguage', updateLanguage)

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
  {
    label: t('nav.portfolio'),
    icon: 'pi-wallet',
    to: '/user/portfolio',
  },
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
  try {
    await authStore.logout()
    router.push('/login')
    toastManager.showSuccess('common.logoutSuccess')
  } catch (error) {
    console.error('Logout error:', error)
    toastManager.showError('common.logoutError')
  }
}
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
