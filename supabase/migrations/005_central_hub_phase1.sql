-- Migration 005: LeadScout Central Hub Phase 1
-- Adds Clients Hub, Contact Enrichment, Pipeline Stage Tracking, Shareable Reports, Activity Stream, and Deal Exchange

-- 1. Extend LEADS table with Pipeline and Contact fields
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'lead',
ADD COLUMN IF NOT EXISTS win_probability INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS expected_close_date DATE,
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_role TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_user_pipeline_stage ON leads (user_id, pipeline_stage);

-- 2. CLIENTS Table (Active Client Lifecycle Management Hub)
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    website_url TEXT,
    primary_contact_name TEXT,
    primary_contact_email TEXT,
    primary_contact_phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('onboarding', 'active', 'paused', 'churned')),
    billing_type TEXT DEFAULT 'monthly_retainer' CHECK (billing_type IN ('one_time', 'monthly_retainer', 'milestone')),
    monthly_value NUMERIC(10, 2) DEFAULT 0.00,
    contract_start_date DATE,
    contract_renewal_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients (user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients (user_id, status);
CREATE INDEX IF NOT EXISTS idx_clients_renewal_date ON clients (contract_renewal_date);

-- 3. CONTACTS Table (Multiple Decision-Makers per Lead/Client)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    email_status TEXT DEFAULT 'unverified' CHECK (email_status IN ('unverified', 'verified', 'catch_all', 'invalid')),
    phone TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON contacts (lead_id);
CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON contacts (client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts (email);

-- 4. ACTIVITIES Table (Timeline for leads & client accounts)
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities (user_id);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities (lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_client_id ON activities (client_id, created_at DESC);

-- 5. SHAREABLE_REPORTS Table (Interactive Web Audit Viewer)
CREATE TABLE IF NOT EXISTS shareable_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    views_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMPTZ,
    cta_clicks INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shareable_reports_report_id ON shareable_reports (report_id);
CREATE INDEX IF NOT EXISTS idx_shareable_reports_slug ON shareable_reports (slug);

-- 6. EXCHANGE_LISTINGS Table (B2B Lead & Client Deal Exchange)
CREATE TABLE IF NOT EXISTS exchange_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    budget_range TEXT,
    location TEXT,
    deal_type TEXT DEFAULT 'referral_commission' CHECK (deal_type IN ('fixed_bounty', 'referral_commission', 'free_share')),
    bounty_amount NUMERIC(10, 2),
    commission_percentage INTEGER,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'claimed', 'closed')),
    claimed_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    contact_email TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exchange_listings_creator_id ON exchange_listings (creator_id);
CREATE INDEX IF NOT EXISTS idx_exchange_listings_status ON exchange_listings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_listings_category ON exchange_listings (category);

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareable_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on clients" ON clients;
DROP POLICY IF EXISTS "Allow all on contacts" ON contacts;
DROP POLICY IF EXISTS "Allow all on activities" ON activities;
DROP POLICY IF EXISTS "Allow all on shareable_reports" ON shareable_reports;
DROP POLICY IF EXISTS "Allow all on exchange_listings" ON exchange_listings;

CREATE POLICY "Allow all on clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on activities" ON activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on shareable_reports" ON shareable_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on exchange_listings" ON exchange_listings FOR ALL USING (true) WITH CHECK (true);

-- 8. GRANT DATA API ACCESS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
