-- ============================================================================
-- Daily Meal Tracker - Database Setup Script
-- ============================================================================
-- This script creates all necessary tables, indexes, functions, triggers,
-- and Row Level Security (RLS) policies for the meal tracking application.
-- ============================================================================

-- ============================================================================
-- TABLE: profiles
-- Stores user profile information linked to Supabase Auth
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: meals
-- Tracks daily meal consumption and payment status per user
-- ============================================================================

CREATE TABLE IF NOT EXISTS meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    breakfast BOOLEAN DEFAULT true,
    lunch BOOLEAN DEFAULT true,
    dinner BOOLEAN DEFAULT true,
    breakfast_paid BOOLEAN DEFAULT false,
    lunch_paid BOOLEAN DEFAULT false,
    dinner_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ============================================================================
-- TABLE: payments
-- Tracks bulk meal payments made by users
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    meal_count INTEGER NOT NULL,
    payment_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- Improve query performance for common operations
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- Automatically update timestamps and handle new user creation
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for meals table
DROP TRIGGER IF EXISTS update_meals_updated_at ON meals;
CREATE TRIGGER update_meals_updated_at 
    BEFORE UPDATE ON meals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile when new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Ensure users can only access their own data
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: profiles table
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (needed for manual profile creation)
CREATE POLICY "Users can insert their own profile" 
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- RLS POLICIES: meals table
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own meals" ON meals;
DROP POLICY IF EXISTS "Users can insert their own meals" ON meals;
DROP POLICY IF EXISTS "Users can update their own meals" ON meals;
DROP POLICY IF EXISTS "Users can delete their own meals" ON meals;

-- Users can view their own meals
CREATE POLICY "Users can view their own meals" 
    ON meals FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own meals
CREATE POLICY "Users can insert their own meals" 
    ON meals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own meals
CREATE POLICY "Users can update their own meals" 
    ON meals FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own meals
CREATE POLICY "Users can delete their own meals" 
    ON meals FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: payments table
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON payments;
DROP POLICY IF EXISTS "Users can delete their own payments" ON payments;

-- Users can view their own payments
CREATE POLICY "Users can view their own payments" 
    ON payments FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own payments
CREATE POLICY "Users can insert their own payments" 
    ON payments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own payments
CREATE POLICY "Users can update their own payments" 
    ON payments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own payments
CREATE POLICY "Users can delete their own payments" 
    ON payments FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- END OF SETUP SCRIPT
-- ============================================================================
