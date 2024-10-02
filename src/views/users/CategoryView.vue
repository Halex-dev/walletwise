<template>
  <div class="category-page">
    <h1 class="text-2xl font-bold mb-4">{{ $t('pages.categories.title') }}</h1>

    <div class="mb-4">
      <Button
        @click="openNewCategoryDialog"
        :label="$t('pages.categories.addNew')"
        icon="pi pi-plus"
      />
    </div>

    <DataTable :value="categories" :loading="loading" class="p-datatable-sm">
      <Column field="name" :header="$t('pages.categories.name')" sortable>
        <template #body="{ data }">
          <div class="flex items-center">
            <i :class="data.icon" class="mr-2"></i>
            {{ data.name }}
          </div>
        </template>
      </Column>
      <Column
        field="type.name"
        :header="$t('pages.categories.type')"
        sortable
      ></Column>
      <Column :header="$t('common.actions')">
        <template #body="{ data }">
          <Button
            icon="pi pi-pencil"
            class="p-button-text p-button-sm"
            @click="editCategory(data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-text p-button-sm p-button-danger"
            @click="confirmDeleteCategory(data)"
          />
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="categoryDialogVisible"
      :header="
        dialogMode === 'create'
          ? $t('pages.categories.addNew')
          : $t('pages.categories.edit')
      "
      :modal="true"
      class="p-fluid"
    >
      <div class="field">
        <label for="name">{{ $t('pages.categories.name') }}</label>
        <InputText
          id="name"
          v-model="editingCategory.name"
          required
          autofocus
        />
      </div>
      <div class="field">
        <label for="type">{{ $t('pages.categories.type') }}</label>
        <Select
          id="type"
          v-model="editingCategory.type_id"
          :options="categoryTypes"
          optionLabel="name"
          optionValue="id"
          placeholder="Select a type"
          required
        />
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
          class="p-button-text"
          @click="saveCategory"
        />
      </template>
    </Dialog>

    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import { useCategoryStore } from '@/stores/categoryStore'
import { useAuthStore } from '@/stores/authStore'
import type { Category, CategoryType } from '@/types/category'
import { storeToRefs } from 'pinia'

const categoryStore = useCategoryStore()
const authStore = useAuthStore()
const confirm = useConfirm()
const toast = useToast()
const { t } = useI18n()

const { appUser } = storeToRefs(authStore)

const categories = ref<Category[]>([])
const categoryTypes = ref<CategoryType[]>([])
const loading = ref(true)
const categoryDialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingCategory = ref<Partial<Category>>({})

onMounted(async () => {
  await fetchCategories()
  await fetchCategoryTypes()
})

async function fetchCategories() {
  loading.value = true
  try {
    if (appUser.value) {
      await categoryStore.fetchUserCategories(appUser.value.id)
      categories.value = categoryStore.categories
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('pages.categories.fetchError'),
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

async function fetchCategoryTypes() {
  try {
    await categoryStore.fetchCategoryTypes()
    categoryTypes.value = categoryStore.categoryTypes
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('pages.categories.typesError'),
      life: 3000,
    })
  }
}

function openNewCategoryDialog() {
  dialogMode.value = 'create'
  editingCategory.value = {}
  categoryDialogVisible.value = true
}

function editCategory(category: Category) {
  dialogMode.value = 'edit'
  editingCategory.value = { ...category }
  categoryDialogVisible.value = true
}

function closeCategoryDialog() {
  categoryDialogVisible.value = false
  editingCategory.value = {}
}

async function saveCategory() {
  try {
    if (dialogMode.value === 'create') {
      await categoryStore.createCategory({
        ...editingCategory.value,
        user_id: appUser.value?.id,
      })
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('pages.categories.createSuccess'),
        life: 3000,
      })
    } else {
      if (editingCategory.value.id) {
        await categoryStore.updateCategory(
          editingCategory.value.id,
          editingCategory.value
        )
        toast.add({
          severity: 'success',
          summary: t('common.success'),
          detail: t('pages.categories.updateSuccess'),
          life: 3000,
        })
      }
    }
    closeCategoryDialog()
    await fetchCategories()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('pages.categories.saveError'),
      life: 3000,
    })
  }
}

function confirmDeleteCategory(category: Category) {
  confirm.require({
    message: t('pages.categories.deleteConfirm'),
    header: t('common.confirmDelete'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteCategory(category),
  })
}

async function deleteCategory(category: Category) {
  try {
    if (category.id) {
      await categoryStore.deleteCategory(category.id)
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('pages.categories.deleteSuccess'),
        life: 3000,
      })
      await fetchCategories()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('pages.categories.deleteError'),
      life: 3000,
    })
  }
}
</script>
