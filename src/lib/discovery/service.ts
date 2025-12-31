import { DiscoveredBusiness, DiscoveryResponse } from './types';

// Mock data for development
const MOCK_RESULTS: DiscoveredBusiness[] = [
    {
        name: "Smile Bright Dental",
        website: "https://example.com",
        formatted_address: "123 Main St, New York, NY",
        place_id: "mock_1",
        rating: 4.5,
        user_ratings_total: 120
    },
    {
        name: "City Gym & Fitness",
        website: "https://spinacho.com", // Keeping the working one for demo
        formatted_address: "456 Broadway, New York, NY",
        place_id: "mock_2",
        rating: 4.8,
        user_ratings_total: 85
    },
    {
        name: "Old School Bakery",
        website: "http://never-updated-bakery.com", // Intentionally bad for testing
        formatted_address: "789 Market St, San Francisco, CA",
        place_id: "mock_3",
        rating: 3.2,
        user_ratings_total: 12
    }
];

export class DiscoveryService {
    private apiKey: string | undefined;

    constructor() {
        this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
    }

    async search(query: string): Promise<DiscoveryResponse> {
        if (!this.apiKey) {
            console.warn("No GOOGLE_PLACES_API_KEY found. Returning mock data.");
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { results: MOCK_RESULTS };
        }

        try {
            // Use Google Places Text Search (New)
            const url = `https://places.googleapis.com/v1/places:searchText`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.apiKey,
                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.websiteUri,places.id,places.rating,places.userRatingCount'
                },
                body: JSON.stringify({
                    textQuery: query
                })
            });

            if (!response.ok) {
                throw new Error(`Google API Error: ${response.statusText}`);
            }

            const data = await response.json();

            const results: DiscoveredBusiness[] = (data.places || []).map((place: any) => ({
                name: place.displayName?.text || "Unknown",
                website: place.websiteUri,
                formatted_address: place.formattedAddress,
                place_id: place.id,
                rating: place.rating,
                user_ratings_total: place.userRatingCount
            }));

            return { results };

        } catch (error) {
            console.error("Discovery search failed:", error);
            return { results: [] };
        }
    }
}
