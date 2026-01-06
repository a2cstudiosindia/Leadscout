-- Add missing columns to leads table for full CRM functionality

-- Add phone column
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone text;

-- Add address column  
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address text;

-- Add is_favorite column for Enterprise favorites feature
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;

-- Ensure notes column exists (may already exist from phase3)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes text;

-- Ensure value column exists (may already exist from phase3)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS value integer;

-- Ensure last_contacted_at column exists
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contacted_at timestamp with time zone;
