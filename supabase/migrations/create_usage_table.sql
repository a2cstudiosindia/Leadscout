-- Migration: Create Usage and Events tables for tracking limits and analytics
-- Run this in your Supabase SQL Editor

-- ======================
-- 1. USAGE TABLE
-- ======================
-- Tracks per-user, per-month usage (leads saved, audits run, searches performed)

CREATE TABLE IF NOT EXISTS usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,  -- Better-Auth user ID
    period VARCHAR(7) NOT NULL,  -- Format: YYYY-MM (e.g., "2026-01")
    leads_count INTEGER DEFAULT 0,
    audits_count INTEGER DEFAULT 0,
    searches_count INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- Ensure one record per user per period
    UNIQUE(user_id, period)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON usage(user_id, period);

-- Enable Row Level Security
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Allow all operations on usage" ON usage;

-- Simple policy that allows all operations (server-side access with service role key)
-- RLS is satisfied because we use the service role key from server components
CREATE POLICY "Allow all operations on usage" ON usage FOR ALL USING (true) WITH CHECK (true);


-- ======================
-- 2. EVENTS TABLE
-- ======================
-- Tracks analytics events (audit_run, search_performed, lead_saved, etc.)

CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,  -- Better-Auth user ID
    event VARCHAR(100) NOT NULL,  -- Event name (e.g., 'audit_run', 'lead_saved')
    metadata JSONB DEFAULT '{}'::jsonb,  -- Additional event data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_event ON events(event);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on events" ON events;

-- Simple policy for server-side access
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true) WITH CHECK (true);


-- ======================
-- 3. SUBSCRIPTIONS TABLE (if not exists)
-- ======================
-- Tracks user subscription plans

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,  -- Better-Auth user ID
    plan VARCHAR(20) DEFAULT 'free',  -- 'free', 'pro', 'enterprise'
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    polar_customer_id TEXT,
    polar_subscription_id TEXT,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on subscriptions" ON subscriptions;

-- Simple policy for server-side access
CREATE POLICY "Allow all operations on subscriptions" ON subscriptions FOR ALL USING (true) WITH CHECK (true);

