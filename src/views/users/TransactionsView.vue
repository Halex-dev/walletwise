<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('pages.transactions.totalTransactions') }}
              </p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ filteredTransactions.length }}
              </p>
            </div>
            <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <i
                class="pi pi-list text-blue-600 dark:text-blue-400 text-xl"
              ></i>
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('pages.transactions.totalIncome') }}
              </p>
              <p class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ totalIncome }}
              </p>
            </div>
            <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <i
                class="pi pi-arrow-up text-green-600 dark:text-green-400 text-xl"
              ></i>
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('pages.transactions.totalExpenses') }}
              </p>
              <p class="text-2xl font-bold text-red-600 dark:text-red-400">
                {{ totalExpenses }}
              </p>
            </div>
            <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <i
                class="pi pi-arrow-down text-red-600 dark:text-red-400 text-xl"
              ></i>
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('pages.transactions.balance') }}
              </p>
              <p class="text-2xl font-bold" :class="balanceColor">
                {{ balance }}
              </p>
            </div>
            <div class="p-3 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
              <i
                class="pi pi-wallet text-gray-600 dark:text-gray-400 text-xl"
              ></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Actions -->
      <div class="mb-6">
        <Card
          class="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl"
        >
          <template #content>
            <div class="space-y-4">
              <!-- Quick Month Navigation -->
              <div
                class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4"
              >
                <div class="flex items-center gap-2">
                  <h3
                    class="text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    {{ t('pages.transactions.filters') }}
                  </h3>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600 dark:text-gray-400"
                    >{{ t('pages.transactions.quickPeriod') }}:</span
                  >
                  <div class="flex gap-1">
                    <Button
                      v-for="month in quickMonthOptions"
                      :key="month.value"
                      :label="month.label"
                      @click="selectQuickMonth(month.value)"
                      :class="[
                        'text-xs px-3 py-1',
                        isCurrentMonth(month.value)
                          ? 'wallet-btn-primary border-0'
                          : 'p-button-outlined p-button-sm',
                      ]"
                      size="small"
                    />
                  </div>
                </div>
              </div>

              <!-- Desktop Layout -->
              <div class="hidden md:flex items-end gap-4">
                <div class="flex-1 max-w-xs">
                  <label
                    class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                  >
                    <i
                      class="pi pi-calendar mr-2 text-blue-600 dark:text-blue-400"
                    ></i>
                    {{ t('pages.transactions.period') }}
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
                    class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                  >
                    <i
                      class="pi pi-tag mr-2 text-purple-600 dark:text-purple-400"
                    ></i>
                    {{ t('pages.transactions.category') }}
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

                <div class="flex-1 max-w-xs">
                  <label
                    class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                  >
                    <i
                      class="pi pi-search mr-2 text-gray-600 dark:text-gray-400"
                    ></i>
                    {{ t('pages.transactions.search') }}
                  </label>
                  <InputText
                    v-model="searchTerm"
                    :placeholder="t('pages.transactions.searchPlaceholder')"
                    class="w-full"
                  />
                </div>

                <div class="flex gap-2">
                  <Button
                    :label="t('pages.transactions.addTransaction')"
                    icon="pi pi-plus"
                    @click="openNewTransactionModal"
                    class="wallet-btn-primary border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    size="large"
                  />
                </div>
              </div>

              <!-- Mobile Layout -->
              <div class="md:hidden space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                    >
                      <i
                        class="pi pi-calendar mr-2 text-blue-600 dark:text-blue-400"
                      ></i>
                      {{ t('pages.transactions.period') }}
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
                      class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                    >
                      <i
                        class="pi pi-tag mr-2 text-purple-600 dark:text-purple-400"
                      ></i>
                      {{ t('pages.transactions.category') }}
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

                <div>
                  <label
                    class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                  >
                    <i
                      class="pi pi-search mr-2 text-gray-600 dark:text-gray-400"
                    ></i>
                    {{ t('pages.transactions.search') }}
                  </label>
                  <InputText
                    v-model="searchTerm"
                    :placeholder="t('pages.transactions.searchPlaceholder')"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Transactions List -->
      <Card
        class="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl"
      >
        <template #content>
          <!-- Loading State -->
          <div v-if="loading" class="space-y-4">
            <div class="hidden lg:block">
              <!-- Desktop Loading Skeleton -->
              <div class="space-y-3">
                <div
                  v-for="i in 5"
                  :key="i"
                  class="animate-pulse flex items-center space-x-4 p-4"
                >
                  <div
                    class="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"
                  ></div>
                  <div class="flex-1 space-y-2">
                    <div
                      class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"
                    ></div>
                    <div
                      class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"
                    ></div>
                  </div>
                  <div
                    class="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"
                  ></div>
                </div>
              </div>
            </div>
            <!-- Mobile Loading Skeleton -->
            <div class="lg:hidden space-y-4">
              <div v-for="i in 5" :key="i" class="animate-pulse">
                <div class="bg-gray-200 dark:bg-gray-700 h-24 rounded-xl"></div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="filteredTransactions.length === 0"
            class="text-center py-16"
          >
            <div
              class="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4"
            >
              <i class="pi pi-inbox text-3xl text-gray-400"></i>
            </div>
            <h3
              class="text-lg font-semibold text-gray-900 dark:text-white mb-2"
            >
              {{ t('pages.transactions.noTransactions') }}
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
              {{ t('pages.transactions.noTransactionsDesc') }}
            </p>
            <Button
              :label="t('pages.transactions.addFirstTransaction')"
              icon="pi pi-plus"
              @click="openNewTransactionModal"
              class="wallet-btn-primary border-0"
            />
          </div>

          <!-- Content -->
          <div v-else>
            <!-- Desktop Table -->
            <div class="hidden lg:block">
              <DataTable
                :value="paginatedTransactions"
                :rowHover="true"
                class="p-datatable-sm"
                stripedRows
                responsiveLayout="scroll"
                :sortOrder="sortOrder"
                :sortField="sortField"
                @sort="onSort"
              >
                <Column
                  field="date"
                  :header="t('pages.transactions.date')"
                  :sortable="true"
                  style="min-width: 140px"
                >
                  <template #body="slotProps">
                    <div class="flex items-center gap-3">
                      <div
                        class="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg"
                      >
                        <i
                          class="pi pi-calendar text-blue-600 dark:text-blue-400 text-sm"
                        ></i>
                      </div>
                      <div>
                        <span
                          class="font-semibold text-gray-900 dark:text-white"
                        >
                          {{ formatDateForUser(slotProps.data.date, appUser) }}
                        </span>
                      </div>
                    </div>
                  </template>
                </Column>

                <Column
                  field="category.name"
                  :header="t('pages.transactions.category')"
                  :sortable="true"
                  style="min-width: 160px"
                >
                  <template #body="slotProps">
                    <Tag
                      :value="slotProps.data.category?.name"
                      :severity="
                        getCategoryTagSeverity(slotProps.data.category)
                      "
                      class="px-3 py-2 rounded-lg font-semibold"
                    />
                  </template>
                </Column>

                <Column
                  field="description"
                  :header="t('pages.transactions.description')"
                  style="min-width: 250px"
                >
                  <template #body="slotProps">
                    <div class="max-w-xs">
                      <p
                        class="text-gray-700 dark:text-gray-300 truncate"
                        :title="slotProps.data.description"
                      >
                        {{
                          slotProps.data.description ||
                          t('pages.transactions.noDescription')
                        }}
                      </p>
                    </div>
                  </template>
                </Column>

                <Column
                  field="amount"
                  :header="t('pages.transactions.amount')"
                  :sortable="true"
                  style="min-width: 140px"
                >
                  <template #body="slotProps">
                    <div class="text-right">
                      <div class="flex items-center justify-end gap-2">
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
                          class="p-1 bg-purple-100 dark:bg-purple-900/30 rounded"
                        >
                          <i
                            class="pi pi-refresh text-purple-600 dark:text-purple-400 text-xs"
                            :title="t('pages.transactions.recurring')"
                          ></i>
                        </div>
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
                    <div class="flex gap-2 justify-center">
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

              <!-- Desktop Pagination -->
              <div
                class="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4"
              >
                <div
                  class="flex items-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {{ t('pages.transactions.showing') }}
                  {{ (currentPage - 1) * itemsPerPage + 1 }} -
                  {{
                    Math.min(
                      currentPage * itemsPerPage,
                      filteredTransactions.length
                    )
                  }}
                  {{ t('pages.transactions.of') }}
                  {{ filteredTransactions.length }}
                </div>
                <Paginator
                  v-model:first="first"
                  :rows="itemsPerPage"
                  :totalRecords="filteredTransactions.length"
                  :rowsPerPageOptions="[10, 25, 50]"
                  class="border-0 bg-transparent"
                  @page="onPageChange"
                />
              </div>
            </div>

            <!-- Mobile/Tablet Cards -->
            <div class="lg:hidden">
              <div class="space-y-3">
                <div
                  v-for="transaction in paginatedTransactions"
                  :key="transaction.id"
                  class="transaction-card bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                >
                  <div class="flex justify-between items-start mb-3">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-2 flex-wrap">
                        <Tag
                          :value="transaction.category?.name"
                          :severity="
                            getCategoryTagSeverity(transaction.category)
                          "
                          class="px-3 py-1 rounded-lg text-xs font-semibold"
                        />
                        <div
                          v-if="transaction.is_recurring"
                          class="flex items-center text-xs text-purple-600 dark:text-purple-400"
                        >
                          <i class="pi pi-refresh mr-1"></i>
                          {{ t('pages.transactions.recurring') }}
                        </div>
                      </div>
                      <h4
                        class="font-semibold text-gray-900 dark:text-white text-sm mb-1 truncate"
                      >
                        {{
                          transaction.description ||
                          t('pages.transactions.noDescription')
                        }}
                      </h4>
                      <div
                        class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
                      >
                        <i class="pi pi-calendar"></i>
                        <span>{{
                          formatDateForUser(transaction.date, appUser)
                        }}</span>
                      </div>
                    </div>
                    <div class="text-right ml-4 flex-shrink-0">
                      <div
                        :class="[
                          'font-bold text-lg mb-2',
                          getAmountColor(transaction),
                        ]"
                      >
                        {{ formatAmount(transaction) }}
                      </div>
                      <div class="flex gap-2 justify-end">
                        <Button
                          icon="pi pi-pencil"
                          @click="editTransaction(transaction)"
                          class="p-button-text p-button-sm w-8 h-8"
                          severity="info"
                          size="small"
                        />
                        <Button
                          icon="pi pi-trash"
                          @click="confirmDelete(transaction)"
                          class="p-button-text p-button-sm w-8 h-8"
                          severity="danger"
                          size="small"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mobile Pagination -->
              <div
                class="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4"
              >
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ (currentPage - 1) * itemsPerPage + 1 }}-{{
                    Math.min(
                      currentPage * itemsPerPage,
                      filteredTransactions.length
                    )
                  }}
                  {{ t('pages.transactions.of') }}
                  {{ filteredTransactions.length }}
                </div>
                <div class="flex gap-2">
                  <Button
                    icon="pi pi-chevron-left"
                    @click="previousPage"
                    :disabled="currentPage === 1"
                    class="p-button-outlined p-button-sm"
                    severity="secondary"
                  />
                  <span
                    class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {{ currentPage }} / {{ totalPages }}
                  </span>
                  <Button
                    icon="pi pi-chevron-right"
                    @click="nextPage"
                    :disabled="currentPage === totalPages"
                    class="p-button-outlined p-button-sm"
                    severity="secondary"
                  />
                </div>
              </div>
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
    <div class="fixed bottom-6 right-6 md:hidden z-10">
      <Button
        icon="pi pi-plus"
        @click="openNewTransactionModal"
        class="!p-4 !rounded-full !shadow-2xl wallet-btn-primary border-0 hover:shadow-3xl hover:scale-105 transition-all duration-300"
        :aria-label="t('pages.transactions.addTransaction')"
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
const searchTerm = ref('')
const transactionModalVisible = ref(false)
const isEditing = ref(false)
const loading = ref(true)
const saving = ref(false)

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)
const first = ref(0)

// Sorting
const sortField = ref('date')
const sortOrder = ref(-1)

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

  // Filter by category
  if (selectedCategory.value && selectedCategory.value.id !== null) {
    filtered = filtered.filter(
      (t) => t.category_id === selectedCategory.value?.id
    )
  }

  // Filter by search term
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.description?.toLowerCase().includes(search) ||
        t.category?.name?.toLowerCase().includes(search)
    )
  }

  // Sort transactions
  const sortedFiltered = [...filtered].sort((a, b) => {
    let aValue, bValue

    if (sortField.value === 'date') {
      aValue = new Date(a.date).getTime()
      bValue = new Date(b.date).getTime()
    } else if (sortField.value === 'amount') {
      aValue = a.amount
      bValue = b.amount
    } else if (sortField.value === 'category.name') {
      aValue = a.category?.name || ''
      bValue = b.category?.name || ''
    } else {
      return 0
    }

    if (sortOrder.value === 1) {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    }
  })

  return sortedFiltered
})

// Pagination computed properties
const totalPages = computed(() =>
  Math.ceil(filteredTransactions.value.length / itemsPerPage.value)
)

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTransactions.value.slice(start, end)
})

// Quick stats computed properties
const totalIncome = computed(() => {
  return filteredTransactions.value
    .filter((t) => t.category?.type?.name === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
    .toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
})

const totalExpenses = computed(() => {
  return filteredTransactions.value
    .filter((t) => t.category?.type?.name !== 'income')
    .reduce((sum, t) => sum + t.amount, 0)
    .toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
})

const balance = computed(() => {
  const income = filteredTransactions.value
    .filter((t) => t.category?.type?.name === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = filteredTransactions.value
    .filter((t) => t.category?.type?.name !== 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  return (income - expenses).toLocaleString('it-IT', {
    style: 'currency',
    currency: 'EUR',
  })
})

const balanceColor = computed(() => {
  const income = filteredTransactions.value
    .filter((t) => t.category?.type?.name === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = filteredTransactions.value
    .filter((t) => t.category?.type?.name !== 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const balanceValue = income - expenses
  return balanceValue >= 0
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400'
})

// Quick month navigation
const quickMonthOptions = computed(() => {
  const currentDate = new Date()
  const months = []

  for (let i = 2; i >= 0; i--) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    )
    months.push({
      label: date.toLocaleDateString('en-US', { month: 'short' }),
      value: date.getMonth(),
      year: date.getFullYear(),
    })
  }

  return months
})

const currentSelectedMonth = ref<number | null>(null)

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
    // Set current month for quick navigation
    currentSelectedMonth.value = new Date().getMonth()
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

// Pagination methods
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function onPageChange(event: any) {
  currentPage.value = Math.floor(event.first / event.rows) + 1
  first.value = event.first
}

// Sorting methods
function onSort(event: any) {
  sortField.value = event.sortField || 'date'
  sortOrder.value = event.sortOrder || -1
}

// Quick month navigation methods
function selectQuickMonth(month: number) {
  const currentYear = new Date().getFullYear()

  const [startDate, endDate] = calculateDateRange(
    appUser.value?.start_month || 1,
    new Date(currentYear, month + 1, 1)
  )
  dateRange.value = [startDate, endDate]
  // Set current month for quick navigation
  currentSelectedMonth.value = new Date().getMonth()

  dateRange.value = [startDate, endDate]
  currentSelectedMonth.value = month
  fetchTransactions()
}

function isCurrentMonth(month: number): boolean {
  return currentSelectedMonth.value === month
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
    transition: all 0.3s ease-in-out;
    border-left: 4px solid transparent;
    position: relative;
    overflow: hidden;
  }

  .transaction-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(59, 130, 246, 0.1),
      transparent
    );
    transition: left 0.5s ease-in-out;
  }

  .transaction-card:hover::before {
    left: 100%;
  }

  .transaction-card:hover {
    border-left-color: rgb(59, 130, 246);
    transform: translateX(4px) translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .dark .transaction-card:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
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
