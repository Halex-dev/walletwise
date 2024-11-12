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
      />
      <h2 class="text-xl font-semibold">
        {{ currentMonth }}
      </h2>
      <Button
        icon="pi pi-chevron-right"
        class="p-button-text"
        @click="nextMonth"
      />
    </div>

    <!-- Financial Summary -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
              <small class="text-gray-500">
                {{ formatPercentage(category.spent / category.limit) }}
                {{ $t('pages.dashboard.used') }}
              </small>
            </div>
          </TransitionGroup>
        </template>
      </Card>

      <!-- Income vs Expenses Chart -->
      <Card class="shadow-lg">
        <template #title>
          <h2 class="text-xl font-semibold">
            {{ $t('pages.dashboard.incomeVsExpenses') }}
          </h2>
        </template>
        <template #content>
          <Chart
            type="line"
            :data="incomeVsExpensesData"
            :options="lineChartOptions"
            class="h-80"
          />
        </template>
      </Card>
    </div>

    <!-- Expenses by Category and Recent Transactions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Expenses by Category Chart -->
      <Card class="shadow-lg">
        <template #title>
          <h2 class="text-xl font-semibold">
            {{ $t('pages.dashboard.expensesByCategory') }}
          </h2>
        </template>
        <template #content>
          <Chart
            type="doughnut"
            :data="expensesByCategoryData"
            :options="doughnutChartOptions"
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
import { calculateDateRange, formatDateForAPI } from '@/utils/date'
import {
  getCategoryTagSeverity,
  getAmountColor,
  getBudgetStatusClass,
} from '@/utils/colors'
import { formatDateForUser } from '@/utils/users'
import { formatCurrencyForCurrentUser } from '@/utils/users'

const { t } = useI18n()
const router = useRouter()
const transactionStore = useTransactionStore()
const authStore = useAuthStore()

const {
  transactions,
  totalIncome,
  totalExpenses,
  totalShortInvestment,
  totalLongInvestment,
  totalNecessary,
  totalOptional,
  expensesByCategory,
} = storeToRefs(transactionStore)
const { appUser } = storeToRefs(authStore)

const recentTransactions = computed(() => transactions.value.slice(0, 5))

const financialSummary = computed(() => [
  {
    label: 'pages.dashboard.totalIncome',
    value: totalIncome.value,
    colorClass: 'text-green-600',
    iconColorClass: 'text-green-400',
    icon: 'pi pi-dollar',
  },
  {
    label: 'pages.dashboard.totalExpenses',
    value: totalExpenses.value,
    colorClass: 'text-red-600',
    iconColorClass: 'text-red-400',
    icon: 'pi pi-shopping-cart',
  },
  {
    label: 'pages.dashboard.totalInvestments',
    value: totalShortInvestment.value + totalLongInvestment.value,
    colorClass: 'text-blue-600',
    iconColorClass: 'text-blue-400',
    icon: 'pi pi-chart-line',
  },
  {
    label: 'pages.dashboard.totalSavings',
    value:
      totalIncome.value -
      totalExpenses.value -
      totalShortInvestment.value -
      totalLongInvestment.value,
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
        limit: totalIncome.value * 0.5,
        spent: totalNecessary.value,
        colorClass: 'bg-blue-500',
      },
      {
        name: 'Wants',
        limit: totalIncome.value * 0.3,
        spent: totalOptional.value,
        colorClass: 'bg-green-500',
      },
      {
        name: 'Savings & Investments',
        limit: totalIncome.value * 0.2,
        spent: totalShortInvestment.value + totalLongInvestment.value,
        colorClass: 'bg-yellow-500',
      },
    ],
  },
  {
    name: '80/20 Savings Rule',
    categories: [
      {
        name: 'Spending',
        limit: totalIncome.value * 0.8,
        spent: totalExpenses.value,
        colorClass: 'bg-purple-500',
      },
      {
        name: 'Savings & Investments',
        limit: totalIncome.value * 0.2,
        spent: totalShortInvestment.value + totalLongInvestment.value,
        colorClass: 'bg-indigo-500',
      },
    ],
  },
])

const selectedBudgetRule = ref(budgetRules.value[0])

const incomeVsExpensesData = computed(() => ({
  labels: transactionStore.monthLabels,
  datasets: [
    {
      label: t('pages.dashboard.income'),
      data: transactionStore.monthlyIncome,
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.2)',
      tension: 0.4,
      fill: true,
    },
    {
      label: t('pages.dashboard.expenses'),
      data: transactionStore.monthlyExpenses,
      borderColor: '#F44336',
      backgroundColor: 'rgba(244, 67, 54, 0.2)',
      tension: 0.4,
      fill: true,
    },
  ],
}))

const expensesByCategoryData = computed(() => ({
  labels: expensesByCategory.value.map((category) => category.name),
  datasets: [
    {
      data: expensesByCategory.value.map((category) => category.amount),
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
const currentMonth = computed(() =>
  currentDate.value.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })
)

async function fetchTransactions() {
  if (!appUser.value) return

  const dateRange = calculateDateRange(currentDate.value)
  await transactionStore.fetchUserTransactions(
    appUser.value.id,
    formatDateForAPI(dateRange[0]),
    formatDateForAPI(dateRange[1])
  )
}

function navigateToTransactions() {
  router.push({ name: 'transactions' })
}

function prevMonth() {
  currentDate.value.setMonth(currentDate.value.getMonth() - 1)
  fetchTransactions()
}

function nextMonth() {
  currentDate.value.setMonth(currentDate.value.getMonth() + 1)
  fetchTransactions()
}

onMounted(async () => {
  if (appUser.value) {
    await fetchTransactions()
  }

  selectedBudgetRule.value = budgetRules.value[0]
})

// Aggiungiamo un watch per aggiornare i dati quando l'utente cambia
watch(appUser, async (newUser) => {
  if (newUser) {
    await fetchTransactions()
  }
})
</script>
