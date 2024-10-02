import { supabase } from '@/services/supabase'
import type { Transaction, RecurrenceFrequency } from '@/types/transaction'

export const transactionService = {
  async getRecurrenceFrequencies(): Promise<RecurrenceFrequency[]> {
    const { data, error } = await supabase
      .from('recurrence_frequencies')
      .select('*')

    if (error) throw error
    return data
  },

  async getUserTransactions(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(
        `
        *,
        category:categories(id, name, type:category_types(id, name)),
        recurrence_frequency:recurrence_frequencies(id, name)
      `
      )
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .is('deleted_at', null)
      .order('date', { ascending: false })

    if (error) throw error
    return data
  },

  async createTransaction(
    transaction: Partial<Transaction>
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select(
        `
        *,
        category:categories(id, name, type:category_types(id, name)),
        recurrence_frequency:recurrence_frequencies(id, name)
      `
      )
      .single()
    if (error) throw error
    return data
  },

  async updateTransaction(
    transactionId: string,
    updates: Partial<Transaction>
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select(
        `
        *,
        category:categories(id, name, type:category_types(id, name)),
        recurrence_frequency:recurrence_frequencies(id, name)
      `
      )
      .single()

    if (error) throw error
    return data
  },

  async deleteTransaction(transactionId: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', transactionId)

    if (error) throw error
  },
}
