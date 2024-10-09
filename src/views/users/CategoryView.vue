<template>
  <div class="categories-page p-4 md:p-6 lg:p-8">
    <h1 class="text-3xl font-semibold mb-6 text-primary">
      {{ $t('pages.categories.title') }}
    </h1>

    <!-- Filters -->
    <div
      class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <Button
        @click="openNewCategoryDialog"
        :label="$t('pages.categories.addNew')"
        icon="pi pi-plus"
        class="p-button-primary w-full sm:w-auto transition-colors duration-200 hover:bg-primary-600"
      />
      <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchQuery"
            :placeholder="$t('common.search')"
            class="w-full"
          />
        </IconField>
        <Select
          v-model="selectedType"
          :options="categoryTypeOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('pages.categories.filterByType')"
          class="w-full sm:w-64"
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

    <!-- Transition -->
    <TransitionGroup
      name="list"
      tag="div"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <div
        v-for="category in filteredCategories"
        :key="category.id"
        class="category-card bg-surface-50 dark:bg-surface-700 rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg hover:scale-105"
      >
        <h3 class="text-xl font-semibold mb-2">{{ category.name }}</h3>
        <Tag
          :value="$t(`pages.categories.categoryTypes.${category.type?.name}`)"
          :severity="getCategoryTagSeverity(category)"
          class="mb-4"
        />
        <div class="flex justify-end gap-2 mt-4">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-text"
            @click="editCategory(category)"
            v-tooltip="$t('common.edit')"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-text p-button-danger"
            @click="confirmDeleteCategory(category)"
            v-tooltip="$t('common.delete')"
          />
        </div>
      </div>
    </TransitionGroup>

    <Dialog
      v-model:visible="categoryDialogVisible"
      :header="dialogHeader"
      :modal="true"
      class="p-fluid"
      :style="{ width: '450px' }"
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
  }
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
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
