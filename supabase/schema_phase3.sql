-- Phase 3 CRM & Branding Updates

-- 1. Create Profiles Table (for Agency Branding)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  agency_name text,
  agency_logo_url text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(agency_name) >= 3)
);

-- Enable RLS for Profiles
alter table profiles enable row level security;

create policy "Users can view own profile" 
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile" 
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile" 
  on profiles for insert with check (auth.uid() = id);

-- 2. Update Leads Table (for CRM)
alter table leads 
add column if not exists notes text,
add column if not exists value integer, -- Estimated deal value
add column if not exists last_contacted_at timestamp with time zone;

-- Update status enum if not already compatible (optional, handled in app logic usually)
-- For now we stick to text status and just manage it in frontend.
