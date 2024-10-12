export type displayDate = 'mm/dd/yyyy' | 'dd/mm/yyyy' | 'yyyy-mm-dd'

export interface User {
  id: string
  username: string
  email: string
  date_format: displayDate
  currency: string
  language: string
  notify: boolean
  start_month: number
  created_at: string
  updated_at: string
}
