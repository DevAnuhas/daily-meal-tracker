import { createBrowserClient } from "@supabase/ssr"
import type { Session, User } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export type AuthUser = User | null

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    console.error("Sign in error:", error)
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Sign out error:", error)
    throw error
  }
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error("Get session error:", error)
    return null
  }
  return data.session
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    console.error("Get user error:", error)
    return null
  }
  return data.user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Get profile error:", error)
    return null
  }

  return data
}
