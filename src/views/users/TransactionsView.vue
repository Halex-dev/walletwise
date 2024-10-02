<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">
      {{ $t('pages.transactions.title') }}
    </h1>

    <!-- Filtri e controlli -->
    <div class="mb-4 flex flex-wrap gap-4">
      <DatePicker v-model="dateRange" selectionMode="range" :showIcon="true" />
      <Button @click="fetchTransactions">{{ $t('common.search') }}</Button>
      <Button @click="showNewTransactionDialog" severity="success">
        {{ $t('pages.transactions.new') }}
      </Button>
    </div>

    <!-- Statistiche -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <Card>
        <template #title>{{ $t('pages.transactions.totalIncome') }}</template>
        <template #content>
          <span class="text-2xl font-bold text-green-600">{{
            formatCurrency(transactionStore.totalIncome)
          }}</span>
        </template>
      </Card>
      <Card>
        <template #title>{{ $t('pages.transactions.totalExpenses') }}</template>
        <template #content>
          <span class="text-2xl font-bold text-red-600">{{
            formatCurrency(transactionStore.totalExpenses)
          }}</span>
        </template>
      </Card>
      <Card>
        <template #title>{{ $t('pages.transactions.balance') }}</template>
        <template #content>
          <span
            class="text-2xl font-bold"
            :class="balance >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ formatCurrency(balance) }}
          </span>
        </template>
      </Card>
    </div>

    <!-- Tabella delle transazioni -->
    <DataTable
      :value="transactions"
      :paginator="true"
      :rows="10"
      dataKey="id"
      :rowHover="true"
      responsiveLayout="scroll"
      class="p-datatable-sm"
    >
      <Column
        field="category.name"
        :header="$t('pages.transactions.category')"
        sortable
      />
      <Column field="amount" :header="$t('pages.transactions.amount')" sortable>
        <template #body="slotProps">
          <span :class="getAmountColor(slotProps.data)">
            {{ formatCurrency(slotProps.data.amount) }}
          </span>
        </template>
      </Column>
      <Column
        field="description"
        :header="$t('pages.transactions.description')"
        sortable
      />
      <Column field="date" :header="$t('pages.transactions.date')" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.date) }}
        </template>
      </Column>
      <Column :header="$t('common.actions')">
        <template #body="slotProps">
          <Button
            icon="pi pi-pencil"
            @click="editTransaction(slotProps.data)"
            class="p-button-text"
          />
          <Button
            icon="pi pi-trash"
            @click="deleteTransaction(slotProps.data.id)"
            class="p-button-text p-button-danger"
          />
        </template>
      </Column>
    </DataTable>

    <!-- Dialog per nuova transazione / modifica -->
    <Dialog
      v-model:visible="transactionDialogVisible"
      :header="dialogTitle"
      modal
      class="p-fluid"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="field">
          <label for="date">{{ $t('pages.transactions.date') }}</label>
          <DatePicker
            id="date"
            v-model="editingTransaction.date"
            :showIcon="true"
          />
        </div>
        <div class="field">
          <label for="amount">{{ $t('pages.transactions.amount') }}</label>
          <InputNumber
            id="amount"
            v-model="editingTransaction.amount"
            mode="currency"
            currency="EUR"
            :minFractionDigits="2"
          />
        </div>
        <div class="field">
          <label for="category">{{ $t('pages.transactions.category') }}</label>
          <Select
            id="category"
            v-model="editingTransaction.category_id"
            :options="categories"
            optionLabel="name"
            optionValue="id"
          />
        </div>
        <div class="field">
          <label for="description">{{
            $t('pages.transactions.description')
          }}</label>
          <InputText
            id="description"
            v-model="editingTransaction.description"
          />
        </div>
        <div class="field col-span-2">
          <label for="isRecurring">{{
            $t('pages.transactions.isRecurring')
          }}</label>
          <ToggleButton
            v-model="editingTransaction.is_recurring"
            onLabel="Yes"
            offLabel="No"
          />
        </div>
        <div v-if="editingTransaction.is_recurring" class="field col-span-2">
          <label for="recurrenceFrequency">{{
            $t('pages.transactions.recurrenceFrequency')
          }}</label>
          <Select
            id="recurrenceFrequency"
            v-model="editingTransaction.recurrence_frequency_id"
            :options="recurrenceFrequencies"
            optionLabel="name"
            optionValue="id"
          />
        </div>
      </div>
      <template #footer>
        <Button
          :label="$t('common.cancel')"
          icon="pi pi-times"
          @click="cancelEdit"
          class="p-button-text"
        />
        <Button
          :label="$t('common.save')"
          icon="pi pi-check"
          @click="saveTransaction"
          autofocus
        />
      </template>
    </Dialog>

    <!-- Dialog di conferma eliminazione -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import { Transaction } from '@/types/transaction'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { calculateDateRange } from '@/utils/date'

const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()

const confirm = useConfirm()
const toast = useToast()
const { t } = useI18n()

const { appUser } = storeToRefs(authStore)

const dateRange = ref<[Date, Date]>(
  calculateDateRange(appUser.value?.start_month || 1)
)
const transactionDialogVisible = ref(false)
const editingTransaction = ref<Partial<Transaction>>({})

const dialogTitle = computed(() =>
  editingTransaction.value.id
    ? t('pages.transactions.editTransaction')
    : t('pages.transactions.newTransaction')
)

const balance = computed(
  () => transactionStore.totalIncome - transactionStore.totalExpenses
)

const transactions = computed(() => transactionStore.transactions)

const categories = computed(() => categoryStore.categories)
const recurrenceFrequencies = computed(
  () => transactionStore.recurrenceFrequencies
)

onMounted(async () => {
  await Promise.all([
    categoryStore.fetchUserCategories(appUser.value?.id as string),
    transactionStore.fetchRecurrenceFrequencies(),
  ])
  await fetchTransactions()
})

async function fetchTransactions() {
  if (!appUser.value) return

  const [startDate, endDate] = dateRange.value
  await transactionStore.fetchUserTransactions(
    appUser.value.id,
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  )
}

function showNewTransactionDialog() {
  editingTransaction.value = {
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    is_recurring: false,
  }
  transactionDialogVisible.value = true
}

function editTransaction(transaction: Transaction) {
  editingTransaction.value = { ...transaction }
  transactionDialogVisible.value = true
}

async function saveTransaction() {
  try {
    if (editingTransaction.value.id) {
      await transactionStore.updateTransaction(
        editingTransaction.value.id,
        editingTransaction.value
      )
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('pages.transactions.updateSuccess'),
      })
    } else {
      await transactionStore.createTransaction({
        ...editingTransaction.value,
        user_id: appUser.value?.id,
      })
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('pages.transactions.createSuccess'),
      })
    }
    transactionDialogVisible.value = false
    await fetchTransactions()
  } catch (error) {
    console.error('Error saving transaction:', error)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('common.errorOccurred'),
    })
  }
}

function cancelEdit() {
  editingTransaction.value = {}
  transactionDialogVisible.value = false
}

function deleteTransaction(id: string) {
  confirm.require({
    message: t('pages.transactions.deleteConfirmation'),
    header: t('common.pleaseConfirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await transactionStore.deleteTransaction(id)
        toast.add({
          severity: 'success',
          summary: t('common.success'),
          detail: t('pages.transactions.deleteSuccess'),
        })
        await fetchTransactions()
      } catch (error) {
        console.error('Error deleting transaction:', error)
        toast.add({
          severity: 'error',
          summary: t('common.error'),
          detail: t('common.errorOccurred'),
        })
      }
    },
  })
}

function getAmountColor(transaction: Transaction): string {
  if (!transaction.category?.type) return 'text-gray-700' // default color if category type is not available

  const categoryTypeName = transaction.category.type.name

  if (categoryTypeName === 'income') {
    return 'text-green-600'
  } else if (
    categoryTypeName === 'necessary_expense' ||
    categoryTypeName === 'optional_expense'
  ) {
    return 'text-red-600'
  } else if (
    categoryTypeName === 'short_term_investment' ||
    categoryTypeName === 'long_term_investment'
  ) {
    return 'text-blue-600'
  } else {
    return 'text-gray-700' // default color for any other category types
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}
</script>
