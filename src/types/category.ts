export interface CategoryType {
  id: number
  name:
    | 'income'
    | 'necessary_expense'
    | 'optional_expense'
    | 'short_term_investment'
    | 'long_term_investment'
}

export interface Category {
  id: string
  user_id: string
  name: string
  type_id: number
  type?: CategoryType
  created_at: string
  updated_at: string
}
