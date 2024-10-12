<template>
  <div
    class="portfolio-tracker min-h-screen p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900"
  >
    <div class="max-w-full mx-auto overflow-x-auto">
      <h1
        class="text-3xl md:text-4xl font-bold mb-8 text-gray-800 dark:text-white"
      >
        Portfolio Tracker
      </h1>

      <div class="mb-4 flex justify-between items-center">
        <Button label="Add Category" icon="pi pi-plus" @click="addCategory" />
      </div>

      <!-- DATA TABLE -->
      <DataTable
        :value="portfolioTrackers"
        editMode="cell"
        class="p-datatable-sm"
        responsive-layout="scroll"
      >
        <Column field="category" header="Category" :rowEditor="true">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" autofocus />
          </template>
        </Column>
        <Column
          v-for="month in months"
          :key="month"
          :field="month"
          :header="month"
          :rowEditor="true"
        >
          <template #body="{ data, field }">
            {{ formatCurrencyForCurrentUser(data[field]) }}
          </template>
          <template #editor="{ data, field }">
            <InputNumber
              v-model="data[field]"
              mode="currency"
              currency="EUR"
              locale="it-IT"
            />
          </template>
        </Column>
        <Column header="Actions" bodyStyle="text-align:center">
          <template #body="slotProps">
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger p-button-text"
              @click="removeCategory(slotProps.index)"
            />
          </template>
        </Column>
      </DataTable>

      <!-- Summary -->
      <div class="mt-8">
        <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Summary
        </h2>
        <DataTable
          :value="summarizedData"
          class="p-datatable-sm"
          responsive-layout="scroll"
          v-model:expandedRows="expandedRows"
          @row-expand="onRowExpand"
          @row-collapse="onRowCollapse"
        >
          <Column :expander="true" style="width: 3rem" />
          <Column field="month" header="Month" />
          <Column field="total" header="Total">
            <template #body="slotProps">
              {{ formatCurrencyForCurrentUser(slotProps.data.total) }}
            </template>
          </Column>
          <Column field="change" header="Change">
            <template #body="slotProps">
              <span :class="getChangeColor(slotProps.data.change)">
                {{ formatPercentageForUser(slotProps.data.change, appUser) }}
              </span>
            </template>
          </Column>
          <template #expansion="slotProps">
            <div class="p-3">
              <h3 class="text-lg font-semibold mb-2">
                Category Breakdown for {{ slotProps.data.month }}
              </h3>
              <DataTable
                :value="getCategoryBreakdown(slotProps.data.month)"
                class="p-datatable-sm"
              >
                <Column field="category" header="Category" />
                <Column field="value" header="Value">
                  <template #body="subSlotProps">
                    {{ formatCurrencyForCurrentUser(subSlotProps.data.value) }}
                  </template>
                </Column>
                <Column field="percentage" header="Percentage">
                  <template #body="subSlotProps">
                    {{
                      formatPercentageForUser(
                        subSlotProps.data.percentage,
                        appUser
                      )
                    }}
                  </template>
                </Column>
              </DataTable>
            </div>
          </template>
        </DataTable>
      </div>

      <div class="mt-8">
        <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Performance Chart
        </h2>
        <Chart
          type="line"
          :data="chartData"
          :options="chartOptions"
          style="height: 400px"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePortfolioTrackerStore } from '@/stores/portfolioStore'
import { useAuthStore } from '@/stores/authStore'
import { formatPercentageForUser } from '@/utils/users'
import { formatCurrencyForCurrentUser } from '@/utils/users'
import { storeToRefs } from 'pinia'
import { getYear } from 'date-fns'

const { t } = useI18n()
const authStore = useAuthStore()
const portfolioStore = usePortfolioTrackerStore()

const { totalsByCategory, monthlyTotals, portfolioTrackers } =
  storeToRefs(portfolioStore)
const { appUser } = storeToRefs(authStore)

onMounted(async () => {
  if (appUser.value) {
    const year = getYear(new Date())
    await portfolioStore.fetchUserPortfolioTrackers(appUser.value.id, year)
  }
})

const months = ref([
  t('pages.portfolio.month.january'),
  t('pages.portfolio.month.february'),
  t('pages.portfolio.month.march'),
  t('pages.portfolio.month.april'),
  t('pages.portfolio.month.may'),
  t('pages.portfolio.month.june'),
  t('pages.portfolio.month.july'),
  t('pages.portfolio.month.august'),
  t('pages.portfolio.month.september'),
  t('pages.portfolio.month.october'),
  t('pages.portfolio.month.november'),
  t('pages.portfolio.month.december'),
])

const expandedRows = ref([])

const summarizedData = computed(() => {
  return months.value.map((month, _index) => {
    const total = 50 //totale all
    const prevTotal = 20 //Totale dei mesi precedenti
    const change = (total - prevTotal) / prevTotal
    return { month, total, change }
  })
})

const chartData = computed(() => ({
  labels: months.value,
  datasets: [
    {
      label: 'Total Portfolio Value',
      data: summarizedData.value.map((item) => item.total),
      fill: false,
      borderColor: '#4bc0c0',
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: false,
    },
  },
}

function getCategoryBreakdown(month: string) {
  const total =
    summarizedData.value.find((data) => data.month === month)?.total || 0
  return portfolioTrackers.value
    .map((row) => ({
      category: row.category,
      value: 0,
      percentage: 0 / total,
    }))
    .sort((a, b) => b.value - a.value) // Ordina per valore decrescente
}

function onRowExpand(event: any) {
  console.log('Row Expand:', event.data)
  // Puoi aggiungere logica qui se necessario quando una riga viene espansa
}

function onRowCollapse(event: any) {
  console.log('Row collapsed:', event.data)
  // Puoi aggiungere logica qui se necessario quando una riga viene collassata
}

function getChangeColor(change: number): string {
  return change > 0
    ? 'text-green-500'
    : change < 0
      ? 'text-red-500'
      : 'text-gray-500'
}

function addCategory() {}

function removeCategory(_index: number) {}
</script>

<style scoped>
.portfolio-tracker {
  font-family: Arial, sans-serif;
}
</style>
