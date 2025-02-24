import { Category } from './category'

export interface RecurrenceFrequency {
  id: number
  name: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

export interface Transaction {
  id: string
  user_id: string
  category_id: string
  amount: number
  date: string
  is_recurring: boolean
  recurrence_frequency_id: number | null
  description: string | null
  created_at: string
  updated_at: string

  // Relations
  category?: Category
  recurrence_frequency?: RecurrenceFrequency
}

export interface Statistics {
  totalIncome: number
  totalExpenses: number
  totalNecessary: number
  totalOptional: number
  totalShortInvestment: number
  totalLongInvestment: number
  expensesByCategory: { name: string; amount: number }[]
  monthLabels: string[]
  monthlyIncome: number[]
  monthlyExpenses: number[]
}

type TransactionUpdateFields = Omit<
  Transaction,
  | 'id'
  | 'user_id'
  | 'created_at'
  | 'updated_at'
  | 'category'
  | 'recurrence_frequency'
>

export function cleanTransactionUpdates(
  updates: Partial<Transaction>
): Partial<TransactionUpdateFields> {
  const {
    id,
    user_id,
    created_at,
    updated_at,
    category,
    recurrence_frequency,
    ...cleanUpdates
  } = updates

  return cleanUpdates
}
