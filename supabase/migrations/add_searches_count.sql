-- Add searches_count column to usage table for tracking search limits
ALTER TABLE usage ADD COLUMN IF NOT EXISTS searches_count integer DEFAULT 0;
