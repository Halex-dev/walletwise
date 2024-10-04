import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Category, CategoryType } from '@/types/category'
import { categoryService } from '@/services/supabase/category'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const categoryTypes = ref<CategoryType[]>([])

  const categoriesByType = computed(() => {
    const result: Record<string, Category[]> = {}
    categories.value.forEach((category) => {
      if (category.type) {
        if (!result[category.type.name]) {
          result[category.type.name] = []
        }
        result[category.type.name].push(category)
      }
    })
    return result
  })

  async function fetchCategoryTypes() {
    try {
      categoryTypes.value = await categoryService.getCategoryTypes()
    } catch (error) {
      console.error('Error fetching category types:', error)
      throw error
    }
  }

  async function fetchUserCategories(userId: string) {
    try {
      categories.value = await categoryService.getUserCategories(userId)
    } catch (error) {
      console.error('Error fetching user categories:', error)
      throw error
    }
  }

  async function createCategory(category: Partial<Category>) {
    try {
      const newCategory = await categoryService.createCategory(category)
      categories.value.push(newCategory)
      return newCategory
    } catch (error) {
      console.error('Error creating category:', error)
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
      return updatedCategory
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  }

  async function deleteCategory(categoryId: string) {
    try {
      await categoryService.deleteCategory(categoryId)
      categories.value = categories.value.filter((c) => c.id !== categoryId)
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }

  return {
    categories,
    categoryTypes,
    categoriesByType,
    fetchCategoryTypes,
    fetchUserCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
