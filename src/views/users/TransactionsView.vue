<template>
  <div class="transactions-page min-h-screen p-4 md:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <h1
        class="text-3xl md:text-4xl font-bold mb-8 text-gray-800 dark:text-white"
      >
        {{ t('pages.transactions.title') }}
      </h1>

      <!-- Filters and Actions -->
      <div
        class="wallet-card mb-6 p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md"
      >
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
              :dateFormat="getDateFormatForUser(appUser)"
              :placeholder="t('pages.transactions.selectDateRange')"
              @update:modelValue="fetchTransactions"
            />
            <Select
              v-model="selectedCategory"
              :options="categoryOptions"
              optionLabel="name"
              :placeholder="t('pages.transactions.selectCategory')"
              class="w-full sm:w-48"
            />
          </div>
          <Button
            :label="t('pages.transactions.addTransaction')"
            icon="pi pi-plus"
            @click="openNewTransactionModal"
            class="wallet-btn-primary w-full md:w-auto"
          />
        </div>
      </div>

      <!-- Transactions Table -->
      <div
        class="wallet-card overflow-hidden bg-white dark:bg-gray-700 rounded-lg shadow-md"
      >
        <DataTable
          :value="filteredTransactions"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          responsive-layout="stack"
          :row-hover="true"
          class="p-datatable-sm"
          stripedRows
          :loading="loading"
        >
          <Column
            field="date"
            :header="t('pages.transactions.date')"
            :sortable="true"
          >
            <template #body="slotProps">
              {{ formatDateForUser(slotProps.data.date, appUser) }}
            </template>
          </Column>
          <Column
            field="category.name"
            :header="t('pages.transactions.category')"
            :sortable="true"
          >
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.category.name"
                :severity="getCategoryTagSeverity(slotProps.data.category)"
              />
            </template>
          </Column>
          <Column
            field="description"
            :header="t('pages.transactions.description')"
          />
          <Column
            field="amount"
            :header="t('pages.transactions.amount')"
            :sortable="true"
          >
            <template #body="slotProps">
              <span :class="getAmountColor(slotProps.data)">
                {{ formatAmount(slotProps.data) }}
              </span>
            </template>
          </Column>
          <Column
            :header="t('common.actions')"
            :exportable="false"
            style="width: 100px"
          >
            <template #body="slotProps">
              <div class="flex space-x-2">
                <Button
                  icon="pi pi-pencil"
                  @click="editTransaction(slotProps.data)"
                  class="p-button-text p-button-sm"
                  v-tooltip="t('common.edit')"
                />
                <Button
                  icon="pi pi-trash"
                  @click="confirmDelete(slotProps.data)"
                  class="p-button-text p-button-sm p-button-danger"
                  v-tooltip="t('common.delete')"
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
      :header="
        isEditing ? t('pages.transactions.edit') : t('pages.transactions.new')
      "
      :modal="true"
      class="p-fluid"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="field">
          <label for="date" class="font-medium">{{
            t('pages.transactions.date')
          }}</label>
          <DatePicker
            id="date"
            v-model="DateSelected"
            :dateFormat="getDateFormatForUser(appUser)"
            class="w-full"
            :class="{
              'p-invalid': v$.DateSelected.$invalid && v$.DateSelected.$dirty,
            }"
          />
          <small
            class="p-error"
            v-if="v$.DateSelected.$invalid && v$.DateSelected.$dirty"
          >
            {{
              t('validation.required', { field: t('pages.transactions.date') })
            }}
          </small>
        </div>
        <div class="field">
          <label for="category" class="font-medium">{{
            t('pages.transactions.category')
          }}</label>
          <Select
            id="category"
            v-model="currentTransaction.category_id"
            :options="categories"
            optionLabel="name"
            optionValue="id"
            :placeholder="t('pages.transactions.selectCategory')"
            class="w-full"
            :class="{
              'p-invalid':
                v$.currentTransaction.category_id.$invalid &&
                v$.currentTransaction.category_id.$dirty,
            }"
          />
          <small
            class="p-error"
            v-if="
              v$.currentTransaction.category_id.$invalid &&
              v$.currentTransaction.category_id.$dirty
            "
          >
            {{
              t('validation.required', {
                field: t('pages.transactions.category'),
              })
            }}
          </small>
        </div>
        <div class="field md:col-span-2">
          <label for="description" class="font-medium">{{
            t('pages.transactions.description')
          }}</label>
          <InputText
            id="description"
            v-model="currentTransaction.description"
            class="w-full"
          />
        </div>
        <div class="field md:col-span-2">
          <label for="amount" class="font-medium">{{
            t('pages.transactions.amount')
          }}</label>
          <InputNumber
            id="amount"
            v-model="currentTransaction.amount"
            mode="currency"
            currency="EUR"
            locale="it-IT"
            class="w-full"
            :class="{
              'p-invalid':
                v$.currentTransaction.amount.$invalid &&
                v$.currentTransaction.amount.$dirty,
            }"
          />
          <small
            class="p-error"
            v-if="
              v$.currentTransaction.amount.$invalid &&
              v$.currentTransaction.amount.$dirty
            "
          >
            <span v-if="v$.currentTransaction.amount.required.$invalid">
              {{
                t('validation.required', {
                  field: t('pages.transactions.amount'),
                })
              }}
            </span>
            <span v-else-if="v$.currentTransaction.amount.positive.$invalid">
              {{
                t('validation.positive', {
                  field: t('pages.transactions.amount'),
                })
              }}
            </span>
          </small>
        </div>
        <div class="field md:col-span-2">
          <label for="isRecurring" class="font-medium">{{
            t('pages.transactions.isRecurring')
          }}</label>
          <ToggleButton
            v-model="currentTransaction.is_recurring"
            :onLabel="t('common.yes')"
            :offLabel="t('common.no')"
          />
        </div>
      </div>
      <template #footer>
        <Button
          :label="t('common.cancel')"
          icon="pi pi-times"
          @click="closeTransactionModal"
          class="p-button-text"
        />
        <Button
          :label="t('common.save')"
          icon="pi pi-check"
          @click="saveTransaction"
          class="wallet-btn-primary"
          :disabled="v$.$invalid"
          autofocus
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useAuthStore } from '@/stores/authStore'
import { formatAmount } from '@/utils/utils'
import { calculateDateRange, formatDateForAPI } from '@/utils/date'
import { Transaction } from '@/types/transaction'
import { Category } from '@/types/category'
import { useConfirm } from 'primevue/useconfirm'
import { getAmountColor, getCategoryTagSeverity } from '@/utils/colors'
import { getDateFormatForUser, formatDateForUser } from '@/utils/users'

import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useVuelidate } from '@vuelidate/core'
import { required, minValue } from '@vuelidate/validators'

const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()

const confirm = useConfirm()

const { t } = useI18n()
const { appUser } = storeToRefs(authStore)

import { useToastManager } from '@/utils/toastManager'
const toastManager = useToastManager()

const dateRange = ref<Date[]>([])
const selectedCategory = ref<Category | null>(null)
const transactionModalVisible = ref(false)
const isEditing = ref(false)
const loading = ref(true)

const categories = computed(() => categoryStore.categories)

const DateSelected = ref<Date>(new Date())

const currentTransaction = ref<Partial<Transaction>>({
  date: formatDateForAPI(new Date()),
  category_id: '',
  amount: 0,
  is_recurring: false,
  description: '',
})

const rules = computed(() => ({
  DateSelected: { required },
  currentTransaction: {
    category_id: { required },
    amount: {
      required,
      positive: minValue(0.01), // Assicura che l'importo sia maggiore di zero
    },
  },
}))

const v$ = useVuelidate(rules, { DateSelected, currentTransaction })

const categoryOptions = computed(() => [
  { name: t('pages.transactions.allCategories'), id: null },
  ...categories.value,
])

watch(DateSelected, (newDate) => {
  currentTransaction.value.date = formatDateForAPI(newDate)
})

const transactions = computed(() => transactionStore.transactions)

const filteredTransactions = computed(() => {
  let filtered = transactions.value

  if (selectedCategory.value && selectedCategory.value.id !== null) {
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
    await fetchData()
  }
})

async function fetchData() {
  loading.value = true
  try {
    if (appUser.value) {
      await Promise.all([
        categoryStore.fetchUserCategories(appUser.value.id),
        fetchTransactions(),
      ])
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    toastManager.showError('pages.transactions.fetchError')
  } finally {
    loading.value = false
  }
}

function openNewTransactionModal() {
  isEditing.value = false
  currentTransaction.value = {
    date: formatDateForAPI(new Date()),
    is_recurring: false,
  }
  transactionModalVisible.value = true
}

function editTransaction(transaction: Transaction) {
  isEditing.value = true
  currentTransaction.value = { ...transaction }
  DateSelected.value = new Date(transaction.date)
  transactionModalVisible.value = true
}

function closeTransactionModal() {
  transactionModalVisible.value = false
  currentTransaction.value = {
    date: formatDateForAPI(new Date()),
    category_id: '',
    amount: 0,
    is_recurring: false,
    description: '',
  }
  DateSelected.value = new Date()
  v$.value.$reset()
}

async function saveTransaction() {
  v$.value.$touch()
  if (v$.value.$invalid) {
    toastManager.showError('validation.fixErrors')
    return
  }

  try {
    if (isEditing.value) {
      await transactionStore.updateTransaction(
        currentTransaction.value.id!,
        currentTransaction.value
      )
      toastManager.showSuccess('pages.transactions.updateSuccess')
    } else {
      await transactionStore.createTransaction({
        ...currentTransaction.value,
        user_id: appUser.value?.id,
        date: formatDateForAPI(DateSelected.value), // Assicurati di usare la data selezionata
      })
      toastManager.showSuccess('pages.transactions.createSuccess')
    }
    closeTransactionModal()
    await fetchTransactions()
  } catch (error) {
    toastManager.showError('pages.transactions.saveError')
  }
}

function confirmDelete(transaction: Transaction) {
  confirm.require({
    message: t('pages.transactions.deleteConfirm'),
    header: t('common.confirmDelete'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteTransaction(transaction.id),
  })
}

async function deleteTransaction(id: string) {
  try {
    await transactionStore.deleteTransaction(id)
    toastManager.showSuccess('pages.transactions.deleteSuccess')
    await fetchTransactions()
  } catch (error) {
    console.error('Error deleting transaction:', error)
    toastManager.showError('pages.transactions.deleteError')
  }
}

async function fetchTransactions() {
  if (!appUser.value) return

  const [startDate, endDate] = dateRange.value

  if (!startDate || !endDate) return

  await transactionStore.fetchUserTransactions(
    appUser.value.id,
    formatDateForAPI(startDate),
    formatDateForAPI(endDate)
  )
}
</script>
