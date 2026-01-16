-- Add UNIQUE constraint to usage table for proper upsert operations
-- This prevents duplicate records for the same user/period combination

-- First, check for and delete any duplicates (keeping the one with highest counts)
DELETE FROM usage u1
WHERE EXISTS (
    SELECT 1 FROM usage u2 
    WHERE u2.user_id = u1.user_id 
    AND u2.period = u1.period 
    AND u2.id > u1.id
);

-- Add the unique constraint
ALTER TABLE usage ADD CONSTRAINT usage_user_period_unique UNIQUE (user_id, period);
