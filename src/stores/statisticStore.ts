import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type Transaction, Statistics } from '@/types/transaction'
import { transactionService } from '@/services/supabase/transaction'
import { parseISO, format } from 'date-fns'
import { formatDateForAPI, getDateOfGivenYear } from '@/utils/date'

export type MonthlyStatistics = {
  label: string
  key: string
  transactions: Transaction[]
  statistics: Statistics
}

export type YearlyStatisticsData = {
  months: MonthlyStatistics[]
  yearlyStatistics: Statistics
  allTransactions: Transaction[]
}

export const useStatisticStore = defineStore('statistic', () => {
  const yearlyData = ref<YearlyStatisticsData | null>(null)
  const isLoading = ref(false)
  const currentYear = ref(new Date().getFullYear())

  const monthKeys = [
    'common.months.january',
    'common.months.february',
    'common.months.march',
    'common.months.april',
    'common.months.may',
    'common.months.june',
    'common.months.july',
    'common.months.august',
    'common.months.september',
    'common.months.october',
    'common.months.november',
    'common.months.december',
  ]

  // Funzione per calcolare i dati mensili
  function calculateMonthlyData(
    transactions: Transaction[],
    types: string | string[]
  ) {
    const typeArray = Array.isArray(types) ? types : [types]
    const monthlyData: number[] = new Array(12).fill(0) // Inizializza un array di 12 elementi con valore 0

    transactions
      .filter((t) => typeArray.includes(t.category?.type?.name || ''))
      .forEach((t) => {
        const transactionDate = parseISO(t.date.toString())
        const monthIndex = transactionDate.getMonth() // Ottieni l'indice del mese (0-11)
        monthlyData[monthIndex] += t.amount // Aggiungi l'importo al mese corrispondente
      })

    return monthlyData
  }

  // Funzione per calcolare le statistiche
  function calculateStatistics(transactions: Transaction[]): Statistics {
    const totalIncome = Number(
      transactions
        .filter((t) => t.category?.type?.name === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
        .toFixed(2)
    )

    const totalExpenses = Number(
      transactions
        .filter((t) =>
          ['necessary_expense', 'optional_expense'].includes(
            t.category?.type?.name || ''
          )
        )
        .reduce((sum, t) => sum + t.amount, 0)
        .toFixed(2)
    )

    const totalNecessary = Number(
      transactions
        .filter((t) =>
          ['necessary_expense'].includes(t.category?.type?.name || '')
        )
        .reduce((sum, t) => sum + t.amount, 0)
        .toFixed(2)
    )

    const totalOptional = Number(
      transactions
        .filter((t) =>
          ['optional_expense'].includes(t.category?.type?.name || '')
        )
        .reduce((sum, t) => sum + t.amount, 0)
        .toFixed(2)
    )

    const totalShortInvestment = Number(
      transactions
        .filter((t) =>
          ['short_term_investment'].includes(t.category?.type?.name || '')
        )
        .reduce((sum, t) => sum + t.amount, 0)
        .toFixed(2)
    )

    const totalLongInvestment = Number(
      transactions
        .filter((t) =>
          ['long_term_investment'].includes(t.category?.type?.name || '')
        )
        .reduce((sum, t) => sum + t.amount, 0)
        .toFixed(2)
    )

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
      monthlyIncome,
      monthlyExpenses,
    }
  }

  //Funzione per calcolare le statistiche per l'anno senza contarle nello store
  async function fetchYearStatisticsExport(
    userId: string,
    year: number,
    delayDays: number = 0
  ) {
    try {
      isLoading.value = true

      // Imposta le date di inizio e fine per l'intero anno
      const dateYear = getDateOfGivenYear(year, delayDays)

      // Ottiene tutte le transazioni dell'anno
      const allTransactions = await transactionService.getUserTransactions(
        userId,
        formatDateForAPI(dateYear[0]),
        formatDateForAPI(dateYear[1])
      )

      // Crea un array di mesi per l'anno specificato
      const months: MonthlyStatistics[] = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(year, i, 1)
        return {
          label: format(date, 'MMM yyyy'),
          key: monthKeys[i],
          transactions: [] as Transaction[],
          statistics: createEmptyStatistics(),
        }
      })

      // Distribuisce le transazioni nei rispettivi mesi
      allTransactions.forEach((transaction) => {
        const transactionDate = parseISO(transaction.date.toString())
        const monthIndex = transactionDate.getMonth()

        // Verifica che la transazione appartenga all'anno specificato
        if (transactionDate.getFullYear() === year) {
          months[monthIndex].transactions.push(transaction)
        }
      })

      // Calcola le statistiche per ogni mese
      months.forEach((month) => {
        if (month.transactions.length > 0) {
          month.statistics = calculateStatistics(month.transactions)
        } else {
          // Se non ci sono transazioni, mantieni le statistiche vuote
          month.statistics = createEmptyStatistics()
        }
      })

      // Aggiunge anche le statistiche complessive dell'anno
      const yearlyStatistics =
        allTransactions.length > 0
          ? calculateStatistics(allTransactions)
          : createEmptyStatistics()

      return {
        months,
        yearlyStatistics,
        allTransactions,
      }
    } catch (error) {
      console.error('Error fetching year statistics:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchYearStatistics(
    userId: string,
    year: number,
    delayDays: number = 0
  ) {
    try {
      isLoading.value = true
      currentYear.value = year

      // Imposta le date di inizio e fine per l'intero anno
      const dateYear = await getDateOfGivenYear(year, delayDays)

      // Ottiene tutte le transazioni dell'anno
      const allTransactions = await transactionService.getUserTransactions(
        userId,
        formatDateForAPI(dateYear[0]),
        formatDateForAPI(dateYear[1])
      )

      // Crea un array di mesi per l'anno specificato
      const months: MonthlyStatistics[] = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(year, i, 1)
        return {
          label: format(date, 'MMM yyyy'),
          key: monthKeys[i],
          transactions: [] as Transaction[],
          statistics: createEmptyStatistics(),
        }
      })

      // Distribuisce le transazioni nei rispettivi mesi
      allTransactions.forEach((transaction) => {
        const transactionDate = parseISO(transaction.date.toString())
        const monthIndex = transactionDate.getMonth()

        // Verifica che la transazione appartenga all'anno specificato
        if (transactionDate.getFullYear() === year) {
          months[monthIndex].transactions.push(transaction)
        }
      })

      // Calcola le statistiche per ogni mese
      months.forEach((month) => {
        if (month.transactions.length > 0) {
          month.statistics = calculateStatistics(month.transactions)
        } else {
          // Se non ci sono transazioni, mantieni le statistiche vuote
          month.statistics = createEmptyStatistics()
        }
      })

      // Aggiunge anche le statistiche complessive dell'anno
      const yearlyStatistics =
        allTransactions.length > 0
          ? calculateStatistics(allTransactions)
          : createEmptyStatistics()

      yearlyData.value = {
        months,
        yearlyStatistics,
        allTransactions,
      }

      return yearlyData.value
    } catch (error) {
      console.error('Error fetching year statistics:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Crea un oggetto Statistics vuoto
  function createEmptyStatistics(): Statistics {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      totalNecessary: 0,
      totalOptional: 0,
      totalShortInvestment: 0,
      totalLongInvestment: 0,
      expensesByCategory: [],
      monthlyIncome: [],
      monthlyExpenses: [],
    }
  }

  // Calcola il risparmio mensile (income - expenses)
  function calculateMonthlySavings(month: MonthlyStatistics): number {
    return month.statistics.totalIncome - month.statistics.totalExpenses
  }

  // Calcola la percentuale di spese necessarie rispetto al totale delle spese
  function calculateNecessaryExpensesPercentage(
    month: MonthlyStatistics
  ): number {
    if (month.statistics.totalExpenses === 0) return 0
    return (
      (month.statistics.totalNecessary / month.statistics.totalExpenses) * 100
    )
  }

  // Calcola la percentuale di risparmio rispetto al reddito
  function calculateSavingsRate(month: MonthlyStatistics): number {
    if (month.statistics.totalIncome === 0) return 0
    const savings =
      month.statistics.totalIncome - month.statistics.totalExpenses
    return (savings / month.statistics.totalIncome) * 100
  }

  // Confronta le statistiche tra due mesi
  function compareMonths(monthIndex1: number, monthIndex2: number) {
    if (
      !yearlyData.value ||
      monthIndex1 < 0 ||
      monthIndex2 < 0 ||
      monthIndex1 >= 12 ||
      monthIndex2 >= 12
    ) {
      return null
    }

    const month1 = yearlyData.value.months[monthIndex1]
    const month2 = yearlyData.value.months[monthIndex2]

    const incomeChange =
      month2.statistics.totalIncome - month1.statistics.totalIncome
    const expensesChange =
      month2.statistics.totalExpenses - month1.statistics.totalExpenses
    const savingsChange =
      calculateMonthlySavings(month2) - calculateMonthlySavings(month1)

    return {
      incomeChange,
      expensesChange,
      savingsChange,
      incomeChangePercentage: month1.statistics.totalIncome
        ? (incomeChange / month1.statistics.totalIncome) * 100
        : 0,
      expensesChangePercentage: month1.statistics.totalExpenses
        ? (expensesChange / month1.statistics.totalExpenses) * 100
        : 0,
      savingsChangePercentage: calculateMonthlySavings(month1)
        ? (savingsChange / calculateMonthlySavings(month1)) * 100
        : 0,
    }
  }

  return {
    yearlyData,
    isLoading,
    currentYear,
    monthKeys,
    fetchYearStatistics,
    calculateStatistics,
    calculateMonthlySavings,
    calculateNecessaryExpensesPercentage,
    calculateSavingsRate,
    compareMonths,
    fetchYearStatisticsExport,
  }
})
