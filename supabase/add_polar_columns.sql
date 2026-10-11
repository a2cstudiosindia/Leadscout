-- Add Polar payment columns to subscriptions table
-- Run this in Supabase SQL Editor

-- Add Polar columns (safe to run even if they already exist)
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS polar_customer_id TEXT,
ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;
