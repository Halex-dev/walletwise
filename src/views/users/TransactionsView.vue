<template>
  <div class="min-h-screen p-4 md:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl md:text-4xl font-bold mb-8">
        {{ t('pages.transactions.title') }}
      </h1>

      <!-- Filters and Actions -->
      <div class="wallet-card mb-6">
        <div
          class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4"
        >
          <div
            class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto"
          >
            <DatePicker
              v-model="dateRange"
              selectionMode="range"
              :manualInput="false"
              class="w-full sm:w-64"
            />
            <Select
              v-model="selectedCategory"
              :options="categories"
              optionLabel="name"
              placeholder="Select Category"
              class="w-full sm:w-48"
            />
          </div>
          <Button
            label="Add Transaction"
            icon="pi pi-plus"
            @click="openNewTransactionModal"
            class="wallet-btn-primary w-full md:w-auto"
          />
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="wallet-card overflow-hidden">
        <DataTable
          :value="filteredTransactions"
          :paginator="true"
          :rows="10"
          responsive-layout="stack"
          :row-hover="true"
          class="p-datatable-sm"
          stripedRows
        >
          <Column field="date" header="Date" :sortable="true">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.date) }}
            </template>
          </Column>
          <Column field="category.name" header="Category" :sortable="true" />
          <Column field="description" header="Description" />
          <Column field="amount" header="Amount" :sortable="true">
            <template #body="slotProps">
              <span :class="getAmountColor(slotProps.data)">
                {{ formatAmount(slotProps.data) }}
              </span>
            </template>
          </Column>
          <Column header="Actions" :exportable="false">
            <template #body="slotProps">
              <div class="flex space-x-2">
                <Button
                  icon="pi pi-pencil"
                  @click="editTransaction(slotProps.data)"
                  class="p-button-text p-button-sm"
                />
                <Button
                  icon="pi pi-trash"
                  @click="confirmDelete(slotProps.data)"
                  class="p-button-text p-button-sm p-button-danger"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- New/Edit Transaction Modal -->
    <Dialog
      v-model:visible="transactionModalVisible"
      :header="isEditing ? 'Edit Transaction' : 'New Transaction'"
      :modal="true"
      class="p-fluid"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="field">
          <label for="date" class="font-medium">Date</label>
          <DatePicker
            id="date"
            v-model="currentTransaction.date"
            dateFormat="dd/mm/yy"
            class="w-full"
          />
        </div>
        <div class="field">
          <label for="category" class="font-medium">Category</label>
          <Select
            id="category"
            v-model="currentTransaction.category_id"
            :options="categories"
            optionLabel="name"
            optionValue="id"
            placeholder="Select Category"
            class="w-full"
          />
        </div>
        <div class="field md:col-span-2">
          <label for="description" class="font-medium">Description</label>
          <InputText
            id="description"
            v-model="currentTransaction.description"
            class="w-full"
          />
        </div>
        <div class="field md:col-span-2">
          <label for="amount" class="font-medium">Amount</label>
          <InputNumber
            id="amount"
            v-model="currentTransaction.amount"
            mode="currency"
            currency="EUR"
            locale="it-IT"
            class="w-full"
          />
        </div>
        <div class="field md:col-span-2">
          <label for="isRecurring" class="font-medium">Is Recurring</label>
          <ToggleButton
            v-model="currentTransaction.is_recurring"
            onLabel="Yes"
            offLabel="No"
          />
        </div>
        <div v-if="currentTransaction.is_recurring" class="field md:col-span-2">
          <label for="recurrenceFrequency" class="font-medium"
            >Recurrence Frequency</label
          >
          <Select
            id="recurrenceFrequency"
            v-model="currentTransaction.recurrence_frequency_id"
            :options="recurrenceFrequencies"
            optionLabel="name"
            optionValue="id"
            placeholder="Select Frequency"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="closeTransactionModal"
          class="p-button-text"
        />
        <Button
          label="Save"
          icon="pi pi-check"
          @click="saveTransaction"
          class="wallet-btn-primary"
          autofocus
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useAuthStore } from '@/stores/authStore'
import { formatDate, formatAmount } from '@/utils/utils'
import { calculateDateRange } from '@/utils/date'
import { Transaction } from '@/types/transaction'
import { Category } from '@/types/category'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()

const confirm = useConfirm()
const toast = useToast()
const { t } = useI18n()

const { appUser } = storeToRefs(authStore)

const dateRange = ref<Date[]>([])
const selectedCategory = ref<Category | null>(null)
const transactionModalVisible = ref(false)
const isEditing = ref(false)
const currentTransaction = ref<Partial<Transaction>>({})

const categories = computed(() => categoryStore.categories)
const recurrenceFrequencies = computed(
  () => transactionStore.recurrenceFrequencies
)

const filteredTransactions = computed(() => {
  let filtered = transactionStore.transactions

  if (dateRange.value.length === 2) {
    filtered = filtered.filter(
      (t) =>
        new Date(t.date) >= dateRange.value[0] &&
        new Date(t.date) <= dateRange.value[1]
    )
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(
      (t) => t.category_id === selectedCategory.value?.id
    )
  }

  return filtered
})

onMounted(async () => {
  if (authStore.user) {
    const [startDate, endDate] = calculateDateRange(
      appUser.value?.start_month || 1
    )
    dateRange.value = [startDate, endDate]
    await Promise.all([
      categoryStore.fetchUserCategories(authStore.user.id),
      transactionStore.fetchUserTransactions(
        authStore.user.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ),
      transactionStore.fetchRecurrenceFrequencies(),
    ])
  }
})

function openNewTransactionModal() {
  isEditing.value = false
  currentTransaction.value = { date: new Date(), is_recurring: false }
  transactionModalVisible.value = true
}

function editTransaction(transaction: Transaction) {
  isEditing.value = true
  currentTransaction.value = { ...transaction }
  transactionModalVisible.value = true
}

function closeTransactionModal() {
  transactionModalVisible.value = false
  currentTransaction.value = {}
}

async function saveTransaction() {
  try {
    if (isEditing.value) {
      await transactionStore.updateTransaction(
        currentTransaction.value.id!,
        currentTransaction.value
      )
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Transaction updated successfully',
        life: 3000,
      })
    } else {
      await transactionStore.createTransaction({
        ...currentTransaction.value,
        user_id: appUser.value?.id,
      })
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Transaction created successfully',
        life: 3000,
      })
    }
    closeTransactionModal()
    await fetchTransactions()
  } catch (error) {
    console.error('Error saving transaction:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'An error occurred while saving the transaction',
      life: 3000,
    })
  }
}

function confirmDelete(transaction: Transaction) {
  confirm.require({
    message: 'Are you sure you want to delete this transaction?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteTransaction(transaction.id),
  })
}

async function deleteTransaction(id: string) {
  try {
    await transactionStore.deleteTransaction(id)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Transaction deleted successfully',
      life: 3000,
    })
    await fetchTransactions()
  } catch (error) {
    console.error('Error deleting transaction:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'An error occurred while deleting the transaction',
      life: 3000,
    })
  }
}

async function fetchTransactions() {
  if (!appUser.value) return

  const [startDate, endDate] = dateRange.value
  await transactionStore.fetchUserTransactions(
    appUser.value.id,
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  )
}

function getAmountColor(transaction: Transaction): string {
  if (!transaction.category?.type) return ''
  const categoryTypeName = transaction.category.type.name
  if (categoryTypeName === 'income') {
    return 'text-green-500 dark:text-green-400'
  } else if (
    categoryTypeName === 'necessary_expense' ||
    categoryTypeName === 'optional_expense'
  ) {
    return 'text-red-500 dark:text-red-400'
  }
  return ''
}
</script>
