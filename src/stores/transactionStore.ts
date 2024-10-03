import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Transaction, RecurrenceFrequency } from '@/types/transaction'
import { transactionService } from '@/services/supabase/transaction'
import {
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  parseISO,
  format,
} from 'date-fns'

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

  const expensesByCategory = computed(() => {
    const categories: { [key: string]: number } = {}
    transactions.value
      .filter((t) =>
        ['necessary_expense', 'optional_expense'].includes(
          t.category?.type?.name || ''
        )
      )
      .forEach((t) => {
        const categoryName = t.category?.name || 'Uncategorized'
        categories[categoryName] = (categories[categoryName] || 0) + t.amount
      })
    return Object.entries(categories)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
  })

  const monthLabels = computed(() => {
    if (transactions.value.length === 0) return []
    const dates = transactions.value.map((t) => parseISO(t.date))
    const minDate = new Date(Math.min.apply(null, dates))
    const maxDate = new Date(Math.max.apply(null, dates))
    return eachMonthOfInterval({
      start: startOfMonth(minDate),
      end: endOfMonth(maxDate),
    }).map((date) => format(date, 'MMM yyyy'))
  })

  const monthlyIncome = computed(() => calculateMonthlyData('income'))
  const monthlyExpenses = computed(() =>
    calculateMonthlyData(['necessary_expense', 'optional_expense'])
  )

  function calculateMonthlyData(types: string | string[]) {
    const typeArray = Array.isArray(types) ? types : [types]
    const monthlyData: { [key: string]: number } = {}
    transactions.value
      .filter((t) => typeArray.includes(t.category?.type?.name || ''))
      .forEach((t) => {
        const month = format(parseISO(t.date), 'MMM yyyy')
        monthlyData[month] = (monthlyData[month] || 0) + t.amount
      })
    return monthLabels.value.map((month) => monthlyData[month] || 0)
  }

  async function fetchRecurrenceFrequencies() {
    try {
      recurrenceFrequencies.value =
        await transactionService.getRecurrenceFrequencies()
    } catch (error) {
      console.error('Error fetching recurrence frequencies:', error)
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
      console.error('Error fetching user transactions:', error)
    }
  }

  async function createTransaction(transaction: Partial<Transaction>) {
    try {
      const newTransaction =
        await transactionService.createTransaction(transaction)
      transactions.value.unshift(newTransaction)
    } catch (error) {
      console.error('Error creating transaction:', error)
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
      console.error('Error updating transaction:', error)
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
      console.error('Error deleting transaction:', error)
      throw error
    }
  }

  return {
    transactions,
    recurrenceFrequencies,
    totalIncome,
    totalExpenses,
    totalNecessary,
    totalOptional,
    totalShortInvestment,
    totalLongInvestment,
    expensesByCategory,
    monthLabels,
    monthlyIncome,
    monthlyExpenses,
    fetchRecurrenceFrequencies,
    fetchUserTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
})
