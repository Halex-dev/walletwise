<template>
  <div class="dashboard p-4 md:p-6 lg:p-8 bg-surface text-text">
    <h1 class="text-3xl font-bold mb-8">
      {{ $t('pages.dashboard.welcome') }} {{ appUser?.username }}
    </h1>

    <!-- Month Navigation -->
    <div class="flex justify-between items-center mb-8">
      <Button
        icon="pi pi-chevron-left"
        class="p-button-text"
        @click="prevMonth"
        :disabled="isLoading"
      />
      <h2 class="text-xl font-semibold">
        {{ currentMonth }}
      </h2>
      <Button
        icon="pi pi-chevron-right"
        class="p-button-text"
        @click="nextMonth"
        :disabled="isLoading"
      />
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="flex justify-center items-center mb-8">
      <ProgressSpinner />
    </div>

    <!-- Financial Summary -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      <Card
        v-for="(summary, index) in financialSummary"
        :key="index"
        class="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold text-gray-500 mb-1">
                {{ $t(summary.label) }}
              </h3>
              <p :class="['text-2xl font-bold', summary.colorClass]">
                {{ formatCurrencyForCurrentUser(summary.value) }}
              </p>
            </div>
            <i :class="[summary.icon, 'text-4xl', summary.iconColorClass]"></i>
          </div>
        </template>
      </Card>
    </div>

    <!-- Budget Rules and Charts -->
    <div v-if="!isLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Budget Rules -->
      <Card class="shadow-lg">
        <template #title>
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold">
              {{ $t('pages.dashboard.budgetRules') }}
            </h2>
            <Select
              v-model="selectedBudgetRule"
              :options="budgetRules"
              optionLabel="name"
              class="w-48"
            />
          </div>
        </template>
        <template #content>
          <TransitionGroup name="list" tag="div">
            <div
              v-for="category in selectedBudgetRule.categories"
              :key="category.name"
              class="mb-6"
            >
              <div class="flex justify-between mb-2">
                <span class="font-semibold">{{ category.name }}</span>
                <span :class="getBudgetStatusClass(category)">
                  {{ formatCurrencyForCurrentUser(category.spent) }} /
                  {{ formatCurrencyForCurrentUser(category.limit) }}
                </span>
              </div>
              <ProgressBar
                :value="calculatePercentage(category.spent, category.limit)"
                :class="category.colorClass"
                :pt="{
                  root: { class: 'h-4 rounded-full' },
                  value: { class: 'rounded-full' },
                }"
              />
              <small
                v-if="!isNaN(category.spent / category.limit)"
                class="text-gray-500"
              >
                {{ formatPercentage(category.spent / category.limit) }}
                {{ $t('pages.dashboard.used') }}
              </small>
            </div>
          </TransitionGroup>
        </template>
      </Card>

      <!-- Expenses by Category Chart -->
      <Card class="shadow-lg">
        <template #title>
          <h2 class="text-xl font-semibold">
            {{ $t('pages.dashboard.expensesByCategory') }}
          </h2>
        </template>
        <template #content>
          <Chart
            v-if="expensesByCategoryData.datasets[0].data.length > 0"
            type="doughnut"
            :data="expensesByCategoryData"
            :options="doughnutChartOptions"
            class="h-80"
          />
        </template>
      </Card>
    </div>

    <!-- Expenses by Category and Recent Transactions -->
    <div v-if="!isLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Income vs Expenses Chart -->
      <Card class="shadow-lg">
        <template #title>
          <h2 class="text-xl font-semibold">
            {{ $t('pages.dashboard.incomeVsExpenses') }}
          </h2>
        </template>
        <template #content>
          <Chart
            v-if="incomeVsExpensesData.datasets[0].data.length > 0"
            type="line"
            :data="incomeVsExpensesData"
            :options="lineChartOptions"
            class="h-80"
          />
        </template>
      </Card>

      <!-- Recent Transactions -->
      <Card class="shadow-lg">
        <template #title>
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold">
              {{ $t('pages.dashboard.recentTransactions') }}
            </h2>
            <Button
              :label="$t('pages.dashboard.viewAll')"
              class="p-button-text"
              @click="navigateToTransactions"
            />
          </div>
        </template>
        <template #content>
          <DataTable
            :value="recentTransactions"
            :rows="5"
            :paginator="false"
            responsive-layout="stack"
            class="p-datatable-sm"
            :pt="{
              wrapper: { class: 'overflow-x-auto' },
              headerCell: {
                class:
                  'bg-surface-100 text-surface-700 border-b border-surface-200 p-3',
              },
              bodyCell: { class: 'p-3 border-b border-surface-200' },
            }"
          >
            <Column
              field="category.name"
              :header="$t('pages.transactions.category')"
              sortable
            >
              <template #body="slotProps">
                <Tag
                  :value="slotProps.data.category.name"
                  :severity="getCategoryTagSeverity(slotProps.data.category)"
                />
              </template>
            </Column>
            <Column
              field="amount"
              :header="$t('pages.transactions.amount')"
              sortable
            >
              <template #body="slotProps">
                <span :class="getAmountColor(slotProps.data)">
                  {{ formatCurrencyForCurrentUser(slotProps.data.amount) }}
                </span>
              </template>
            </Column>
            <Column
              field="date"
              :header="$t('pages.transactions.date')"
              sortable
            >
              <template #body="slotProps">
                {{ formatDateForUser(slotProps.data.date, appUser) }}
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useTransactionStore } from '@/stores/transactionStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { formatPercentage, calculatePercentage } from '@/utils/utils'
import {
  calculateDateRange,
  formatDateForAPI,
  getDateOfYear,
} from '@/utils/date'
import {
  getCategoryTagSeverity,
  getAmountColor,
  getBudgetStatusClass,
} from '@/utils/colors'
import { formatDateForUser } from '@/utils/users'
import { formatCurrencyForCurrentUser } from '@/utils/users'
import { Statistics, Transaction } from '@/types/transaction'

const { t } = useI18n()
const router = useRouter()
const transactionStore = useTransactionStore()
const authStore = useAuthStore()

const { transactions, StatisticsMonth } = storeToRefs(transactionStore)
const { appUser } = storeToRefs(authStore)

const StatisticsYear = ref<Statistics>({
  totalIncome: 0,
  totalExpenses: 0,
  totalNecessary: 0,
  totalOptional: 0,
  totalShortInvestment: 0,
  totalLongInvestment: 0,
  expensesByCategory: [],
  monthLabels: [],
  monthlyIncome: [],
  monthlyExpenses: [],
})

const isLoading = ref(false)
const recentTransactions = computed(() => transactions.value.slice(0, 5))

const financialSummary = computed(() => [
  {
    label: 'pages.dashboard.totalIncome',
    value: StatisticsMonth.value.totalIncome,
    colorClass: 'text-green-600',
    iconColorClass: 'text-green-400',
    icon: 'pi pi-dollar',
  },
  {
    label: 'pages.dashboard.totalExpenses',
    value: StatisticsMonth.value.totalExpenses,
    colorClass: 'text-red-600',
    iconColorClass: 'text-red-400',
    icon: 'pi pi-shopping-cart',
  },
  {
    label: 'pages.dashboard.totalInvestments',
    value:
      StatisticsMonth.value.totalShortInvestment +
      StatisticsMonth.value.totalLongInvestment,
    colorClass: 'text-blue-600',
    iconColorClass: 'text-blue-400',
    icon: 'pi pi-chart-line',
  },
  {
    label: 'pages.dashboard.totalSavings',
    value:
      StatisticsMonth.value.totalIncome -
      StatisticsMonth.value.totalExpenses -
      StatisticsMonth.value.totalShortInvestment -
      StatisticsMonth.value.totalLongInvestment,
    colorClass: 'text-purple-600',
    iconColorClass: 'text-purple-400',
    icon: 'pi pi-wallet',
  },
])

const budgetRules = computed(() => [
  {
    name: '50/30/20 Rule',
    categories: [
      {
        name: 'Necessities',
        limit: StatisticsMonth.value.totalIncome * 0.5,
        spent: StatisticsMonth.value.totalNecessary,
        colorClass: 'bg-blue-500',
      },
      {
        name: 'Wants',
        limit: StatisticsMonth.value.totalIncome * 0.3,
        spent: StatisticsMonth.value.totalOptional,
        colorClass: 'bg-green-500',
      },
      {
        name: 'Savings & Investments',
        limit: StatisticsMonth.value.totalIncome * 0.2,
        spent:
          StatisticsMonth.value.totalShortInvestment +
          StatisticsMonth.value.totalLongInvestment,
        colorClass: 'bg-yellow-500',
      },
    ],
  },
  {
    name: '80/20 Savings Rule',
    categories: [
      {
        name: 'Spending',
        limit: StatisticsMonth.value.totalIncome * 0.8,
        spent: StatisticsMonth.value.totalExpenses,
        colorClass: 'bg-purple-500',
      },
      {
        name: 'Savings & Investments',
        limit: StatisticsMonth.value.totalIncome * 0.2,
        spent:
          StatisticsMonth.value.totalShortInvestment +
          StatisticsMonth.value.totalLongInvestment,
        colorClass: 'bg-indigo-500',
      },
    ],
  },
])

const TransactionsYear = ref<Transaction[] | undefined>()

const selectedBudgetRule = ref(budgetRules.value[0])

const incomeVsExpensesData = computed(() => ({
  labels: StatisticsYear.value.monthLabels,
  datasets: [
    {
      label: t('pages.dashboard.income'),
      data: StatisticsYear.value.monthlyIncome,
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.2)',
      tension: 0.4,
      fill: true,
    },
    {
      label: t('pages.dashboard.expenses'),
      data: StatisticsYear.value.monthlyExpenses,
      borderColor: '#F44336',
      backgroundColor: 'rgba(244, 67, 54, 0.2)',
      tension: 0.4,
      fill: true,
    },
  ],
}))

const expensesByCategoryData = computed(() => ({
  labels: StatisticsMonth.value.expensesByCategory.map(
    (category) => category.name
  ),
  datasets: [
    {
      data: StatisticsMonth.value.expensesByCategory.map(
        (category) => category.amount
      ),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
      ],
    },
  ],
}))

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: { mode: 'index', intersect: false },
  },
  scales: { y: { beginAtZero: true } },
}

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'right' } },
}

const currentDate = ref(new Date())
const currentMonth = ref(
  currentDate.value.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })
)

// Fetch transactions of the month selected
async function fetchTransactions() {
  if (!appUser.value) return

  isLoading.value = true
  try {
    const dateRange = calculateDateRange(
      appUser.value?.start_month || 1,
      currentDate.value
    )

    currentMonth.value = currentDate.value.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    })

    await transactionStore.fetchUserTransactions(
      appUser.value.id,
      formatDateForAPI(dateRange[0]),
      formatDateForAPI(dateRange[1])
    )
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
  } finally {
    selectedBudgetRule.value = budgetRules.value[0]
    isLoading.value = false
  }
}

// Fetch transactions of the year for statistics
async function fetchTransactionsYear() {
  if (!appUser.value) return

  isLoading.value = true
  try {
    const dateRange = getDateOfYear(appUser.value?.start_month || 1)

    const { transactions, statistics } =
      await transactionStore.fetchTransactionsExport(
        appUser.value.id,
        formatDateForAPI(dateRange[0]),
        formatDateForAPI(dateRange[1])
      )

    TransactionsYear.value = transactions
    StatisticsYear.value = statistics
  } catch (error) {
    console.error('Failed to fetch transactions of the year:', error)
  } finally {
    isLoading.value = false
  }
}

function prevMonth() {
  currentDate.value.setMonth(currentDate.value.getMonth() - 1)
  fetchTransactions()
}

function nextMonth() {
  currentDate.value.setMonth(currentDate.value.getMonth() + 1)
  fetchTransactions()
}

function navigateToTransactions() {
  router.push({ name: 'transactions' })
}

onMounted(async () => {
  if (appUser.value) {
    await fetchTransactions()
    await fetchTransactionsYear()
  }
})

watch(appUser, async (newUser) => {
  if (newUser) {
    await fetchTransactions()
  }
})
</script>
