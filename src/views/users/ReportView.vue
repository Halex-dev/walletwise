<template>
  <div class="report-view p-4 md:p-6 lg:p-8">
    <!-- Year Selection Controls -->
    <div class="mb-8">
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <div
          class="flex flex-col lg:flex-row gap-4 items-start lg:items-center"
        >
          <div class="flex-1">
            <label
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
            >
              {{ $t('pages.report.compareYears') }}
            </label>
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex-1">
                <Select
                  v-model="selectedYear1"
                  :options="availableYears"
                  optionLabel="label"
                  :placeholder="$t('pages.report.selectFirstYear')"
                  class="w-full transition-all duration-300 focus:shadow-lg"
                />
              </div>
              <div class="flex items-center justify-center px-4 py-2">
                <i class="pi pi-arrow-right text-gray-400"></i>
              </div>
              <div class="flex-1">
                <Select
                  v-model="selectedYear2"
                  :options="availableYears"
                  optionLabel="label"
                  :placeholder="$t('pages.report.selectSecondYear')"
                  class="w-full transition-all duration-300 focus:shadow-lg"
                />
              </div>
            </div>
          </div>
          <Button
            @click="refreshData"
            :label="$t('common.refresh')"
            icon="pi pi-refresh"
            class="p-button-outlined transition-all duration-300 hover:shadow-lg"
            :loading="isLoading"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-8">
      <!-- Loading Skeleton for Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="i in 4"
          :key="`metric-skeleton-${i}`"
          class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
            <div
              class="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"
            ></div>
          </div>
        </div>
      </div>

      <!-- Loading Skeleton for Charts -->
      <div class="space-y-6">
        <div
          v-for="i in 2"
          :key="`chart-skeleton-${i}`"
          class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div class="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!StatisticsYear1 && !StatisticsYear2 && !isLoading"
      class="text-center py-16"
    >
      <div
        class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <i class="pi pi-chart-line text-3xl text-gray-400"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {{ $t('pages.report.noData') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{ $t('pages.report.selectYearsToCompare') }}
      </p>
    </div>

    <!-- Comparison Results -->
    <div v-else class="space-y-8">
      <!-- Financial Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="(metric, index) in financialMetrics"
          :key="index"
          class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group hover:scale-105"
        >
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex-1">
                <h3
                  class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
                >
                  {{ $t(metric.label) }}
                </h3>
                <p :class="['text-2xl font-bold mb-1', metric.colorClass]">
                  {{ metric.value }}
                </p>
                <div
                  v-if="metric.difference && metric.opposite"
                  class="flex items-center gap-1"
                >
                  <i
                    :class="[
                      'pi text-xs',
                      metric.difference.startsWith('+')
                        ? ' pi-arrow-up text-red-500'
                        : 'pi-arrow-down text-green-500',
                    ]"
                  ></i>
                  <small
                    :class="[
                      'text-xs font-medium',
                      metric.difference.startsWith('+')
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400',
                    ]"
                  >
                    {{ metric.difference }}
                  </small>
                </div>
                <div
                  v-else-if="metric.difference"
                  class="flex items-center gap-1"
                >
                  <i
                    :class="[
                      'pi text-xs',
                      metric.difference.startsWith('+')
                        ? 'pi-arrow-up text-green-500'
                        : 'pi-arrow-down text-red-500',
                    ]"
                  ></i>
                  <small
                    :class="[
                      'text-xs font-medium',
                      metric.difference.startsWith('+')
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400',
                    ]"
                  >
                    {{ metric.difference }}
                  </small>
                </div>
              </div>
              <div
                class="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:scale-110 transition-all duration-300"
              >
                <i :class="[metric.icon, 'text-xl', metric.iconColorClass]"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Income vs Expenses Comparison Chart -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ $t('pages.report.incomeVsExpensesComparison') }}
            </h2>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">{{
                $t('pages.report.income')
              }}</span>
              <div class="w-3 h-3 bg-red-500 rounded-full ml-4"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">{{
                $t('pages.report.expenses')
              }}</span>
            </div>
          </div>
          <div class="relative">
            <Chart
              v-if="StatisticsYear2"
              type="bar"
              :data="incomeVsExpensesComparisonData"
              :options="barChartOptions"
              class="h-96"
            />
            <div v-else class="h-96 flex items-center justify-center">
              <div class="text-center">
                <i class="pi pi-chart-bar text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-500 dark:text-gray-400">
                  {{ $t('pages.report.selectBothYearsForComparison') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Expenses by Category Comparison Chart -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ $t('pages.report.expensesByCategoryComparison') }}
            </h2>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{
                selectedYear1.label
              }}</span>
              <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400 ml-4">{{
                selectedYear2.label
              }}</span>
              <div class="w-3 h-3 bg-blue-300 rounded-full"></div>
            </div>
          </div>
          <div class="relative">
            <div
              v-if="expensesByCategoryComparisonData.labels.length === 0"
              class="h-96 flex items-center justify-center"
            >
              <div class="text-center">
                <i class="pi pi-chart-pie text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-500 dark:text-gray-400">
                  {{ $t('pages.report.dataNotAviable') }}
                </p>
              </div>
            </div>
            <Chart
              v-else
              type="bar"
              :data="expensesByCategoryComparisonData"
              :options="barChartGroupedOptions"
              class="h-96"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { Statistics } from '@/types/transaction'
import {
  useStatisticStore,
  YearlyStatisticsData,
} from '@/stores/statisticStore'
import Select from 'primevue/select'
import { categoryColors } from '@/utils/colors'

const { t } = useI18n()
const authStore = useAuthStore()
const statisticStore = useStatisticStore()

const { appUser } = storeToRefs(authStore)

const StatisticsYear2 = ref<Statistics | undefined>()
const StatisticsYear1 = ref<Statistics | undefined>()

const selectedYear1 = ref<{ label: string; value: number }>({
  label: new Date().getFullYear().toString(),
  value: new Date().getFullYear(),
})
const selectedYear2 = ref<{ label: string; value: number }>({
  label: (new Date().getFullYear() - 1).toString(),
  value: new Date().getFullYear() - 1,
})

const isLoading = ref(false)

//TODO fare una funzione per gli anni
const availableYears = computed(() => {
  const years = []
  const currentYear = new Date().getFullYear()
  for (let i = currentYear; i >= currentYear - 2; i--) {
    years.push({ label: i.toString(), value: i })
  }
  return years
})

function calculateDifferences(value1: number, value2: number) {
  const difference = ((value1 - value2) / value2) * 100

  if (difference > 0) {
    return `+${difference.toFixed(2)}%`
  } else if (difference <= 0) {
    return `${difference.toFixed(2)}%`
  }
}

const financialMetrics = computed(() => {
  if (!StatisticsYear1.value) {
    return []
  }

  if (!StatisticsYear2.value) {
    return []
  }

  return [
    {
      label: 'pages.report.totalIncome',
      value: `€${StatisticsYear1.value.totalIncome}`,
      difference: `${calculateDifferences(StatisticsYear1.value.totalIncome, StatisticsYear2.value.totalIncome)} ${t(
        'pages.report.difference'
      )} ${selectedYear2.value.value}`,
      colorClass: 'text-green-600',
      iconColorClass: 'text-green-400',
      icon: 'pi pi-dollar',
    },
    {
      label: 'pages.report.totalExpenses',
      value: `€${StatisticsYear1.value.totalExpenses}`,
      difference: `${calculateDifferences(StatisticsYear1.value.totalExpenses, StatisticsYear2.value.totalExpenses)} ${t(
        'pages.report.difference'
      )} ${selectedYear2.value.value}`,
      colorClass: 'text-red-600',
      iconColorClass: 'text-red-400',
      icon: 'pi pi-shopping-cart',
      opposite: true,
    },
    {
      label: 'pages.report.totalInvestments',
      value: `€${
        StatisticsYear1.value.totalLongInvestment +
        StatisticsYear1.value.totalShortInvestment
      }`,
      difference: `${calculateDifferences(
        StatisticsYear1.value.totalLongInvestment +
          StatisticsYear1.value.totalShortInvestment,
        StatisticsYear2.value.totalLongInvestment +
          StatisticsYear2.value.totalShortInvestment
      )} ${t('pages.report.difference')} ${selectedYear2.value.value}`,
      colorClass: 'text-blue-600',
      iconColorClass: 'text-blue-400',
      icon: 'pi pi-chart-line',
    },
    {
      label: 'pages.report.totalSaved',
      value: `€${(
        StatisticsYear1.value?.totalIncome -
        StatisticsYear1.value?.totalExpenses +
        StatisticsYear1.value?.totalLongInvestment +
        StatisticsYear1.value?.totalShortInvestment
      ).toFixed(2)}`,
      difference: `${calculateDifferences(
        StatisticsYear1.value?.totalIncome -
          StatisticsYear1.value?.totalExpenses +
          StatisticsYear1.value?.totalLongInvestment +
          StatisticsYear1.value?.totalShortInvestment,
        StatisticsYear2.value?.totalIncome -
          StatisticsYear2.value?.totalExpenses +
          StatisticsYear2.value?.totalLongInvestment +
          StatisticsYear2.value?.totalShortInvestment
      )} ${t('pages.report.difference')} ${selectedYear2.value.value}`,
      colorClass: 'text-purple-600',
      iconColorClass: 'text-purple-400',
      icon: 'pi pi-wallet',
    },
  ]
})

async function fetchDataYear1() {
  if (!appUser.value) return

  try {
    const yearlyData = ref<YearlyStatisticsData>(
      await statisticStore.fetchYearStatisticsExport(
        appUser.value.id,
        selectedYear1.value.value,
        appUser.value?.start_month || 0
      )
    )

    if (!yearlyData.value) return

    StatisticsYear1.value = yearlyData.value.yearlyStatistics
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
  }
}

async function fetchDataYear2() {
  if (!appUser.value) return

  try {
    const yearlyData = ref<YearlyStatisticsData>(
      await statisticStore.fetchYearStatisticsExport(
        appUser.value.id,
        selectedYear2.value.value,
        appUser.value?.start_month || 0
      )
    )

    if (!yearlyData.value) return

    StatisticsYear2.value = yearlyData.value.yearlyStatistics
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
  }
}

function getMonthLabels() {
  const monthKeys = [
    'common.months.january',
    'common.months.february',
    'common.months.march',
    'common.months.april',
    'common.months.may',
    'common.months.june',
    'common.months.july',
    'common.months.august',
    'common.months.september',
    'common.months.october',
    'common.months.november',
    'common.months.december',
  ]

  return monthKeys.map(t) // Applica la traduzione a ciascun mese
}

const incomeVsExpensesComparisonData = computed(() => ({
  labels: getMonthLabels(),
  datasets: [
    {
      label: `${t('pages.report.income')} ${selectedYear1.value.label}`,
      data: StatisticsYear1.value?.monthlyIncome.map((amount) => amount),
      backgroundColor: '#4CAF50',
    },
    {
      label: `${t('pages.report.outflows')} ${selectedYear1.value.label}`,
      data: StatisticsYear1.value?.monthlyExpenses.map((amount) => amount),
      backgroundColor: '#F44336',
    },
    {
      label: `${t('pages.report.income')} ${selectedYear2.value.label}`,
      data: StatisticsYear2.value?.monthlyIncome.map((amount) => amount),
      backgroundColor: '#81C784',
    },
    {
      label: `${t('pages.report.outflows')} ${selectedYear2.value.label}`,
      data: StatisticsYear2.value?.monthlyExpenses.map((amount) => amount),
      backgroundColor: '#E57373',
    },
  ],
}))

const expensesByCategoryComparisonData = computed(() => {
  if (!StatisticsYear1.value || !StatisticsYear2.value) {
    return {
      labels: [],
      datasets: [],
    }
  }

  // Estrai le categorie e le spese per entrambi gli anni
  const categories = StatisticsYear1.value.expensesByCategory.map(
    (category) => category.name
  )

  const expensesYear1 = StatisticsYear1.value.expensesByCategory.map(
    (category) => category.amount
  )

  const expensesYear2 = StatisticsYear2.value.expensesByCategory.map(
    (category) => {
      const matchingCategory = StatisticsYear1.value?.expensesByCategory.find(
        (cat) => cat.name === category.name
      )
      return matchingCategory ? category.amount : 0
    }
  )

  // Assegna un colore unico a ogni categoria
  const backgroundColorsYear1 = categories.map(
    (_, index) => categoryColors[index % categoryColors.length]
  )
  const backgroundColorsYear2 = categories.map(
    (_, index) => `${categoryColors[index % categoryColors.length]}80` // Aggiungi trasparenza per l'anno 2
  )

  return {
    labels: categories,
    datasets: [
      {
        label: `${t('pages.report.expenses')} ${selectedYear1.value.label}`,
        data: expensesYear1,
        backgroundColor: backgroundColorsYear1, // Colori unici per l'anno 1
        borderColor: backgroundColorsYear1,
        borderWidth: 1,
      },
      {
        label: `${t('pages.report.expenses')} ${selectedYear2.value.label}`,
        data: expensesYear2,
        backgroundColor: backgroundColorsYear2, // Colori unici con trasparenza per l'anno 2
        borderColor: backgroundColorsYear2,
        borderWidth: 1,
      },
    ],
  }
})

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top', // Posizione della legenda
      labels: {
        color: '#333', // Colore del testo della legenda
      },
    },
    title: {
      display: true,
      color: '#333', // Colore del titolo
      font: {
        size: 16,
      },
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context: any) {
          const label = context.dataset.label || ''
          const value = context.raw || 0
          return `${label}: €${value.toFixed(2)}`
        },
      },
    },
  },
  scales: {
    x: {
      stacked: false, // Non stackare le barre
      grid: {
        display: false, // Nascondi la griglia sull'asse X
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#e0e0e0', // Colore della griglia sull'asse Y
      },
      ticks: {
        callback: function (value: any) {
          return `€${value}` // Aggiungi il simbolo dell'euro ai valori dell'asse Y
        },
      },
    },
  },
}

const barChartGroupedOptions = {
  indexAxis: 'y', // Imposta l'asse Y come asse principale (barre orizzontali)
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Nascondi la legenda
    },
    title: {
      display: true,
      color: '#333',
      font: {
        size: 16,
      },
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context: any) {
          const label = context.dataset.label || ''
          const value = context.raw || 0
          return `${label}: €${value.toFixed(2)}`
        },
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: '#e0e0e0', // Colore della griglia sull'asse X
      },
      ticks: {
        callback: function (value: any) {
          return `€${value}` // Aggiungi il simbolo dell'euro ai valori dell'asse X
        },
      },
    },
    y: {
      grid: {
        display: false, // Nascondi la griglia sull'asse Y
      },
      ticks: {
        // Mostra i nomi delle categorie sull'asse Y
        callback: function (_value: any, index: number) {
          return expensesByCategoryComparisonData.value.labels[index]
        },
      },
    },
  },
}

onMounted(() => {
  if (appUser.value) {
    fetchDataYear1()
    fetchDataYear2()
  }
})

watch(selectedYear1, async () => {
  await fetchDataYear1()
})

watch(selectedYear2, async () => {
  await fetchDataYear2()
})

async function refreshData() {
  isLoading.value = true
  try {
    await Promise.all([fetchDataYear1(), fetchDataYear2()])
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.report-view {
  min-height: 100vh;
}

.metric-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.metric-card:hover {
  transform: translateY(-4px);
}

.chart-container {
  position: relative;
  overflow: hidden;
}

@media (max-width: 640px) {
  .metric-card:hover {
    transform: translateY(-2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .metric-card,
  .chart-container {
    transition: none !important;
  }

  .metric-card:hover {
    transform: none !important;
  }
}
</style>
