import { Category } from '@/types/category'
import { Transaction } from '@/types/transaction'

export function getAmountColor(transaction: Transaction): string {
  if (!transaction.category?.type) return ''
  const categoryTypeName = transaction.category.type.name
  if (categoryTypeName === 'income') {
    return 'text-green-500 dark:text-green-400'
  } else if (
    categoryTypeName === 'necessary_expense' ||
    categoryTypeName === 'optional_expense'
  ) {
    return 'text-red-500 dark:text-red-400'
  } else {
    return 'text-blue-500 dark:text-blue-400'
  }
}

export function getCategoryTagSeverity(category?: Category): string {
  const typeName = category?.type?.name
  const severityMap: Record<string, string> = {
    income: 'success',
    necessary_expense: 'danger',
    optional_expense: 'danger',
    short_term_investment: 'info',
    long_term_investment: 'info',
  }
  return severityMap[typeName || ''] || 'secondary'
}
