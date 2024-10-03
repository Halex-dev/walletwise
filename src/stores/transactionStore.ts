import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Transaction, RecurrenceFrequency } from '@/types/transaction'
import { transactionService } from '@/services/supabase/transaction'

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<Transaction[]>([])
  const recurrenceFrequencies = ref<RecurrenceFrequency[]>([])

  const totalIncome = computed(() =>
    transactions.value
      .filter((t) => t.category?.type?.name === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const totalExpenses = computed(() =>
    transactions.value
      .filter((t) =>
        ['necessary_expense', 'optional_expense'].includes(
          t.category?.type?.name || ''
        )
      )
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const totalNecessary = computed(() =>
    transactions.value
      .filter((t) =>
        ['necessary_expense'].includes(t.category?.type?.name || '')
      )
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const totalOptional = computed(() =>
    transactions.value
      .filter((t) =>
        ['optional_expense'].includes(t.category?.type?.name || '')
      )
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const totalShortInvestment = computed(() =>
    transactions.value
      .filter((t) =>
        ['short_term_investment'].includes(t.category?.type?.name || '')
      )
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const totalLongInvestment = computed(() =>
    transactions.value
      .filter((t) =>
        ['long_term_investment'].includes(t.category?.type?.name || '')
      )
      .reduce((sum, t) => sum + t.amount, 0)
  )

  async function fetchRecurrenceFrequencies() {
    try {
      recurrenceFrequencies.value =
        await transactionService.getRecurrenceFrequencies()
    } catch (error) {
      console.error('Errore nel recupero delle frequenze di ricorrenza:', error)
    }
  }

  async function fetchUserTransactions(
    userId: string,
    startDate: string,
    endDate: string
  ) {
    try {
      transactions.value = await transactionService.getUserTransactions(
        userId,
        startDate,
        endDate
      )
    } catch (error) {
      console.error('Errore nel recupero delle transazioni:', error)
    }
  }

  async function createTransaction(transaction: Partial<Transaction>) {
    try {
      const newTransaction =
        await transactionService.createTransaction(transaction)
      transactions.value.unshift(newTransaction)
    } catch (error) {
      console.error('Errore nella creazione della transazione:', error)
      throw error
    }
  }

  async function updateTransaction(
    transactionId: string,
    updates: Partial<Transaction>
  ) {
    try {
      const updatedTransaction = await transactionService.updateTransaction(
        transactionId,
        updates
      )
      const index = transactions.value.findIndex((t) => t.id === transactionId)
      if (index !== -1) {
        transactions.value[index] = updatedTransaction
      }
    } catch (error) {
      console.error("Errore nell'aggiornamento della transazione:", error)
      throw error
    }
  }

  async function deleteTransaction(transactionId: string) {
    try {
      await transactionService.deleteTransaction(transactionId)
      transactions.value = transactions.value.filter(
        (t) => t.id !== transactionId
      )
    } catch (error) {
      console.error("Errore nell'eliminazione della transazione:", error)
      throw error
    }
  }

  return {
    transactions,
    recurrenceFrequencies,
    totalIncome,
    totalExpenses,
    totalShortInvestment,
    totalLongInvestment,
    totalNecessary,
    totalOptional,
    fetchRecurrenceFrequencies,
    fetchUserTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
})
