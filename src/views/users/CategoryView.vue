<template>
  <div class="categories-page p-4 md:p-6 lg:p-8">
    <h1 class="text-3xl font-semibold mb-6">
      {{ $t('pages.categories.title') }}
    </h1>

    <div
      class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <Button
        @click="openNewCategoryDialog"
        :label="$t('pages.categories.addNew')"
        icon="pi pi-plus"
        class="p-button-primary w-full sm:w-auto"
      />
      <span class="p-input-icon-left w-full sm:w-auto">
        <i class="pi pi-search" />
        <InputText
          v-model="searchQuery"
          :placeholder="$t('common.search')"
          class="w-full"
        />
      </span>
    </div>

    <DataTable
      :value="filteredCategories"
      :loading="loading"
      class="p-datatable-sm p-datatable-striped"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      responsiveLayout="stack"
      breakpoint="960px"
      dataKey="id"
      :scrollable="true"
      scrollHeight="400px"
    >
      <Column field="name" :header="$t('pages.categories.name')" sortable>
        <template #body="{ data }">
          <span class="font-medium">{{ data.name }}</span>
        </template>
      </Column>
      <Column field="type.name" :header="$t('pages.categories.type')" sortable>
        <template #body="{ data }">
          <Tag
            :value="$t(`pages.categories.categoryTypes.${data.type?.name}`)"
            :severity="getCategoryTagSeverity(data.type?.name)"
          />
        </template>
      </Column>
      <Column
        :header="$t('common.actions')"
        :exportable="false"
        style="min-width: 8rem"
      >
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-text"
              @click="editCategory(data)"
              v-tooltip="$t('common.edit')"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-text p-button-danger"
              @click="confirmDeleteCategory(data)"
              v-tooltip="$t('common.delete')"
            />
          </div>
        </template>
      </Column>
    </DataTable>

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
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import { useCategoryStore } from '@/stores/categoryStore'
import { useAuthStore } from '@/stores/authStore'
import type { Category } from '@/types/category'
import { storeToRefs } from 'pinia'

const categoryStore = useCategoryStore()
const authStore = useAuthStore()
const confirm = useConfirm()
const toast = useToast()
const { t } = useI18n()

const { appUser } = storeToRefs(authStore)
const { categories, categoryTypes } = storeToRefs(categoryStore)

const loading = ref(true)
const categoryDialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingCategory = ref<Partial<Category>>({})
const submitted = ref(false)
const searchQuery = ref('')

const rules = computed(() => ({
  editingCategory: {
    name: { required },
    type_id: { required },
  },
}))

const v$ = useVuelidate(rules, { editingCategory })

const filteredCategories = computed(() => {
  return categories.value.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t(`categoryTypes.${category.type?.name}`)
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase())
  )
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
    showErrorToast('pages.categories.fetchError')
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
      showSuccessToast('pages.categories.createSuccess')
    } else {
      if (editingCategory.value.id) {
        await categoryStore.updateCategory(
          editingCategory.value.id,
          editingCategory.value
        )
        showSuccessToast('pages.categories.updateSuccess')
      }
    }
    closeCategoryDialog()
    await fetchData()
  } catch (error) {
    showErrorToast('pages.categories.saveError')
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
      showSuccessToast('pages.categories.deleteSuccess')
      await fetchData()
    }
  } catch (error) {
    showErrorToast('pages.categories.deleteError')
  }
}

function showSuccessToast(key: string) {
  toast.add({
    severity: 'success',
    summary: t('common.success'),
    detail: t(key),
    life: 3000,
  })
}

function showErrorToast(key: string) {
  toast.add({
    severity: 'error',
    summary: t('common.error'),
    detail: t(key),
    life: 3000,
  })
}

function getCategoryTagSeverity(typeName?: string): string {
  const severityMap: Record<string, string> = {
    income: 'success',
    necessary_expense: 'warning',
    optional_expense: 'danger',
    short_term_investment: 'info',
    long_term_investment: 'primary',
  }
  return severityMap[typeName || ''] || 'secondary'
}
</script>
