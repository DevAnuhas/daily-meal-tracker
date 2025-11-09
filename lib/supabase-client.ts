import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export type Meal = {
  id: string
  user_id: string
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
  user_id: string
  amount: number
  meal_count: number
  payment_date: string
  description?: string
  created_at: string
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export function useSupabaseClient() {
  return supabase
}
