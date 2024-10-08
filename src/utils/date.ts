import {
  startOfDay,
  endOfDay,
  addMonths,
  subMonths,
  isBefore,
  format,
  parseISO,
  isWithinInterval,
  isValid,
} from 'date-fns'

export function calculateDateRange(startMonth: number): [Date, Date] {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  let startDate = startOfDay(new Date(currentYear, currentMonth, startMonth))
  let endDate = endOfDay(addMonths(startDate, 1))

  // Se la data di inizio è nel futuro, torniamo indietro di un mese
  if (isBefore(now, startDate)) {
    startDate = subMonths(startDate, 1)
    endDate = subMonths(endDate, 1)
  }

  return [startDate, endDate]
}

export function formatDateForAPI(date: Date | string): string {
  let dateObject: Date

  if (typeof date === 'string') {
    // Se è una stringa, proviamo a parsificarla
    dateObject = parseISO(date)
    if (!isValid(dateObject)) {
      throw new Error('Invalid date string provided')
    }
  } else if (date instanceof Date) {
    // Se è già un oggetto Date, lo usiamo direttamente
    dateObject = date
  } else {
    throw new Error('Invalid date format')
  }

  // Formatta la data nel formato richiesto da Supabase (YYYY-MM-DD)
  return format(dateObject, 'yyyy-MM-dd')
}

export function formatDateForDisplay(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return format(parsedDate, 'dd/MM/yyyy')
}

export function isDateInRange(
  date: string | Date,
  start: Date,
  end: Date
): boolean {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return isWithinInterval(parsedDate, { start, end })
}
