import { Statistics, Transaction } from '@/types/transaction'

//Opzioni per variabile currency
export const currencyOptions = [
  { name: 'Euro (€)', code: 'EUR' },
  { name: 'US Dollar ($)', code: 'USD' },
  { name: 'British Pound (£)', code: 'GBP' },
]

//Opzioni per variabile language
export const languageOptions = [
  { name: 'English', code: 'en' },
  { name: 'Italiano', code: 'it' },
]

//Opzioni per variabile data_format
export const dateFormatOptions = [
  { name: 'MM/DD/YYYY', value: 'mm/dd/yyyy' },
  { name: 'DD/MM/YYYY', value: 'dd/mm/yyyy' },
  { name: 'YYYY-MM-DD', value: 'yyyy-mm-dd' },
]

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
