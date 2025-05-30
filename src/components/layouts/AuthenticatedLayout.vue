<template>
  <div class="flex h-screen bg-surface-50 dark:bg-surface-950">
    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="isMobile && isSidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="closeMobileSidebar"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'bg-surface-900 text-white transition-all duration-300 ease-in-out z-50',
        isMobile
          ? `fixed inset-y-0 left-0 transform w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
          : `relative ${isSidebarCollapsed ? 'w-20' : 'w-64'}`,
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo Section -->
        <div
          class="flex items-center justify-between p-4 border-b border-surface-700/50"
        >
          <div
            v-if="!isSidebarCollapsed || isMobile"
            class="flex items-center space-x-3"
          >
            <div
              class="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center"
            >
              <i class="pi pi-wallet text-white text-sm"></i>
            </div>
            <h1 class="text-xl font-bold text-white">WalletWise</h1>
          </div>

          <Button
            @click="toggleSidebar"
            :icon="getSidebarToggleIcon"
            severity="secondary"
            text
            rounded
            size="small"
            class="hover:bg-surface-700/50"
            :aria-label="
              isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
            "
          />
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-4">
          <div v-for="section in menuSections" :key="section.key" class="mb-6">
            <!-- Section Title -->
            <div
              v-if="section.title && (!isSidebarCollapsed || isMobile)"
              class="px-4 mb-2"
            >
              <h3
                class="text-xs font-semibold text-surface-400 uppercase tracking-wider"
              >
                {{ $t(section.title) }}
              </h3>
            </div>

            <!-- Menu Items -->
            <ul class="space-y-1 px-2">
              <li v-for="item in section.items" :key="item.key">
                <Button
                  @click="handleMenuClick(item)"
                  :disabled="item.disabled"
                  :class="[
                    'w-full transition-all duration-200',
                    isSidebarCollapsed && !isMobile
                      ? 'justify-center px-2'
                      : 'justify-start px-3',
                    getMenuItemClasses(item),
                  ]"
                  class="py-2.5 rounded-lg text-left"
                  text
                  :aria-label="$t(item.label)"
                >
                  <template #icon>
                    <i
                      :class="[
                        'pi',
                        item.icon,
                        'text-base',
                        !isSidebarCollapsed || isMobile ? 'mr-3' : '',
                      ]"
                    ></i>
                  </template>

                  <span
                    v-if="!isSidebarCollapsed || isMobile"
                    class="font-medium"
                  >
                    {{ $t(item.label) }}
                  </span>

                  <Tag
                    v-if="item.disabled && (!isSidebarCollapsed || isMobile)"
                    value="Soon"
                    severity="secondary"
                    size="small"
                    class="ml-auto"
                  />
                </Button>
              </li>
            </ul>
          </div>
        </nav>

        <!-- User Section -->
        <div class="border-t border-surface-700/50 p-4">
          <Button
            @click="handleLogout"
            icon="pi pi-sign-out"
            :class="[
              'w-full text-surface-300 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200',
              isSidebarCollapsed && !isMobile
                ? 'justify-center px-2'
                : 'justify-start px-3',
            ]"
            class="py-2.5 rounded-lg"
            severity="secondary"
            text
            :aria-label="$t('common.logout')"
          >
            <span
              v-if="!isSidebarCollapsed || isMobile"
              class="font-medium ml-3"
            >
              {{ $t('common.logout') }}
            </span>
          </Button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header
        class="bg-surface-0 dark:bg-surface-800 shadow-sm border-b border-surface-200 dark:border-surface-700"
      >
        <div class="px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center space-x-4">
              <!-- Mobile menu button -->
              <Button
                v-if="isMobile"
                @click="toggleSidebar"
                icon="pi pi-bars"
                severity="secondary"
                text
                rounded
                class="md:hidden"
                aria-label="Toggle sidebar"
              />

              <div>
                <h1
                  class="text-2xl font-bold text-surface-900 dark:text-surface-0"
                >
                  {{ currentPageTitle }}
                </h1>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <!-- Quick Actions 
              <div class="hidden sm:flex items-center space-x-2">
                <Button
                  :label="$t('common.addTransaction')"
                  icon="pi pi-plus"
                  size="small"
                  class="bg-primary-600 hover:bg-primary-700"
                />
              </div>-->

              <!-- User Avatar -->
              <Avatar
                :label="appUser?.username[0].toUpperCase()"
                class="bg-gradient-to-br from-primary-400 to-primary-600"
                size="normal"
                shape="circle"
              />
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="p-4 sm:p-6 lg:p-8">
          <!-- Main Content Area -->
          <div class="pl-6 pr-6">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { appUser } = storeToRefs(authStore)

// Composables
const { t } = useI18n()
const router = useRouter()
const toast = useToast()

// Reactive state
const isSidebarOpen = ref(false)
const isSidebarCollapsed = ref(false)
const isMobile = ref(false)

// Menu configuration
const menuSections = computed(() => [
  {
    key: 'main',
    items: [
      {
        key: 'dashboard',
        label: 'nav.dashboard',
        icon: 'pi-home',
        to: '/user/',
        disabled: false,
      },
    ],
  },
  {
    key: 'financial',
    title: 'nav.financialControl',
    items: [
      {
        key: 'budget',
        label: 'nav.budget',
        icon: 'pi-chart-bar',
        to: '/user/budget',
        disabled: true,
      },
      {
        key: 'report',
        label: 'nav.report',
        icon: 'pi-chart-pie',
        to: '/user/report',
        disabled: false,
      },
      {
        key: 'portfolio',
        label: 'nav.portfolio',
        icon: 'pi-wallet',
        to: '/user/portfolio',
        disabled: true,
      },
      {
        key: 'subscriptions',
        label: 'nav.subscriptions',
        icon: 'pi-calendar',
        to: '/user/subscriptions',
        disabled: true,
      },
    ],
  },
  {
    key: 'movements',
    title: 'nav.movements',
    items: [
      {
        key: 'transactions',
        label: 'nav.transactions',
        icon: 'pi-list',
        to: '/user/transactions',
        disabled: false,
      },
    ],
  },
  {
    key: 'others',
    title: 'nav.others',
    items: [
      {
        key: 'categories',
        label: 'nav.categories',
        icon: 'pi-chart-line',
        to: '/user/categories',
        disabled: false,
      },
      {
        key: 'settings',
        label: 'nav.settings',
        icon: 'pi-cog',
        to: '/user/settings',
        disabled: false,
      },
    ],
  },
])

// Stats data
const statsCards = ref([
  {
    title: 'dashboard.totalBalance',
    value: '€2,543.20',
    change: '+12.5%',
    positive: true,
  },
  {
    title: 'dashboard.monthlyExpenses',
    value: '€1,230.45',
    change: '-8.2%',
    positive: true,
  },
  {
    title: 'dashboard.savingsGoal',
    value: '65%',
    change: '+5.1%',
    positive: true,
  },
])

// Computed properties
const currentPageTitle = computed(() => {
  const route = router.currentRoute.value
  return t(`pages.${route.name?.toString()}.title`) || t('nav.dashboard')
})

const getSidebarToggleIcon = computed(() => {
  if (isMobile.value) {
    return 'pi pi-times'
  }
  return isSidebarCollapsed.value ? 'pi pi-angle-right' : 'pi pi-angle-left'
})

// Methods
const checkScreenSize = () => {
  const width = window.innerWidth
  isMobile.value = width < 768

  // Auto-collapse sidebar on tablet
  if (width < 1024 && width >= 768) {
    isSidebarCollapsed.value = true
  }

  // Close mobile sidebar on desktop
  if (width >= 768 && isSidebarOpen.value) {
    isSidebarOpen.value = false
  }
}

const toggleSidebar = () => {
  if (isMobile.value) {
    isSidebarOpen.value = !isSidebarOpen.value
  } else {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
    // Save preference
    localStorage.setItem(
      'sidebarCollapsed',
      isSidebarCollapsed.value.toString()
    )
  }
}

const closeMobileSidebar = () => {
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
}

const handleMenuClick = (item: any) => {
  if (item.disabled) return

  router.push(item.to)

  // Close mobile sidebar after navigation
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
}

const getMenuItemClasses = (item: any) => {
  const isActive = router.currentRoute.value.path === item.to

  if (isActive) {
    return 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
  } else if (item.disabled) {
    return 'text-surface-500 cursor-not-allowed opacity-60'
  } else {
    return 'text-surface-300 hover:bg-surface-700/50 hover:text-white'
  }
}

const handleLogout = async () => {
  try {
    // Add your logout logic here
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('common.logoutSuccess'),
      life: 3000,
    })

    router.push('/login')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('common.logoutError'),
      life: 3000,
    })
  }
}

// Lifecycle
onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)

  // Restore sidebar state
  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState !== null) {
    isSidebarCollapsed.value = savedState === 'true'
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
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

/* Custom scrollbar for sidebar */
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
