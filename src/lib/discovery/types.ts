export interface DiscoveredBusiness {
    name: string;
    website?: string;
    formatted_address: string;
    place_id: string;
    rating?: number;
    user_ratings_total?: number;
    phone?: string;
    photos?: any[];
}

export interface DiscoveryResponse {
    results: DiscoveredBusiness[];
    next_page_token?: string;
}
