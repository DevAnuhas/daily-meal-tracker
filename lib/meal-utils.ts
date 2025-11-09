import type { Meal } from "./supabase"

export const MEAL_PRICE = 250

export function calculateMealStats(meals: Meal[]) {
  let totalMeals = 0
  let paidMeals = 0
  let unpaidMeals = 0

  meals.forEach((meal) => {
    // Count taken meals
    if (meal.breakfast) totalMeals++
    if (meal.lunch) totalMeals++
    if (meal.dinner) totalMeals++

    // Count paid meals
    if (meal.breakfast && meal.breakfast_paid) paidMeals++
    if (meal.lunch && meal.lunch_paid) paidMeals++
    if (meal.dinner && meal.dinner_paid) paidMeals++

    // Count unpaid meals
    if (meal.breakfast && !meal.breakfast_paid) unpaidMeals++
    if (meal.lunch && !meal.lunch_paid) unpaidMeals++
    if (meal.dinner && !meal.dinner_paid) unpaidMeals++
  })

  return {
    totalMeals,
    paidMeals,
    unpaidMeals,
    totalDue: unpaidMeals * MEAL_PRICE,
    totalPaid: paidMeals * MEAL_PRICE,
    balance: unpaidMeals * MEAL_PRICE,
  }
}

export function getMealCountForDate(meal: Meal) {
  let count = 0
  if (meal.breakfast) count++
  if (meal.lunch) count++
  if (meal.dinner) count++
  return count
}

export function getPaidMealCountForDate(meal: Meal) {
  let count = 0
  if (meal.breakfast && meal.breakfast_paid) count++
  if (meal.lunch && meal.lunch_paid) count++
  if (meal.dinner && meal.dinner_paid) count++
  return count
}

export function formatCurrency(amount: number) {
  return `Rs.${amount.toLocaleString()}`
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
