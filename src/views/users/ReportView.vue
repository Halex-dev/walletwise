<template>
  <div class="report-view p-4 md:p-6 lg:p-8 bg-surface text-text">
    <!-- Year Selection -->
    <div class="flex flex-wrap gap-4 mb-8">
      <Select
        v-model="selectedYear1"
        :options="availableYears"
        optionLabel="label"
        placeholder="Seleziona il primo anno"
        class="w-64"
      />
      <Select
        v-model="selectedYear2"
        :options="availableYears"
        optionLabel="label"
        placeholder="Seleziona il secondo anno"
        class="w-64"
      />
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="flex justify-center items-center mb-8">
      <ProgressSpinner />
    </div>

    <!-- Comparison Results -->
    <div v-else>
      <!-- Financial Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card
          v-for="(metric, index) in financialMetrics"
          :key="index"
          class="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-semibold text-gray-500 mb-1">
                  {{ $t(metric.label) }}
                </h3>
                <p :class="['text-2xl font-bold', metric.colorClass]">
                  {{ metric.value }}
                </p>
                <small v-if="metric.difference" class="text-gray-500">
                  {{ metric.difference }}
                </small>
              </div>
              <i :class="[metric.icon, 'text-4xl', metric.iconColorClass]"></i>
            </div>
          </template>
        </Card>
      </div>

      <!-- Income vs Expenses Comparison Chart -->
      <Card class="shadow-lg mb-8">
        <template #title>
          <h2 class="text-xl font-semibold">
            {{ $t('pages.report.incomeVsExpensesComparison') }}
          </h2>
        </template>
        <template #content>
          <Chart
            v-if="StatisticsYear2"
            type="bar"
            :data="incomeVsExpensesComparisonData"
            :options="barChartOptions"
            class="h-96"
          />
        </template>
      </Card>

      <!-- Expenses by Category Comparison Chart -->
      <Card class="shadow-lg mb-8">
        <template #title>
          <h2 class="text-xl font-semibold">
            {{ $t('pages.report.expensesByCategoryComparison') }}
          </h2>
        </template>
        <template #content>
          <div v-if="expensesByCategoryComparisonData.labels.length === 0">
            <p class="text-gray-500">
              {{ $t('pages.report.dataNotAviable') }}
            </p>
          </div>
          <Chart
            v-else
            type="bar"
            :data="expensesByCategoryComparisonData"
            :options="barChartGroupedOptions"
            class="h-96"
          />
        </template>
      </Card>
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
</script>
