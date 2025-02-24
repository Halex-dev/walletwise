import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  type Transaction,
  type RecurrenceFrequency,
  cleanTransactionUpdates,
  Statistics,
} from '@/types/transaction'
import { transactionService } from '@/services/supabase/transaction'
import {
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  parseISO,
  format,
} from 'date-fns'
import { formatDateForAPI } from '@/utils/date'

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<Transaction[]>([])
  const recurrenceFrequencies = ref<RecurrenceFrequency[]>([])

  const StatisticsMonth = computed(() => {
    return calculateStatistics(transactions.value)
  })

  async function fetchTransactionsExport(
    userId: string,
    startDate: string,
    endDate: string
  ) {
    try {
      const fetchedTransactions = await transactionService.getUserTransactions(
        userId,
        startDate,
        endDate
      )

      // Calcola le statistiche per le transazioni esportate
      const statistics = calculateStatistics(fetchedTransactions)

      return {
        transactions: fetchedTransactions,
        statistics,
      }
    } catch (error) {
      console.error('Error fetching user transactions:', error)
      throw error
    }
  }

  function calculateMonthlyData(
    transactions: Transaction[],
    types: string | string[]
  ) {
    const typeArray = Array.isArray(types) ? types : [types]
    const monthlyData: { [key: string]: number } = {}
    transactions
      .filter((t) => typeArray.includes(t.category?.type?.name || ''))
      .forEach((t) => {
        const month = format(parseISO(t.date.toLocaleString()), 'MMM yyyy')
        monthlyData[month] = (monthlyData[month] || 0) + t.amount
      })

    const labels = monthLabels(transactions)
    return labels.map((month) => monthlyData[month] || 0)
  }

  function monthLabels(transactions: Transaction[]) {
    if (transactions.length === 0) return []

    const dates = transactions.map((t) => parseISO(t.date.toString()))
    const timestamps = dates.map((date) => date.getTime())

    const minDate = new Date(Math.min(...timestamps))
    const maxDate = new Date(Math.max(...timestamps))

    return eachMonthOfInterval({
      start: startOfMonth(minDate),
      end: endOfMonth(maxDate),
    }).map((date) => format(date, 'MMM yyyy'))
  }

  function calculateStatistics(transactions: Transaction[]): Statistics {
    const totalIncome = transactions
      .filter((t) => t.category?.type?.name === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter((t) =>
        ['necessary_expense', 'optional_expense'].includes(
          t.category?.type?.name || ''
        )
      )
      .reduce((sum, t) => sum + t.amount, 0)

    const totalNecessary = transactions
      .filter((t) =>
        ['necessary_expense'].includes(t.category?.type?.name || '')
      )
      .reduce((sum, t) => sum + t.amount, 0)

    const totalOptional = transactions
      .filter((t) =>
        ['optional_expense'].includes(t.category?.type?.name || '')
      )
      .reduce((sum, t) => sum + t.amount, 0)

    const totalShortInvestment = transactions
      .filter((t) =>
        ['short_term_investment'].includes(t.category?.type?.name || '')
      )
      .reduce((sum, t) => sum + t.amount, 0)

    const totalLongInvestment = transactions
      .filter((t) =>
        ['long_term_investment'].includes(t.category?.type?.name || '')
      )
      .reduce((sum, t) => sum + t.amount, 0)

    const expensesByCategory = (() => {
      const categories: { [key: string]: number } = {}
      transactions
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
    })()

    const monthLabels = (() => {
      if (transactions.length === 0) return []

      const dates = transactions.map((t) => parseISO(t.date.toString()))
      const timestamps = dates.map((date) => date.getTime())

      const minDate = new Date(Math.min(...timestamps))
      const maxDate = new Date(Math.max(...timestamps))

      return eachMonthOfInterval({
        start: startOfMonth(minDate),
        end: endOfMonth(maxDate),
      }).map((date) => format(date, 'MMM yyyy'))
    })()

    const monthlyIncome = calculateMonthlyData(transactions, 'income')
    const monthlyExpenses = calculateMonthlyData(transactions, [
      'necessary_expense',
      'optional_expense',
    ])

    return {
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
    }
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
      if (!transaction.date) {
        transaction.date = formatDateForAPI(new Date())
      }

      const newTransaction = await transactionService.createTransaction({
        ...transaction,
        date: formatDateForAPI(transaction.date),
      })
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
      const cleanUpdates = cleanTransactionUpdates(updates)

      const updatedTransaction = await transactionService.updateTransaction(
        transactionId,
        cleanUpdates
      )

      const index = transactions.value.findIndex((t) => t.id === transactionId)
      if (index !== -1) {
        // Merge the updated fields with the existing transaction
        transactions.value[index] = {
          ...transactions.value[index],
          ...updatedTransaction,
        }
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
    monthLabels,
    StatisticsMonth,
    fetchRecurrenceFrequencies,
    fetchUserTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactionsExport,
  }
})
