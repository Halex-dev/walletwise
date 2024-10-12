import { supabase } from '@/services/supabase'
import type {
  PortfolioTrackerMonthly,
  PortfolioTrackerMonthlyUpdate,
} from '@/types/portfolioTracker'

export const portfolioTrackerService = {
  async getUserPortfolioTrackers(
    userId: string,
    year: number
  ): Promise<PortfolioTrackerMonthly[]> {
    const { data, error } = await supabase
      .from('portfolio_tracker_monthly')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .is('deleted_at', null)
      .order('category', { ascending: true })

    if (error) throw error
    return data
  },

  async createPortfolioTracker(
    portfolioTracker: Partial<PortfolioTrackerMonthly>
  ): Promise<PortfolioTrackerMonthly> {
    const { data, error } = await supabase
      .from('portfolio_tracker_monthly')
      .insert(portfolioTracker)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updatePortfolioTracker(
    portfolioTrackerId: string,
    updates: PortfolioTrackerMonthlyUpdate
  ): Promise<PortfolioTrackerMonthly> {
    const { data, error } = await supabase
      .from('portfolio_tracker_monthly')
      .update(updates)
      .eq('id', portfolioTrackerId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deletePortfolioTracker(portfolioTrackerId: string): Promise<void> {
    const { error } = await supabase
      .from('portfolio_tracker_monthly')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', portfolioTrackerId)

    if (error) throw error
  },
}
