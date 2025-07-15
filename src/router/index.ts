import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
      },
      {
        path: 'auth/callback',
        name: 'AuthCallback',
        component: () => import('@/views/auth/AuthCallbackView.vue'),
      },
    ],
  },
  {
    path: '/user',
    component: AuthenticatedLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/users/DashboardView.vue'),
      },
      {
        path: 'transactions',
        name: 'transactions',
        component: () => import('@/views/users/TransactionsView.vue'),
      },
      {
        path: 'categories',
        name: 'categories',
        component: () => import('@/views/users/CategoryView.vue'),
      },
      /*{
        path: 'portfolio',
        name: 'portfolio',
        component: () => import('@/views/users/PortfolioView.vue'),
      },*/
      {
        path: 'report',
        name: 'report',
        component: () => import('@/views/users/ReportView.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/users//SettingView.vue'),
      },
      // Other authenticated routes...
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/errors/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthReady) {
    // Se lo stato di autenticazione non è ancora pronto, attendiamo
    await authStore.checkAuth()
  }

  if (to.name === 'AuthCallback') {
    // Permettiamo sempre l'accesso alla route di callback
    return next()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' })
  } else if (authStore.isAuthenticated && to.name === 'Login') {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
