-- Enable UUID extension just in case
create extension if not exists "uuid-ossp";

-- Create Enum for Lead Status
create type lead_status as enum ('new', 'auditing', 'audited', 'contacted');

-- Create Leads Table
create table leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  business_name text not null,
  website_url text not null,
  google_place_id text,
  status lead_status default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Reports Table
create table reports (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references leads(id) on delete cascade not null,
  overall_score integer not null,
  scan_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table leads enable row level security;
alter table reports enable row level security;

-- Policies for Leads
create policy "Users can view their own leads" on leads
  for select using (auth.uid() = user_id);

create policy "Users can insert their own leads" on leads
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own leads" on leads
  for update using (auth.uid() = user_id);

create policy "Users can delete their own leads" on leads
  for delete using (auth.uid() = user_id);

-- Policies for Reports
create policy "Users can view reports for their leads" on reports
  for select using (
    exists ( select 1 from leads where leads.id = reports.lead_id and leads.user_id = auth.uid() )
  );

create policy "Users can insert reports for their leads" on reports
  for insert with check (
    exists ( select 1 from leads where leads.id = reports.lead_id and leads.user_id = auth.uid() )
  );
