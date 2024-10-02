import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL e Anon Key devono essere definiti nelle variabili d'ambiente"
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
