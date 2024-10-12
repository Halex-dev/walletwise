import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth'
import { userService } from '@/services/supabase/user'
import { User } from '@supabase/supabase-js'
import { User as AppUser } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const appUser = ref<AppUser | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const isAuthReady = ref(false)

  async function setUser(authUser: User | null) {
    user.value = authUser
    appUser.value = authUser ? await userService.getCurrentUser(authUser) : null
    isAuthReady.value = true
  }

  async function loginWithGoogle() {
    try {
      await authService.loginWithGoogle()
    } catch (error) {
      console.error('Login fallito:', error)
      throw error
    }
  }

  async function handleAuthCallback() {
    try {
      const authUser = await authService.handleAuthCallback()
      await setUser(authUser)
      return authUser
    } catch (error) {
      console.error('Callback di autenticazione fallito:', error)
      isAuthReady.value = true
      throw error
    }
  }

  async function logout() {
    try {
      await authService.logout()
      await setUser(null)
    } catch (error) {
      console.error('Logout fallito:', error)
      throw error
    }
  }

  async function checkAuth() {
    try {
      const currentUser = await authService.getCurrentUser()
      await setUser(currentUser)
    } catch (error) {
      console.error('Controllo autenticazione fallito:', error)
      await setUser(null)
    }
  }

  function onAuthStateChange(callback: (user: User | null) => void) {
    return authService.onAuthStateChange(async (newUser) => {
      await setUser(newUser)
      callback(newUser)
    })
  }

  async function updateUser(id: string, updatedFields: Partial<AppUser>) {
    try {
      if (!appUser.value) {
        throw new Error('Utente non trovato')
      }

      appUser.value = await userService.updateUser(id, updatedFields)
    } catch (error) {
      console.error('Errore nell aggiornamento dell utente:', error)
    }
  }
  return {
    user,
    appUser,
    isAuthenticated,
    isAuthReady,
    loginWithGoogle,
    handleAuthCallback,
    logout,
    checkAuth,
    onAuthStateChange,
    updateUser,
  }
})
