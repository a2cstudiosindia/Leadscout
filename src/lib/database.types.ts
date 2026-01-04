export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

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
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    agency_name?: string | null
                    agency_logo_url?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    agency_name?: string | null
                    agency_logo_url?: string | null
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
                    current_period_end: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    plan?: 'free' | 'pro' | 'enterprise'
                    stripe_customer_id?: string | null
                    stripe_subscription_id?: string | null
                    current_period_end?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    plan?: 'free' | 'pro' | 'enterprise'
                    stripe_customer_id?: string | null
                    stripe_subscription_id?: string | null
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

