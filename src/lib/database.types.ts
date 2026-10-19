export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type PipelineStage = 'lead' | 'audit_sent' | 'contacted' | 'call_booked' | 'proposal_sent' | 'closed_won' | 'closed_lost'
export type ClientStatus = 'onboarding' | 'active' | 'paused' | 'churned'
export type BillingType = 'one_time' | 'monthly_retainer' | 'milestone'
export type EmailVerificationStatus = 'unverified' | 'verified' | 'catch_all' | 'invalid'
export type ExchangeCategory = 'web_dev' | 'seo' | 'ads' | 'ecommerce' | 'content' | 'app_dev' | 'other'
export type DealType = 'fixed_bounty' | 'referral_commission' | 'free_share'
export type ListingStatus = 'open' | 'in_progress' | 'claimed' | 'closed'

export interface Database {
    public: {
        Tables: {
            leads: {
                Row: {
                    id: string
                    user_id: string
                    business_name: string
                    website_url: string | null
                    google_place_id: string | null
                    status: 'new' | 'auditing' | 'audited' | 'contacted'
                    created_at: string
                    notes: string | null
                    value: number | null
                    last_contacted_at: string | null
                    phone: string | null
                    address: string | null
                    is_favorite: boolean
                    lead_score: number | null
                    score_reasons: string[] | null
                    pipeline_stage: PipelineStage
                    win_probability: number
                    expected_close_date: string | null
                    contact_name: string | null
                    contact_email: string | null
                    contact_role: string | null
                    linkedin_url: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    business_name: string
                    website_url?: string | null
                    google_place_id?: string | null
                    status?: 'new' | 'auditing' | 'audited' | 'contacted'
                    created_at?: string
                    notes?: string | null
                    value?: number | null
                    last_contacted_at?: string | null
                    phone?: string | null
                    address?: string | null
                    is_favorite?: boolean
                    lead_score?: number | null
                    score_reasons?: string[] | null
                    pipeline_stage?: PipelineStage
                    win_probability?: number
                    expected_close_date?: string | null
                    contact_name?: string | null
                    contact_email?: string | null
                    contact_role?: string | null
                    linkedin_url?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    business_name?: string
                    website_url?: string | null
                    google_place_id?: string | null
                    status?: 'new' | 'auditing' | 'audited' | 'contacted'
                    created_at?: string
                    notes?: string | null
                    value?: number | null
                    last_contacted_at?: string | null
                    phone?: string | null
                    address?: string | null
                    is_favorite?: boolean
                    lead_score?: number | null
                    score_reasons?: string[] | null
                    pipeline_stage?: PipelineStage
                    win_probability?: number
                    expected_close_date?: string | null
                    contact_name?: string | null
                    contact_email?: string | null
                    contact_role?: string | null
                    linkedin_url?: string | null
                }
            }
            clients: {
                Row: {
                    id: string
                    user_id: string
                    lead_id: string | null
                    company_name: string
                    website_url: string | null
                    primary_contact_name: string | null
                    primary_contact_email: string | null
                    primary_contact_phone: string | null
                    status: ClientStatus
                    billing_type: BillingType
                    monthly_value: number
                    contract_start_date: string | null
                    contract_renewal_date: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    lead_id?: string | null
                    company_name: string
                    website_url?: string | null
                    primary_contact_name?: string | null
                    primary_contact_email?: string | null
                    primary_contact_phone?: string | null
                    status?: ClientStatus
                    billing_type?: BillingType
                    monthly_value?: number
                    contract_start_date?: string | null
                    contract_renewal_date?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    lead_id?: string | null
                    company_name?: string
                    website_url?: string | null
                    primary_contact_name?: string | null
                    primary_contact_email?: string | null
                    primary_contact_phone?: string | null
                    status?: ClientStatus
                    billing_type?: BillingType
                    monthly_value?: number
                    contract_start_date?: string | null
                    contract_renewal_date?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            contacts: {
                Row: {
                    id: string
                    lead_id: string | null
                    client_id: string | null
                    name: string
                    role: string | null
                    email: string | null
                    email_status: EmailVerificationStatus
                    phone: string | null
                    linkedin_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    lead_id?: string | null
                    client_id?: string | null
                    name: string
                    role?: string | null
                    email?: string | null
                    email_status?: EmailVerificationStatus
                    phone?: string | null
                    linkedin_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    lead_id?: string | null
                    client_id?: string | null
                    name?: string
                    role?: string | null
                    email?: string | null
                    email_status?: EmailVerificationStatus
                    phone?: string | null
                    linkedin_url?: string | null
                    created_at?: string
                }
            }
            activities: {
                Row: {
                    id: string
                    user_id: string
                    lead_id: string | null
                    client_id: string | null
                    type: string
                    title: string
                    description: string | null
                    metadata: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    lead_id?: string | null
                    client_id?: string | null
                    type: string
                    title: string
                    description?: string | null
                    metadata?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    lead_id?: string | null
                    client_id?: string | null
                    type?: string
                    title?: string
                    description?: string | null
                    metadata?: Json | null
                    created_at?: string
                }
            }
            shareable_reports: {
                Row: {
                    id: string
                    report_id: string
                    slug: string
                    views_count: number
                    last_viewed_at: string | null
                    cta_clicks: number
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    report_id: string
                    slug: string
                    views_count?: number
                    last_viewed_at?: string | null
                    cta_clicks?: number
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    report_id?: string
                    slug?: string
                    views_count?: number
                    last_viewed_at?: string | null
                    cta_clicks?: number
                    is_active?: boolean
                    created_at?: string
                }
            }
            exchange_listings: {
                Row: {
                    id: string
                    creator_id: string
                    title: string
                    category: ExchangeCategory
                    description: string
                    budget_range: string | null
                    location: string | null
                    deal_type: DealType
                    bounty_amount: number | null
                    commission_percentage: number | null
                    status: ListingStatus
                    claimed_by: string | null
                    contact_email: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    creator_id: string
                    title: string
                    category: ExchangeCategory
                    description: string
                    budget_range?: string | null
                    location?: string | null
                    deal_type?: DealType
                    bounty_amount?: number | null
                    commission_percentage?: number | null
                    status?: ListingStatus
                    claimed_by?: string | null
                    contact_email?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    creator_id?: string
                    title?: string
                    category?: ExchangeCategory
                    description?: string
                    budget_range?: string | null
                    location?: string | null
                    deal_type?: DealType
                    bounty_amount?: number | null
                    commission_percentage?: number | null
                    status?: ListingStatus
                    claimed_by?: string | null
                    contact_email?: string | null
                    created_at?: string
                }
            }
            reports: {
                Row: {
                    id: string
                    lead_id: string
                    overall_score: number
                    scan_data: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    lead_id: string
                    overall_score: number
                    scan_data: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    lead_id?: string
                    overall_score?: number
                    scan_data?: Json
                    created_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    agency_name: string | null
                    agency_logo_url: string | null
                    calendar_link: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    agency_name?: string | null
                    agency_logo_url?: string | null
                    calendar_link?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    agency_name?: string | null
                    agency_logo_url?: string | null
                    calendar_link?: string | null
                    updated_at?: string | null
                }
            }
            subscriptions: {
                Row: {
                    id: string
                    user_id: string
                    plan: 'free' | 'pro' | 'enterprise'
                    stripe_customer_id: string | null
                    stripe_subscription_id: string | null
                    polar_customer_id: string | null
                    polar_subscription_id: string | null
                    current_period_end: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    plan?: 'free' | 'pro' | 'enterprise'
                    stripe_customer_id?: string | null
                    stripe_subscription_id?: string | null
                    polar_customer_id?: string | null
                    polar_subscription_id?: string | null
                    current_period_end?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    plan?: 'free' | 'pro' | 'enterprise'
                    stripe_customer_id?: string | null
                    stripe_subscription_id?: string | null
                    polar_customer_id?: string | null
                    polar_subscription_id?: string | null
                    current_period_end?: string | null
                    created_at?: string
                }
            }
            usage: {
                Row: {
                    id: string
                    user_id: string
                    period: string
                    leads_count: number
                    audits_count: number
                    api_calls: number
                }
                Insert: {
                    id?: string
                    user_id: string
                    period: string
                    leads_count?: number
                    audits_count?: number
                    api_calls?: number
                }
                Update: {
                    id?: string
                    user_id?: string
                    period?: string
                    leads_count?: number
                    audits_count?: number
                    api_calls?: number
                }
            }
            api_keys: {
                Row: {
                    id: string
                    user_id: string
                    key_hash: string
                    name: string
                    last_used: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    key_hash: string
                    name?: string
                    last_used?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    key_hash?: string
                    name?: string
                    last_used?: string | null
                    created_at?: string
                }
            }
            events: {
                Row: {
                    id: string
                    user_id: string
                    event: string
                    metadata: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    event: string
                    metadata?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    event?: string
                    metadata?: Json | null
                    created_at?: string
                }
            }
        }
    }
}
