<template>
  <div class="p-4 bg-surface text-text">
    <h1 class="text-2xl font-bold mb-4">{{ $t('pages.dashboard.title') }}</h1>

    <!-- Sommario finanziario -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card
        v-for="(summary, index) in financialSummary"
        :key="index"
        class="shadow-md"
      >
        <template #title>{{ $t(summary.label) }}</template>
        <template #content>
          <span class="text-2xl font-bold" :class="summary.colorClass">
            {{ formatCurrency(summary.value) }}
          </span>
        </template>
      </Card>
    </div>

    <!-- Grafico a torta per la regola 50/30/20 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <Card class="shadow-md">
        <template #title>{{ $t('pages.dashboard.budgetAllocation') }}</template>
        <template #content>
          <Chart
            type="pie"
            :data="budgetAllocationData"
            :options="chartOptions"
            class="h-64"
          />
        </template>
      </Card>

      <!-- Grafico a barre per entrate e spese -->
      <Card class="shadow-md">
        <template #title>{{ $t('pages.dashboard.incomeVsExpenses') }}</template>
        <template #content>
          <Chart
            type="bar"
            :data="incomeVsExpensesData"
            :options="chartOptions"
            class="h-64"
          />
        </template>
      </Card>
    </div>

    <!-- Ultime transazioni -->
    <Card class="shadow-md mb-8">
      <template #title>{{ $t('pages.dashboard.recentTransactions') }}</template>
      <template #content>
        <DataTable
          :value="recentTransactions"
          :rows="5"
          :paginator="true"
          responsive-layout="scroll"
        >
          <Column
            field="category.name"
            :header="$t('pages.transactions.category')"
            sortable
          />

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
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Chart from 'primevue/chart'
import { useTransactionStore } from '@/stores/transactionStore'

import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

import { formatCurrency, formatDate } from '@/utils/utils'
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
} = storeToRefs(transactionStore)

const { appUser } = storeToRefs(authStore)

const recentTransactions = computed(() => {
  return transactions.value.slice(0, 5)
})

const financialSummary = computed(() => [
  {
    label: 'pages.dashboard.totalIncome',
    value: totalIncome.value,
    colorClass: 'text-green-500',
  },
  {
    label: 'pages.dashboard.totalExpenses',
    value: totalExpenses.value,
    colorClass: 'text-red-500',
  },
  {
    label: 'pages.dashboard.shortTermInvestments',
    value: totalShortInvestment.value,
    colorClass: 'text-blue-500',
  },
  {
    label: 'pages.dashboard.longTermInvestments',
    value: totalLongInvestment.value,
    colorClass: 'text-purple-500',
  },
])

const budgetAllocationData = computed(() => {
  const income = totalIncome.value
  return {
    labels: [
      t('pages.dashboard.necessities'),
      t('pages.dashboard.wants'),
      t('pages.dashboard.savings'),
    ],
    datasets: [
      {
        data: [income * 0.5, income * 0.3, income * 0.2],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  }
})

const incomeVsExpensesData = computed(() => {
  return {
    labels: [t('pages.dashboard.income'), t('pages.dashboard.expenses')],
    datasets: [
      {
        label: t('pages.dashboard.amount'),
        data: [totalIncome.value, totalExpenses.value],
        backgroundColor: ['#4CAF50', '#F44336'],
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
}

const getAmountClass = (transaction: any) => {
  return transaction.category?.type?.name === 'income'
    ? 'text-green-500'
    : 'text-red-500'
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

    console.log(appUser.value)
    console.log(transactions.value)
    console.log(transactionStore.transactions)
  }
})
</script>
