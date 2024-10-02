import { supabase } from '@/services/supabase'
import type { Category, CategoryType } from '@/types/category'

export const categoryService = {
  async getCategoryTypes(): Promise<CategoryType[]> {
    const { data, error } = await supabase.from('category_types').select('*')
    if (error) throw error
    return data
  },

  async getUserCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*, type:category_types(name)')
      .eq('user_id', userId)
      .is('deleted_at', null) // Aggiunto per escludere categorie eliminate

    if (error) throw error
    return data
  },

  async createCategory(category: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateCategory(
    categoryId: string,
    updates: Partial<Category>
  ): Promise<Category> {
    //Togliamo le releazioni per aggiornare solo i campi necessari
    const { type, ...restData } = updates
    const { data, error } = await supabase
      .from('categories')
      .update(restData)
      .eq('id', categoryId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', categoryId)

    if (error) throw error
  },
}
