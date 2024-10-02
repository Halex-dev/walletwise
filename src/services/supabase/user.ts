import { supabase } from '@/services/supabase'
import type { User } from '@/types/user'
import { User as SupabaseUser } from '@supabase/supabase-js'

export const userService = {
  async getCurrentUser(supabaseUser: SupabaseUser): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Utente non trovato, ne creiamo uno nuovo
          return this.createUser(supabaseUser)
        }
        throw error
      }
      return data
    } catch (error) {
      console.error("Errore nel recupero dell'utente corrente:", error)
      throw error
    }
  },

  async createUser(supabaseUser: SupabaseUser): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: supabaseUser.id,
          username:
            supabaseUser.user_metadata.full_name ||
            supabaseUser.email?.split('@')[0],
          email: supabaseUser.email,
          start_month: 1, // Default a FirstDay
          // Aggiungi altri campi se necessario
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Errore nella creazione dell'utente:", error)
      throw error
    }
  },

  async updateUser(id: string, updatedFields: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updatedFields)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Errore nell'aggiornamento dell'utente:", error)
      throw error
    }
  },
}
