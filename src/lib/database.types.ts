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
                    website_url: string
                    google_place_id: string | null
                    status: 'new' | 'auditing' | 'audited' | 'contacted'
                    created_at: string
                    notes: string | null
                    value: number | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    business_name: string
                    website_url: string
                    google_place_id?: string | null
                    status?: 'new' | 'auditing' | 'audited' | 'contacted'
                    created_at?: string
                    notes?: string | null
                    value?: number | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    business_name?: string
                    website_url?: string
                    google_place_id?: string | null
                    status?: 'new' | 'auditing' | 'audited' | 'contacted'
                    created_at?: string
                    notes?: string | null
                    value?: number | null
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
        }
    }
}
