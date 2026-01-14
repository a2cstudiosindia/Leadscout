-- Add Polar-specific columns to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS polar_customer_id TEXT,
ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_polar_customer_id ON subscriptions(polar_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_polar_subscription_id ON subscriptions(polar_subscription_id);
