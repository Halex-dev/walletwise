import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  type Transaction,
  type RecurrenceFrequency,
  cleanTransactionUpdates,
} from '@/types/transaction'
import { transactionService } from '@/services/supabase/transaction'

import { formatDateForAPI } from '@/utils/date'

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<Transaction[]>([])
  const recurrenceFrequencies = ref<RecurrenceFrequency[]>([])

  //TODO fare un store separato
  /*async function fetchRecurrenceFrequencies() {
    try {
      recurrenceFrequencies.value =
        await transactionService.getRecurrenceFrequencies()
    } catch (error) {
      console.error('Error fetching recurrence frequencies:', error)
    }
  }*/

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
    fetchUserTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
})
