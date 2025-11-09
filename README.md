# Daily Meal Tracker

A Next.js application for tracking daily meals with Google authentication and Supabase backend.

## Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account
- Google Cloud Console account

## Installation

Clone and install dependencies:
```bash
git clone https://github.com/DevAnuhas/daily-meal-tracker.git
cd daily-meal-tracker
npm install
```

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and create

### 2. Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy the entire content from [setup.sql](scripts/setup.sql)
3. Paste and click "Run"

This creates:
- `profiles` table (user data)
- `meals` table (daily meal tracking)
- `payments` table (payment records)
- RLS policies (security)
- Triggers and indexes

### 3. Get Supabase Credentials

In Supabase Dashboard, go to **Project Settings**:
1. Go to **Data API**
2. Copy: `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
3. Go to **API Keys**
4. Copy: `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure OAuth consent screen if prompted
6. Select **Web application**
7. Add authorized redirect URIs:
   ```
   https://<your-project-id>.supabase.co/auth/v1/callback
   ```
8. Copy **Client ID** and **Client Secret**

### 2. Configure Google Provider in Supabase

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Paste:
   - Google Client ID
   - Google Client Secret
4. Save

## Environment Variables

Create `.env` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Running the Application

**Development:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

**Lint:**
```bash
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Update Google OAuth redirect URI with production URL
5. Deploy

## Troubleshooting

**Google OAuth not working:**
- Verify redirect URI matches exactly in Google Console
- Check Supabase Google provider is enabled
- Ensure credentials are correct

**Database errors:**
- Verify RLS policies are enabled
- Check user is authenticated
- Confirm tables exist via SQL Editor

**Build errors:**
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Tech Stack

- **Framework:** Next.js 16
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth + Google OAuth
- **UI:** Radix UI + Tailwind CSS
- **Forms:** React Hook Form + Zod
