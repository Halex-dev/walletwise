import type { Transaction } from '@/types/transaction'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatAmount(transaction: Transaction): string {
  if (!transaction.category?.type) return formatCurrency(transaction.amount)
  const categoryTypeName = transaction.category.type.name

  if (categoryTypeName === 'income') {
    return '+ ' + formatCurrency(transaction.amount)
  } else if (
    categoryTypeName === 'short_term_investment' ||
    categoryTypeName === 'long_term_investment'
  ) {
    return formatCurrency(transaction.amount)
  } else {
    return '- ' + formatCurrency(transaction.amount)
  }
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
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
