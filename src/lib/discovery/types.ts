import { LeadPriority } from '../lead-scoring';

export interface DiscoveredBusiness {
    name: string;
    website?: string;
    formatted_address: string;
    place_id: string;
    rating?: number;
    user_ratings_total?: number;
    phone?: string;
    photos?: any[];
    lead_score?: number;
    score_reasons?: string[];
    priority?: LeadPriority;
}

export interface BusinessCategory {
    id: string;
    label: string;
    type?: string;
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
    { id: 'all', label: 'All' },
    { id: 'restaurant', label: 'Restaurants', type: 'restaurant' },
    { id: 'clinic', label: 'Clinics', type: 'doctor' },
    { id: 'gym', label: 'Gyms', type: 'gym' },
    { id: 'salon', label: 'Salons', type: 'beauty_salon' },
    { id: 'dental', label: 'Dental', type: 'dentist' },
    { id: 'legal', label: 'Legal', type: 'lawyer' },
    { id: 'real_estate', label: 'Real Estate', type: 'real_estate_agency' },
    { id: 'auto', label: 'Auto Repair', type: 'car_repair' },
    { id: 'plumber', label: 'Plumbers', type: 'plumber' },
];

export interface DiscoveryResponse {
    results: DiscoveredBusiness[];
    next_page_token?: string;
}
