import {
  startOfDay,
  endOfDay,
  addMonths,
  subMonths,
  isBefore,
  format,
  parseISO,
  isWithinInterval,
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

export function formatDateForAPI(date: Date): string {
  return format(date, 'yyyy-MM-dd')
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
