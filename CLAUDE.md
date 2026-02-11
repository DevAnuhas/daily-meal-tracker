# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server (<http://localhost:3000>)
- `npm run build` — Production build
- `npm run lint` — ESLint

No test framework is configured.

## Environment Variables

Requires `.env` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Architecture

Next.js 16 app with Supabase backend, Google OAuth, and Tailwind CSS v4. All pages are client-side rendered (`"use client"`).

### Supabase Clients

There are **three separate Supabase client files** — this is important to understand:

- `lib/auth.ts` — Browser client via `@supabase/ssr`, used for auth operations (sign in/out, session management). Imported by `lib/auth-context.tsx`.
- `lib/supabase-client.ts` — Browser client via `@supabase/ssr`, used for data operations in components. Exports `Meal` and `Payment` types with `user_id` field.
- `lib/supabase.ts` — Direct client via `@supabase/supabase-js`, also exports `Meal` and `Payment` types (without `user_id`). Used by `lib/meal-utils.ts`.

### Auth Flow

- `lib/auth-context.tsx` — React context provider (`AuthProvider`) wrapping the app in `layout.tsx`. Provides `useAuth()` hook with `user`, `session`, `loading`, `signOut`.
- `components/auth-guard.tsx` — Wraps protected pages, redirects to login if unauthenticated.
- `app/auth/callback/route.ts` — OAuth callback handler.

### Pages

- `/` — Dashboard (protected, renders `<Dashboard />`)
- `/log` — Meal logging
- `/calendar` — Calendar view

### UI Components

Uses shadcn/ui (new-york style) with Radix UI primitives. Components in `components/ui/` are generated shadcn components. Path aliases: `@/components`, `@/lib`, `@/hooks`.

### Domain

Tracks daily meals (breakfast/lunch/dinner) with paid/unpaid status per meal. Currency is Rs. (Sri Lankan Rupees) at a fixed price of Rs.250 per meal (`MEAL_PRICE` in `lib/meal-utils.ts`). Database schema is in `scripts/setup.sql` (profiles, meals, payments tables with RLS).
