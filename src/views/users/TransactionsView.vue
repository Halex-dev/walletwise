<template>
  <div
    class="min-h-screen from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Filters Card -->
      <Card
        class="mb-6 shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
      >
        <template #content>
          <div class="space-y-4">
            <!-- Desktop Filters -->
            <div class="hidden sm:flex items-center justify-between gap-4">
              <div class="flex items-center gap-4 flex-1">
                <div class="flex-1 max-w-xs">
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    <i class="pi pi-calendar mr-2"></i>
                    Periodo
                  </label>
                  <DatePicker
                    v-model="dateRange"
                    selectionMode="range"
                    :manualInput="false"
                    class="w-full"
                    :dateFormat="getDateFormatForUser(appUser)"
                    :placeholder="t('pages.transactions.selectDateRange')"
                    @update:modelValue="fetchTransactions"
                    showIcon
                    iconDisplay="input"
                  />
                </div>

                <div class="flex-1 max-w-xs">
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    <i class="pi pi-tag mr-2"></i>
                    Categoria
                  </label>
                  <Select
                    v-model="selectedCategory"
                    :options="categoryOptions"
                    optionLabel="name"
                    :placeholder="t('pages.transactions.selectCategory')"
                    class="w-full"
                    showClear
                  />
                </div>
              </div>

              <div class="hidden sm:block">
                <Button
                  :label="t('pages.transactions.addTransaction')"
                  icon="pi pi-plus"
                  @click="openNewTransactionModal"
                  class="wallet-btn-primary border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  size="large"
                />
              </div>
            </div>

            <!-- Mobile Filters -->
            <div class="sm:hidden space-y-4">
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  <i class="pi pi-calendar mr-2"></i>
                  Periodo
                </label>
                <DatePicker
                  v-model="dateRange"
                  selectionMode="range"
                  :manualInput="false"
                  class="w-full"
                  :dateFormat="getDateFormatForUser(appUser)"
                  :placeholder="t('pages.transactions.selectDateRange')"
                  @update:modelValue="fetchTransactions"
                  showIcon
                  iconDisplay="input"
                />
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  <i class="pi pi-tag mr-2"></i>
                  Categoria
                </label>
                <Select
                  v-model="selectedCategory"
                  :options="categoryOptions"
                  optionLabel="name"
                  :placeholder="t('pages.transactions.selectCategory')"
                  class="w-full"
                  showClear
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Transactions List -->
      <Card
        class="shadow-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
      >
        <template #content>
          <!-- Desktop Table -->
          <div class="hidden lg:block">
            <DataTable
              :value="filteredTransactions"
              :paginator="true"
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20, 50]"
              :rowHover="true"
              class="p-datatable-sm"
              stripedRows
              :loading="loading"
              responsiveLayout="scroll"
            >
              <Column
                field="date"
                :header="t('pages.transactions.date')"
                :sortable="true"
                style="min-width: 120px"
              >
                <template #body="slotProps">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-calendar text-gray-400"></i>
                    <span class="font-medium">{{
                      formatDateForUser(slotProps.data.date, appUser)
                    }}</span>
                  </div>
                </template>
              </Column>

              <Column
                field="category.name"
                :header="t('pages.transactions.category')"
                :sortable="true"
                style="min-width: 140px"
              >
                <template #body="slotProps">
                  <Tag
                    :value="slotProps.data.category.name"
                    :severity="getCategoryTagSeverity(slotProps.data.category)"
                    class="px-3 py-1 rounded-full font-medium"
                  />
                </template>
              </Column>

              <Column
                field="description"
                :header="t('pages.transactions.description')"
                style="min-width: 200px"
              >
                <template #body="slotProps">
                  <div class="max-w-xs">
                    <p class="truncate text-gray-700 dark:text-gray-300">
                      {{ slotProps.data.description || 'Nessuna descrizione' }}
                    </p>
                  </div>
                </template>
              </Column>

              <Column
                field="amount"
                :header="t('pages.transactions.amount')"
                :sortable="true"
                style="min-width: 120px"
              >
                <template #body="slotProps">
                  <div class="text-right">
                    <span
                      :class="[
                        'font-bold text-lg',
                        getAmountColor(slotProps.data),
                      ]"
                    >
                      {{ formatAmount(slotProps.data) }}
                    </span>
                    <div
                      v-if="slotProps.data.is_recurring"
                      class="text-xs text-gray-500 mt-1"
                    >
                      <i class="pi pi-refresh mr-1"></i>Ricorrente
                    </div>
                  </div>
                </template>
              </Column>

              <Column
                :header="t('common.actions')"
                :exportable="false"
                style="width: 120px"
              >
                <template #body="slotProps">
                  <div class="flex gap-2">
                    <Button
                      icon="pi pi-pencil"
                      @click="editTransaction(slotProps.data)"
                      class="p-button-text p-button-sm hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      v-tooltip="t('common.edit')"
                      severity="info"
                    />
                    <Button
                      icon="pi pi-trash"
                      @click="confirmDelete(slotProps.data)"
                      class="p-button-text p-button-sm hover:bg-red-50 dark:hover:bg-red-900/30"
                      v-tooltip="t('common.delete')"
                      severity="danger"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>

          <!-- Mobile/Tablet Cards -->
          <div class="lg:hidden space-y-4">
            <div v-if="loading" class="space-y-4">
              <div v-for="i in 5" :key="i" class="animate-pulse">
                <div class="bg-gray-200 dark:bg-gray-700 h-24 rounded-xl"></div>
              </div>
            </div>

            <div
              v-else-if="filteredTransactions.length === 0"
              class="text-center py-12"
            >
              <i class="pi pi-inbox text-4xl text-gray-400 mb-4"></i>
              <p class="text-gray-500 dark:text-gray-400">
                Nessuna transazione trovata
              </p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="transaction in filteredTransactions"
                :key="transaction.id"
                class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
              >
                <div class="flex justify-between items-start mb-3">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <Tag
                        :value="transaction.category?.name"
                        :severity="getCategoryTagSeverity(transaction.category)"
                        class="px-2 py-1 rounded-lg text-xs font-medium"
                      />
                      <span
                        v-if="transaction.is_recurring"
                        class="text-xs text-gray-500"
                      >
                        <i class="pi pi-refresh mr-1"></i>Ricorrente
                      </span>
                    </div>
                    <p
                      class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
                    >
                      {{ transaction.description || 'Nessuna descrizione' }}
                    </p>
                  </div>
                  <div class="text-right ml-4">
                    <div
                      :class="[
                        'font-bold text-lg',
                        getAmountColor(transaction),
                      ]"
                    >
                      {{ formatAmount(transaction) }}
                    </div>
                  </div>
                </div>

                <div
                  class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700"
                >
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <i class="pi pi-calendar"></i>
                    {{ formatDateForUser(transaction.date, appUser) }}
                  </div>
                  <div class="flex gap-2">
                    <Button
                      icon="pi pi-pencil"
                      @click="editTransaction(transaction)"
                      class="p-button-text p-button-sm"
                      severity="info"
                      size="small"
                    />
                    <Button
                      icon="pi pi-trash"
                      @click="confirmDelete(transaction)"
                      class="p-button-text p-button-sm"
                      severity="danger"
                      size="small"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Mobile Pagination -->
            <div class="flex justify-center pt-4">
              <Paginator
                :rows="10"
                :totalRecords="filteredTransactions.length"
                :rowsPerPageOptions="[5, 10, 20]"
                class="border-0 bg-transparent"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Transaction Modal -->
    <Dialog
      v-model:visible="transactionModalVisible"
      :header="
        isEditing ? t('pages.transactions.edit') : t('pages.transactions.new')
      "
      :modal="true"
      :draggable="false"
      :resizable="false"
      class="w-[95vw] max-w-2xl"
      :contentStyle="{ padding: '0' }"
    >
      <div class="p-6">
        <form @submit.prevent="saveTransaction" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Date Field -->
            <div class="space-y-2">
              <label
                for="date"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <i class="pi pi-calendar mr-2"></i>
                {{ t('pages.transactions.date') }}
              </label>
              <DatePicker
                id="date"
                v-model="DateSelected"
                :dateFormat="getDateFormatForUser(appUser)"
                class="w-full"
                :class="{
                  'p-invalid':
                    v$.DateSelected.$invalid && v$.DateSelected.$dirty,
                }"
                showIcon
                iconDisplay="input"
              />
              <small
                class="text-red-500 text-xs"
                v-if="v$.DateSelected.$invalid && v$.DateSelected.$dirty"
              >
                {{
                  t('validation.required', {
                    field: t('pages.transactions.date'),
                  })
                }}
              </small>
            </div>

            <!-- Category Field -->
            <div class="space-y-2">
              <label
                for="category"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <i class="pi pi-tag mr-2"></i>
                {{ t('pages.transactions.category') }}
              </label>
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
                class="text-red-500 text-xs"
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
          </div>

          <!-- Description Field -->
          <div class="space-y-2">
            <label
              for="description"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <i class="pi pi-file-edit mr-2"></i>
              {{ t('pages.transactions.description') }}
            </label>
            <InputText
              id="description"
              v-model="currentTransaction.description"
              class="w-full"
              :placeholder="`Inserisci una descrizione...`"
            />
          </div>

          <!-- Amount Field -->
          <div class="space-y-2">
            <label
              for="amount"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <i class="pi pi-euro mr-2"></i>
              {{ t('pages.transactions.amount') }}
            </label>
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
              class="text-red-500 text-xs"
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

          <!-- Recurring Toggle -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <i class="pi pi-refresh mr-2"></i>
              {{ t('pages.transactions.isRecurring') }}
            </label>
            <div class="flex items-center gap-3">
              <ToggleButton
                v-model="currentTransaction.is_recurring"
                :onLabel="t('common.yes')"
                :offLabel="t('common.no')"
                class="w-24"
              />
            </div>
          </div>
        </form>
      </div>

      <template #footer>
        <div class="flex gap-3 p-3">
          <Button
            :label="t('common.cancel')"
            icon="pi pi-times"
            @click="closeTransactionModal"
            class="flex-1 p-button-outlined"
            severity="secondary"
          />
          <Button
            :label="t('common.save')"
            icon="pi pi-check"
            @click="saveTransaction"
            class="flex-1 bg-gradient-to-r wallet-btn-primary border-0"
            :disabled="v$.$invalid"
            :loading="saving"
          />
        </div>
      </template>
    </Dialog>

    <!-- Delete Confirmation -->
    <ConfirmDialog>
      <template #container="{ message, acceptCallback, rejectCallback }">
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md mx-auto"
        >
          <div class="text-center">
            <div
              class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4"
            >
              <i
                class="pi pi-exclamation-triangle text-xl text-red-600 dark:text-red-400"
              ></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {{ message.header }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {{ message.message }}
            </p>
            <div class="flex gap-3">
              <Button
                :label="t('common.cancel')"
                @click="rejectCallback"
                class="flex-1 p-button-outlined"
                severity="secondary"
              >
              </Button>
              <Button
                :label="t('common.delete')"
                @click="acceptCallback"
                class="flex-1"
                severity="danger"
              />
            </div>
          </div>
        </div>
      </template>
    </ConfirmDialog>

    <!-- Floating Action Button (Mobile) -->
    <div class="fixed bottom-6 right-6 sm:hidden">
      <Button
        icon="pi pi-plus"
        @click="openNewTransactionModal"
        class="!p-4 !rounded-full !shadow-2xl wallet-btn-primary border-0 hover:shadow-3xl hover:scale-105 transition-all duration-300"
        aria-label="Aggiungi transazione"
      />
    </div>
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
import { useToastManager } from '@/utils/toastManager'

const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()
const confirm = useConfirm()
const toastManager = useToastManager()

const { t } = useI18n()
const { appUser } = storeToRefs(authStore)

// Reactive state
const dateRange = ref<Date[]>([])
const selectedCategory = ref<Category | null>(null)
const transactionModalVisible = ref(false)
const isEditing = ref(false)
const loading = ref(true)
const saving = ref(false)

const categories = computed(() => categoryStore.categories)
const DateSelected = ref<Date>(new Date())

const currentTransaction = ref<Partial<Transaction>>({
  date: formatDateForAPI(new Date()),
  category_id: '',
  amount: 0,
  is_recurring: false,
  description: '',
})

// Validation rules
const rules = computed(() => ({
  DateSelected: { required },
  currentTransaction: {
    category_id: { required },
    amount: {
      required,
      positive: minValue(0.01),
    },
  },
}))

const v$ = useVuelidate(rules, { DateSelected, currentTransaction })

const categoryOptions = computed(() => [
  { name: t('pages.transactions.allCategories'), id: null },
  ...categories.value,
])

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

// Watchers
watch(DateSelected, (newDate) => {
  currentTransaction.value.date = formatDateForAPI(newDate)
})

// Lifecycle
onMounted(async () => {
  if (authStore.user) {
    const [startDate, endDate] = calculateDateRange(
      appUser.value?.start_month || 1
    )
    dateRange.value = [startDate, endDate]
    await fetchData()
  }
})

// Methods
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
  DateSelected.value = new Date()
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

  saving.value = true
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
        date: formatDateForAPI(DateSelected.value),
      })
      toastManager.showSuccess('pages.transactions.createSuccess')
    }
    closeTransactionModal()
    await fetchTransactions()
  } catch (error) {
    toastManager.showError('pages.transactions.saveError')
  } finally {
    saving.value = false
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

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.shadow-3xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

/* Dark mode scrollbar */
.dark ::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}

/* Smooth transitions for all interactive elements */
* {
  transition: all 0.2s ease-in-out;
}

/* Custom button hover effects */
.p-button:not(.p-button-outlined):hover {
  transform: translateY(-1px);
}

/* Card hover effects */
.p-card:hover {
  transform: translateY(-2px);
}

/* Enhanced focus states */
.p-inputtext:focus,
.p-dropdown:focus,
.p-calendar:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  border-color: rgb(59, 130, 246);
}

/* Dark mode focus states */
.dark .p-inputtext:focus,
.dark .p-dropdown:focus,
.dark .p-calendar:focus {
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
  border-color: rgb(96, 165, 250);
}

/* Loading skeleton animation */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Floating button animation */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

.fixed .p-button {
  animation: float 3s ease-in-out infinite;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .p-dialog .p-dialog-content {
    padding: 1rem;
  }

  .p-datatable .p-datatable-tbody > tr > td {
    padding: 0.5rem;
  }
}

/* Tablet optimizations */
@media (min-width: 641px) and (max-width: 1024px) {
  .p-dialog {
    width: 90vw;
  }
}

/* Desktop optimizations */
@media (min-width: 1025px) {
  .p-dialog {
    width: 70vw;
    max-width: 800px;
  }
}

/* Custom tag styles */
.p-tag {
  font-weight: 500;
  letter-spacing: 0.025em;
}

/* Enhanced table styling */
.p-datatable .p-datatable-thead > tr > th {
  background: linear-gradient(
    135deg,
    rgba(248, 250, 252, 0.8),
    rgba(241, 245, 249, 0.8)
  );
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(226, 232, 240, 0.8);
  font-weight: 600;
  color: rgb(51, 65, 85);
}

.dark .p-datatable .p-datatable-thead > tr > th {
  background: linear-gradient(
    135deg,
    rgba(31, 41, 55, 0.8),
    rgba(17, 24, 39, 0.8)
  );
  border-bottom: 2px solid rgba(75, 85, 99, 0.8);
  color: rgb(209, 213, 219);
}

.p-datatable .p-datatable-tbody > tr:hover {
  background: linear-gradient(
    135deg,
    rgba(248, 250, 252, 0.5),
    rgba(241, 245, 249, 0.5)
  );
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dark .p-datatable .p-datatable-tbody > tr:hover {
  background: linear-gradient(
    135deg,
    rgba(31, 41, 55, 0.5),
    rgba(17, 24, 39, 0.5)
  );
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Improved modal styling */
.p-dialog .p-dialog-header {
  background: linear-gradient(
    135deg,
    rgba(248, 250, 252, 0.95),
    rgba(241, 245, 249, 0.95)
  );
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.dark .p-dialog .p-dialog-header {
  background: linear-gradient(
    135deg,
    rgba(31, 41, 55, 0.95),
    rgba(17, 24, 39, 0.95)
  );
  border-bottom: 1px solid rgba(75, 85, 99, 0.8);
}

/* Stats cards animation */
.stats-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Mobile card styling */
@media (max-width: 1023px) {
  .transaction-card {
    transition: all 0.2s ease-in-out;
    border-left: 4px solid transparent;
  }

  .transaction-card:hover {
    border-left-color: rgb(59, 130, 246);
    transform: translateX(4px);
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .p-button {
    border-width: 2px;
  }

  .p-tag {
    border-width: 1px;
    border-style: solid;
  }
}

/* Print styles */
@media print {
  .fixed,
  .p-button,
  .sticky {
    display: none !important;
  }

  .p-card {
    box-shadow: none !important;
    border: 1px solid #000;
  }

  .p-datatable {
    font-size: 12px;
  }
}
</style>
