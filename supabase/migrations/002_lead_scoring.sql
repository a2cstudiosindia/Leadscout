-- Lead scoring columns for priority sorting
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score integer DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_reasons text[];

CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads (user_id, lead_score DESC);
