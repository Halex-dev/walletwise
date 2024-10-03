<!-- DashboardView.vue -->
<template>
  <div class="p-4 bg-surface text-text">
    <h1 class="text-3xl font-bold mb-6">
      {{ $t('pages.dashboard.welcome') }} {{ appUser?.username }}
    </h1>

    <!-- Sommario finanziario -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card
        v-for="(summary, index) in financialSummary"
        :key="index"
        class="shadow-md"
      >
        <template #header>
          <div
            class="flex items-center justify-between p-3 bg-primary bg-opacity-10"
          >
            <i :class="summary.icon" class="text-2xl text-primary"></i>
            <span class="text-sm font-semibold">{{ $t(summary.label) }}</span>
          </div>
        </template>
        <template #content>
          <div class="text-center">
            <span class="text-2xl font-bold" :class="summary.colorClass">
              {{ formatCurrency(summary.value) }}
            </span>
          </div>
        </template>
      </Card>
    </div>

    <!-- Regole di budget -->
    <Card class="shadow-md mb-8">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">
            {{ $t('pages.dashboard.budgetRules') }}
          </h2>
          <Dropdown
            v-model="selectedBudgetRule"
            :options="budgetRules"
            optionLabel="name"
            class="w-40"
          />
        </div>
      </template>
      <template #content>
        <div
          v-for="(category, index) in selectedBudgetRule.categories"
          :key="index"
          class="mb-4"
        >
          <div class="flex justify-between mb-2">
            <span class="font-semibold">{{ category.name }}</span>
            <span>
              {{ formatCurrency(category.spent) }} /
              {{ formatCurrency(category.limit) }} ({{
                formatPercentage(category.spent / category.limit)
              }})
            </span>
          </div>
          <ProgressBar
            :value="(category.spent / category.limit) * 100"
            :class="category.colorClass"
          />
        </div>
      </template>
    </Card>

    <!-- Grafici -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Grafico a linee per entrate e spese -->
      <Card class="shadow-md">
        <template #header>
          <h2 class="text-xl font-semibold">
            {{ $t('pages.dashboard.incomeVsExpenses') }}
          </h2>
        </template>
        <template #content>
          <Chart
            type="line"
            :data="incomeVsExpensesData"
            :options="lineChartOptions"
            class="h-64"
          />
        </template>
      </Card>

      <!-- Grafico a torta per categorie di spesa -->
      <Card class="shadow-md">
        <template #header>
          <h2 class="text-xl font-semibold">
            {{ $t('pages.dashboard.expensesByCategory') }}
          </h2>
        </template>
        <template #content>
          <Chart
            type="pie"
            :data="expensesByCategoryData"
            :options="pieChartOptions"
            class="h-64"
          />
        </template>
      </Card>
    </div>

    <!-- Ultime transazioni -->
    <Card class="shadow-md mb-8">
      <template #header>
        <h2 class="text-xl font-semibold">
          {{ $t('pages.dashboard.recentTransactions') }}
        </h2>
      </template>
      <template #content>
        <DataTable
          :value="recentTransactions"
          :rows="5"
          :paginator="true"
          responsive-layout="stack"
          class="p-datatable-sm"
        >
          <Column
            field="category.name"
            :header="$t('pages.transactions.category')"
            sortable
          >
            <template #body="slotProps">
              <div class="flex items-center">
                <i
                  :class="getCategoryIcon(slotProps.data.category)"
                  class="mr-2"
                ></i>
                {{ slotProps.data.category.name }}
              </div>
            </template>
          </Column>
          <Column
            field="amount"
            :header="$t('pages.transactions.amount')"
            sortable
          >
            <template #body="slotProps">
              <span :class="getAmountClass(slotProps.data)">
                {{ formatCurrency(slotProps.data.amount) }}
              </span>
            </template>
          </Column>
          <Column
            field="description"
            :header="$t('pages.transactions.description')"
            class="hidden sm:table-cell"
          />
          <Column field="date" :header="$t('pages.transactions.date')" sortable>
            <template #body="slotProps">
              {{ formatDate(slotProps.data.date) }}
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTransactionStore } from '@/stores/transactionStore'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency, formatDate, formatPercentage } from '@/utils/utils'
import { calculateDateRange, formatDateForAPI } from '@/utils/date'

const { t } = useI18n()
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
    colorClass: 'text-green-500',
    icon: 'pi pi-dollar',
  },
  {
    label: 'pages.dashboard.totalExpenses',
    value: totalExpenses.value,
    colorClass: 'text-red-500',
    icon: 'pi pi-shopping-cart',
  },
  {
    label: 'pages.dashboard.totalInvestments',
    value: totalShortInvestment.value + totalLongInvestment.value,
    colorClass: 'text-blue-500',
    icon: 'pi pi-chart-line',
  },
  {
    label: 'pages.dashboard.totalSavings',
    value: totalIncome.value - totalExpenses.value,
    colorClass: 'text-purple-500',
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
      tension: 0.4,
    },
    {
      label: t('pages.dashboard.expenses'),
      data: transactionStore.monthlyExpenses,
      borderColor: '#F44336',
      tension: 0.4,
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
    legend: {
      position: 'bottom',
    },
  },
}

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
    },
  },
}

const getAmountClass = (transaction: any) => {
  return transaction.category?.type?.name === 'income'
    ? 'text-green-500'
    : 'text-red-500'
}

const getCategoryIcon = (category: any) => {
  // Implementa la logica per ottenere l'icona della categoria
  const iconMap: { [key: string]: string } = {
    income: 'pi pi-dollar',
    necessary_expense: 'pi pi-home',
    optional_expense: 'pi pi-shopping-cart',
    short_term_investment: 'pi pi-chart-line',
    long_term_investment: 'pi pi-chart-bar',
  }
  return iconMap[category?.type?.name] || 'pi pi-tag'
}

async function fetchTransactions() {
  if (!appUser.value) return

  const dateRange = calculateDateRange(appUser.value?.start_month || 1)
  await transactionStore.fetchUserTransactions(
    appUser.value.id,
    formatDateForAPI(dateRange[0]),
    formatDateForAPI(dateRange[1])
  )
}

onMounted(async () => {
  if (appUser.value) {
    await fetchTransactions()
  }

  selectedBudgetRule.value = budgetRules.value[0]
})
</script>
