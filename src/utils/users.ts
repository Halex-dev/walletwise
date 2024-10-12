import { useAuthStore } from '@/stores/authStore'
import { User } from '@/types/user'
import { format } from 'date-fns'
import { enUS, it } from 'date-fns/locale'

export const getDateFormatForUser = (user: User | null): string => {
  if (!user) {
    return 'dd/mm/yy'
  }

  switch (user.date_format) {
    case 'mm/dd/yyyy':
      return 'mm/dd/yy'
    case 'dd/mm/yyyy':
      return 'dd/mm/yy'
    case 'yyyy-mm-dd':
      return 'yy-mm-dd'
    default:
      return 'dd/mm/yy'
  }
}

export function formatPercentageForUser(
  value: number,
  user: User | null
): string {
  if (!user) {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
    }).format(value)
  }

  return new Intl.NumberFormat(getLocaleFromLanguage(user.language), {
    style: 'percent',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatDateForUser(
  date: Date | string,
  user: User | null
): string {
  if (!user) {
    return format(new Date(date), 'dd/MM/yyyy') // Formato predefinito
  }

  const locales = {
    en: enUS,
    it: it,
    // Aggiungi altri locali supportati qui
  }

  const locale = locales[user.language as keyof typeof locales] || enUS

  switch (user.date_format) {
    case 'mm/dd/yyyy':
      return format(new Date(date), 'MM/dd/yyyy', { locale })
    case 'dd/mm/yyyy':
      return format(new Date(date), 'dd/MM/yyyy', { locale })
    case 'yyyy-mm-dd':
      return format(new Date(date), 'yyyy-MM-dd', { locale })
    default:
      return format(new Date(date), 'dd/MM/yyyy', { locale })
  }
}

export const getDateFormatForCurrentUser = (): string => {
  const authStore = useAuthStore()
  return getDateFormatForUser(authStore.appUser)
}

export function formatCurrencyForUser(
  amount: number,
  user: User | null
): string {
  if (!user) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return new Intl.NumberFormat(getLocaleFromLanguage(user.language), {
    style: 'currency',
    currency: user.currency,
  }).format(amount)
}

export function formatCurrencyForCurrentUser(amount: number): string {
  const authStore = useAuthStore()
  return formatCurrencyForUser(amount, authStore.appUser)
}

// Funzione helper per ottenere il locale corretto per Intl
function getLocaleFromLanguage(language: string): string {
  switch (language) {
    case 'en':
      return 'en-US'
    case 'it':
      return 'it-IT'
    // Aggiungi altri casi per le lingue supportate
    default:
      return 'en-US'
  }
}
