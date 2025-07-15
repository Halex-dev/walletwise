<template>
  <div class="categories-page p-4 md:p-6 lg:p-8">
    <!-- Filters & Actions -->
    <div class="mb-8">
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <div
          class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        >
          <!-- Add New Button -->
          <Button
            @click="openNewCategoryDialog"
            :label="$t('pages.categories.addNew')"
            icon="pi pi-plus"
            class="p-button-primary w-full lg:w-auto transition-all duration-300 hover:shadow-xl hover:scale-105 rounded-xl"
          />

          <!-- Search & Filter Controls -->
          <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <IconField class="w-full sm:w-64">
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="searchQuery"
                :placeholder="$t('common.search')"
                class="w-full transition-all duration-300 focus:shadow-lg"
              />
            </IconField>
            <Select
              v-model="selectedType"
              :options="categoryTypeOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="$t('pages.categories.filterByType')"
              class="w-full sm:w-64 transition-all duration-300 focus:shadow-lg"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value" class="flex align-items-center">
                  <span>{{ slotProps.value.label }}</span>
                </div>
                <span v-else>
                  {{ $t('pages.categories.filterByType') }}
                </span>
              </template>
            </Select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="i in 8"
        :key="`skeleton-${i}`"
        class="category-card bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
      >
        <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
        <div
          class="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-20 mb-4"
        ></div>
        <div class="flex justify-end gap-2">
          <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredCategories.length === 0" class="text-center py-16">
      <div
        class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <i class="pi pi-inbox text-3xl text-gray-400"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {{
          categories.length === 0
            ? $t('pages.categories.noCategories')
            : $t('pages.categories.noFilteredCategories')
        }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{
          categories.length === 0
            ? $t('pages.categories.createFirstCategory')
            : $t('pages.categories.tryDifferentFilter')
        }}
      </p>
      <Button
        v-if="categories.length === 0"
        @click="openNewCategoryDialog"
        :label="$t('pages.categories.addNew')"
        icon="pi pi-plus"
        class="p-button-primary transition-all duration-300 hover:shadow-xl hover:scale-105 rounded-xl"
      />
    </div>

    <!-- Categories Grid -->
    <TransitionGroup
      v-else
      name="category"
      tag="div"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="category in filteredCategories"
        :key="category.id"
        class="category-card bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
      >
        <div class="p-6">
          <!-- Category Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300"
              >
                {{ category.name }}
              </h3>
              <Tag
                :value="
                  $t(`pages.categories.categoryTypes.${category.type?.name}`)
                "
                :severity="getCategoryTagSeverity(category)"
                class="text-sm rounded-full"
              />
            </div>
          </div>

          <!-- Category Stats (placeholder for future enhancement) -->
          <div
            class="mb-4 opacity-60 group-hover:opacity-80 transition-opacity duration-300"
          >
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('pages.categories.createdAt') }}:
              {{ formatDate(category.created_at) }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-2">
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-text p-button-sm transition-all duration-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 hover:scale-110"
              @click="editCategory(category)"
              v-tooltip="$t('common.edit')"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-text p-button-sm p-button-danger transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-110"
              @click="confirmDeleteCategory(category)"
              v-tooltip="$t('common.delete')"
            />
          </div>
        </div>
      </div>
    </TransitionGroup>

    <Dialog
      v-model:visible="categoryDialogVisible"
      :header="dialogHeader"
      :modal="true"
      class="p-fluid"
      :style="{ width: '90vw', maxWidth: '450px' }"
      :draggable="false"
      :resizable="false"
      :closable="true"
    >
      <div class="field mb-4">
        <label for="name" class="font-medium mb-2 block">{{
          $t('pages.categories.name')
        }}</label>
        <InputText
          id="name"
          v-model="editingCategory.name"
          required
          autofocus
          :class="{
            'p-invalid': v$.editingCategory.name.$invalid && submitted,
          }"
        />
        <small
          class="p-error block mt-1"
          v-if="v$.editingCategory.name.$invalid && submitted"
        >
          {{
            $t('validation.required', { field: $t('pages.categories.name') })
          }}
        </small>
      </div>
      <div class="field mb-4">
        <label for="type" class="font-medium mb-2 block">{{
          $t('pages.categories.type')
        }}</label>
        <Select
          id="type"
          v-model="editingCategory.type_id"
          :options="categoryTypes"
          optionLabel="name"
          optionValue="id"
          :placeholder="$t('pages.categories.selectType')"
          required
          :class="{
            'p-invalid': v$.editingCategory.type_id.$invalid && submitted,
          }"
        >
          <template #option="slotProps">
            {{ $t(`pages.categories.categoryTypes.${slotProps.option.name}`) }}
          </template>
        </Select>
        <small
          class="p-error block mt-1"
          v-if="v$.editingCategory.type_id.$invalid && submitted"
        >
          {{
            $t('validation.required', { field: $t('pages.categories.type') })
          }}
        </small>
      </div>
      <template #footer>
        <Button
          :label="$t('common.cancel')"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeCategoryDialog"
        />
        <Button
          :label="$t('common.save')"
          icon="pi pi-check"
          class="p-button-primary"
          @click="saveCategory"
        />
      </template>
    </Dialog>

    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { useConfirm } from 'primevue/useconfirm'
import { useI18n } from 'vue-i18n'
import { useCategoryStore } from '@/stores/categoryStore'
import { useAuthStore } from '@/stores/authStore'
import type { Category, CategoryType } from '@/types/category'
import { getCategoryTagSeverity } from '@/utils/colors'
import { storeToRefs } from 'pinia'

const categoryStore = useCategoryStore()
const authStore = useAuthStore()
const confirm = useConfirm()
const { t } = useI18n()

const { appUser } = storeToRefs(authStore)
const { categories, categoryTypes } = storeToRefs(categoryStore)

import { useToastManager } from '@/utils/toastManager'
const toastManager = useToastManager()

const loading = ref(true)
const categoryDialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingCategory = ref<Partial<Category>>({})
const submitted = ref(false)
const searchQuery = ref('')
const selectedType = ref<CategoryType | null>(null)
const dialogLoading = ref(false)

const rules = computed(() => ({
  editingCategory: {
    name: { required },
    type_id: { required },
  },
}))

const v$ = useVuelidate(rules, { editingCategory })

const categoryTypeOptions = computed(() => [
  { label: t('pages.categories.allTypes'), value: null },
  ...categoryTypes.value.map((type) => ({
    label: t(`pages.categories.categoryTypes.${type.name}`),
    value: type,
  })),
])

const filteredCategories = computed(() => {
  return categories.value.filter((category) => {
    const nameMatch = category.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase())
    const typeMatch =
      !selectedType.value || category.type_id === selectedType.value.id
    return nameMatch && typeMatch
  })
})

const dialogHeader = computed(() =>
  dialogMode.value === 'create'
    ? t('pages.categories.addNew')
    : t('pages.categories.edit')
)

onMounted(async () => {
  await fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    if (appUser.value) {
      await Promise.all([
        categoryStore.fetchUserCategories(appUser.value.id),
        categoryStore.fetchCategoryTypes(),
      ])
    }
  } catch (error) {
    toastManager.showError('pages.categories.fetchError')
  } finally {
    loading.value = false
  }
}

function openNewCategoryDialog() {
  dialogMode.value = 'create'
  editingCategory.value = {}
  submitted.value = false
  categoryDialogVisible.value = true
}

function editCategory(category: Category) {
  dialogMode.value = 'edit'
  editingCategory.value = { ...category }
  submitted.value = false
  categoryDialogVisible.value = true
}

function closeCategoryDialog() {
  categoryDialogVisible.value = false
  editingCategory.value = {}
  v$.value.$reset()
}

async function saveCategory() {
  submitted.value = true
  const isValid = await v$.value.$validate()
  if (!isValid) return

  dialogLoading.value = true
  try {
    if (dialogMode.value === 'create') {
      await categoryStore.createCategory({
        ...editingCategory.value,
        user_id: appUser.value?.id,
      })
      toastManager.showSuccess('pages.categories.createSuccess')
    } else {
      if (editingCategory.value.id) {
        await categoryStore.updateCategory(
          editingCategory.value.id,
          editingCategory.value
        )
        toastManager.showSuccess('pages.categories.updateSuccess')
      }
    }
    closeCategoryDialog()
    await fetchData()
  } catch (error) {
    toastManager.showError('pages.categories.saveError')
  } finally {
    dialogLoading.value = false
  }
}

function formatDate(dateString: string | undefined) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

function confirmDeleteCategory(category: Category) {
  confirm.require({
    message: t('pages.categories.deleteConfirm'),
    header: t('common.confirmDelete'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteCategory(category),
  })
}

async function deleteCategory(category: Category) {
  try {
    if (category.id) {
      await categoryStore.deleteCategory(category.id)
      toastManager.showSuccess('pages.categories.deleteSuccess')
      await fetchData()
    }
  } catch (error) {
    toastManager.showError('pages.categories.deleteError')
  }
}
</script>

<style scoped>
.category-enter-active,
.category-leave-active {
  transition: all 0.5s ease;
}
.category-enter-from,
.category-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}
.category-move {
  transition: transform 0.5s ease;
}

.category-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-card:hover {
  transform: translateY(-4px);
}

@media (max-width: 640px) {
  .category-card:hover {
    transform: translateY(-2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .category-card,
  .category-enter-active,
  .category-leave-active {
    transition: none !important;
  }

  .category-card:hover {
    transform: none !important;
  }
}
</style>
