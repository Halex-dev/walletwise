export interface PortfolioTrackerMonthly {
  id: string
  user_id: string
  year: number
  category: string
  jan_value: number | null
  feb_value: number | null
  mar_value: number | null
  apr_value: number | null
  may_value: number | null
  jun_value: number | null
  jul_value: number | null
  aug_value: number | null
  sep_value: number | null
  oct_value: number | null
  nov_value: number | null
  dec_value: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type PortfolioTrackerMonthlyUpdate = Partial<PortfolioTrackerMonthly>

export function cleanPortfolioTrackerMonthlyUpdates(
  updates: PortfolioTrackerMonthlyUpdate
): PortfolioTrackerMonthlyUpdate {
  const cleanUpdates: PortfolioTrackerMonthlyUpdate = { ...updates }
  delete cleanUpdates.id
  delete cleanUpdates.user_id
  delete cleanUpdates.created_at
  delete cleanUpdates.updated_at
  return cleanUpdates
}
