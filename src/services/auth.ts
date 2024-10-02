import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export const authService = {
  async loginWithGoogle(): Promise<{ url: string } | null> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Errore durante il login con Google:', error)
      throw error
    }
  },

  async handleAuthCallback(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return data.session?.user || null
    } catch (error) {
      console.error(
        'Errore durante la gestione del callback di autenticazione:',
        error
      )
      throw error
    }
  },

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Errore durante il logout:', error)
      throw error
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error("Errore durante il recupero dell'utente corrente:", error)
      return null
    }
  },

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null)
    }).data.subscription.unsubscribe
  },
}
