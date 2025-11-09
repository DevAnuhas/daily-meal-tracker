import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Meal = {
  id: string
  date: string
  breakfast: boolean
  lunch: boolean
  dinner: boolean
  breakfast_paid: boolean
  lunch_paid: boolean
  dinner_paid: boolean
  created_at: string
  updated_at: string
}

export type Payment = {
  id: string
  amount: number
  meal_count: number
  payment_date: string
  description?: string
  created_at: string
}
