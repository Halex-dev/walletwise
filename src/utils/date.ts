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
  addDays,
  subDays,
} from 'date-fns'

export function calculateDateRange(
  startMonth: number,
  date?: Date
): [Date, Date] {
  if (!date) {
    date = new Date()
  }
  const now = new Date(date)
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  let startDate = startOfDay(new Date(currentYear, currentMonth, startMonth))
  let endDate = endOfDay(addMonths(startDate, 1))

  endDate = subDays(endDate, 1)

  // Se la data di inizio è nel futuro, torniamo indietro di un mese
  if (isBefore(now, startDate)) {
    startDate = subMonths(startDate, 1)
    endDate = subMonths(endDate, 1)
  }

  return [startDate, endDate]
}

export function getDateOfGivenYear(
  year: number | string, // Accetta sia numeri che stringhe
  delayDays: number = 0
): [Date, Date] {
  const parsedYear = parseInt(year as string, 10)

  if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 3000) {
    throw new Error('Invalid year provided')
  }

  // Primo giorno dell'anno con ritardo
  let startDate = startOfDay(new Date(parsedYear, 0, 1))
  startDate = addDays(startDate, delayDays)

  // Ultimo giorno dell'anno
  let endDate = endOfDay(new Date(parsedYear, 11, 31))

  return [startDate, endDate]
}

export function getDateOfYear(
  delayDays: number = 0,
  date?: Date
): [Date, Date] {
  let currentYear

  if (date) {
    currentYear = date.getFullYear()
  } else {
    const now = new Date()
    currentYear = now.getFullYear()
  }
  // Primo giorno del mese scelto con ritardo
  let startDate = startOfDay(new Date(currentYear, 0, 1)) // startMonth è 1-based
  startDate = addDays(startDate, delayDays) // Aggiunge il ritardo

  // Ultimo giorno dell'anno
  let endDate = endOfDay(new Date(currentYear, 11, 31))

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

export function isDateInRange(
  date: string | Date,
  start: Date,
  end: Date
): boolean {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return isWithinInterval(parsedDate, { start, end })
}
