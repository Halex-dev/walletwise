export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
}

export const roundToTwoDecimals = (value: number) => {
  return Math.round(value * 100) / 100
}
