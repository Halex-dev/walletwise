import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Category, CategoryType } from '@/types/category'
import { categoryService } from '@/services/supabase/category'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const categoryTypes = ref<CategoryType[]>([])

  async function fetchCategoryTypes() {
    try {
      categoryTypes.value = await categoryService.getCategoryTypes()
    } catch (error) {
      console.error('Errore nel recupero dei tipi di categoria:', error)
    }
  }

  async function fetchUserCategories(userId: string) {
    try {
      categories.value = await categoryService.getUserCategories(userId)
    } catch (error) {
      console.error('Errore nel recupero delle categorie utente:', error)
    }
  }

  async function createCategory(category: Partial<Category>) {
    try {
      const newCategory = await categoryService.createCategory(category)
      categories.value.push(newCategory)
    } catch (error) {
      console.error('Errore nella creazione della categoria:', error)
      throw error
    }
  }

  async function updateCategory(
    categoryId: string,
    updates: Partial<Category>
  ) {
    try {
      const updatedCategory = await categoryService.updateCategory(
        categoryId,
        updates
      )
      const index = categories.value.findIndex((c) => c.id === categoryId)
      if (index !== -1) {
        categories.value[index] = updatedCategory
      }
    } catch (error) {
      console.error("Errore nell'aggiornamento della categoria:", error)
      throw error
    }
  }

  async function deleteCategory(categoryId: string) {
    try {
      await categoryService.deleteCategory(categoryId)
      categories.value = categories.value.filter((c) => c.id !== categoryId)
    } catch (error) {
      console.error("Errore nell'eliminazione della categoria:", error)
      throw error
    }
  }

  return {
    categories,
    categoryTypes,
    fetchCategoryTypes,
    fetchUserCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
