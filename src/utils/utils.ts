import type { Transaction } from '@/types/transaction'
import { formatCurrencyForCurrentUser } from './users'

export function formatAmount(transaction: Transaction): string {
  if (!transaction.category?.type)
    return formatCurrencyForCurrentUser(transaction.amount)
  const categoryTypeName = transaction.category.type.name

  if (categoryTypeName === 'income') {
    return '+ ' + formatCurrencyForCurrentUser(transaction.amount)
  } else if (
    categoryTypeName === 'short_term_investment' ||
    categoryTypeName === 'long_term_investment'
  ) {
    return formatCurrencyForCurrentUser(transaction.amount)
  } else {
    return '- ' + formatCurrencyForCurrentUser(transaction.amount)
  }
}

export const roundToTwoDecimals = (value: number) => {
  return Math.round(value * 100) / 100
}

export const formatPercentage = (value: number): string => {
  return (value * 100).toFixed(2) + '%'
}

export const calculatePercentage = (spent: number, limit: number): number => {
  return Math.min(Math.round((spent / limit) * 100), 100)
}
