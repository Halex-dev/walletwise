import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  PortfolioTrackerMonthly,
  PortfolioTrackerMonthlyUpdate,
} from '@/types/portfolioTracker'
import { portfolioTrackerService } from '@/services/supabase/portfolioTracker'
import { cleanPortfolioTrackerMonthlyUpdates } from '@/types/portfolioTracker'

export const usePortfolioTrackerStore = defineStore('portfolioTracker', () => {
  const portfolioTrackers = ref<PortfolioTrackerMonthly[]>([])

  const totalsByCategory = computed(() => {
    const totals: { [key: string]: number } = {}
    const monthFields: (keyof PortfolioTrackerMonthly)[] = [
      'jan_value',
      'feb_value',
      'mar_value',
      'apr_value',
      'may_value',
      'jun_value',
      'jul_value',
      'aug_value',
      'sep_value',
      'oct_value',
      'nov_value',
      'dec_value',
    ]

    portfolioTrackers.value.forEach((tracker) => {
      const categoryTotal = monthFields.reduce((sum, month) => {
        const value = tracker[month]
        return sum + (typeof value === 'number' ? value : 0)
      }, 0)

      totals[tracker.category] = (totals[tracker.category] || 0) + categoryTotal
    })

    return totals
  })

  const monthlyTotals = computed(() => {
    const monthFields: (keyof PortfolioTrackerMonthly)[] = [
      'jan_value',
      'feb_value',
      'mar_value',
      'apr_value',
      'may_value',
      'jun_value',
      'jul_value',
      'aug_value',
      'sep_value',
      'oct_value',
      'nov_value',
      'dec_value',
    ]

    return monthFields.map((month) =>
      portfolioTrackers.value.reduce((sum, tracker) => {
        const value = tracker[month]
        return sum + (typeof value === 'number' ? value : 0)
      }, 0)
    )
  })

  async function fetchUserPortfolioTrackers(userId: string, year: number) {
    try {
      portfolioTrackers.value =
        await portfolioTrackerService.getUserPortfolioTrackers(userId, year)
    } catch (error) {
      console.error('Error fetching user portfolio trackers:', error)
    }
  }

  async function createPortfolioTracker(
    portfolioTracker: Partial<PortfolioTrackerMonthly>
  ) {
    try {
      const newPortfolioTracker =
        await portfolioTrackerService.createPortfolioTracker(portfolioTracker)
      portfolioTrackers.value.push(newPortfolioTracker)
    } catch (error) {
      console.error('Error creating portfolio tracker:', error)
      throw error
    }
  }

  async function updatePortfolioTracker(
    portfolioTrackerId: string,
    updates: PortfolioTrackerMonthlyUpdate
  ) {
    try {
      const cleanUpdates = cleanPortfolioTrackerMonthlyUpdates(updates)
      const updatedPortfolioTracker =
        await portfolioTrackerService.updatePortfolioTracker(
          portfolioTrackerId,
          cleanUpdates
        )

      const index = portfolioTrackers.value.findIndex(
        (t) => t.id === portfolioTrackerId
      )
      if (index !== -1) {
        portfolioTrackers.value[index] = {
          ...portfolioTrackers.value[index],
          ...updatedPortfolioTracker,
        }
      }
    } catch (error) {
      console.error('Error updating portfolio tracker:', error)
      throw error
    }
  }

  async function deletePortfolioTracker(portfolioTrackerId: string) {
    try {
      await portfolioTrackerService.deletePortfolioTracker(portfolioTrackerId)
      portfolioTrackers.value = portfolioTrackers.value.filter(
        (t) => t.id !== portfolioTrackerId
      )
    } catch (error) {
      console.error('Error deleting portfolio tracker:', error)
      throw error
    }
  }

  return {
    portfolioTrackers,
    totalsByCategory,
    monthlyTotals,
    fetchUserPortfolioTrackers,
    createPortfolioTracker,
    updatePortfolioTracker,
    deletePortfolioTracker,
  }
})
