import { DiscoveredBusiness, DiscoveryResponse, BUSINESS_CATEGORIES } from './types';
import { getCachedResults, cacheResults, logApiCall } from './places-cache';
import { getCurrentUser } from '@/lib/auth-session';

const MOCK_RESULTS: DiscoveredBusiness[] = [
    {
        name: "Smile Bright Dental",
        website: "https://example.com",
        formatted_address: "123 Main St, New York, NY",
        place_id: "mock_1",
        rating: 4.5,
        user_ratings_total: 120,
        phone: "+1-555-0101",
    },
    {
        name: "City Gym & Fitness",
        website: "https://spinacho.com",
        formatted_address: "456 Broadway, New York, NY",
        place_id: "mock_2",
        rating: 4.8,
        user_ratings_total: 85,
        phone: "+1-555-0102",
    },
    {
        name: "Old School Bakery",
        formatted_address: "789 Market St, San Francisco, CA",
        place_id: "mock_3",
        rating: 3.2,
        user_ratings_total: 12,
        phone: "+1-555-0103",
    },
    {
        name: "Tony's Italian Restaurant",
        website: "http://tonys-old-site.com",
        formatted_address: "321 Food Ave, Austin, TX",
        place_id: "mock_4",
        rating: 4.1,
        user_ratings_total: 200,
        phone: "+1-555-0104",
    },
];

export class DiscoveryService {
    private apiKey: string | undefined;

    constructor() {
        this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
    }

    async search(query: string, category?: string): Promise<DiscoveryResponse> {
        const cached = await getCachedResults(query, category);
        if (cached) {
            return cached;
        }

        if (!this.apiKey) {
            console.warn("No GOOGLE_PLACES_API_KEY found. Returning mock data.");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const filtered = this.filterByCategory(MOCK_RESULTS, category);
            return { results: filtered };
        }

        try {
            console.log("DiscoveryService: Using Real Google Places API");
            const url = `https://places.googleapis.com/v1/places:searchText`;

            const categoryConfig = BUSINESS_CATEGORIES.find((c) => c.id === category);
            const requestBody: Record<string, string> = { textQuery: query };
            if (categoryConfig?.type) {
                requestBody.includedType = categoryConfig.type;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.apiKey,
                    'X-Goog-FieldMask':
                        'places.displayName,places.formattedAddress,places.websiteUri,places.id,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.types',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`Google API Error: ${response.statusText}`);
            }

            const data = await response.json();

            const results: DiscoveredBusiness[] = (data.places || []).map((place: Record<string, unknown>) => ({
                name: (place.displayName as { text?: string })?.text || 'Unknown',
                website: place.websiteUri as string | undefined,
                formatted_address: place.formattedAddress as string,
                place_id: place.id as string,
                rating: place.rating as number | undefined,
                user_ratings_total: place.userRatingCount as number | undefined,
                phone: place.nationalPhoneNumber as string | undefined,
            }));

            const discoveryResponse = { results };
            await cacheResults(query, discoveryResponse, category);

            const user = await getCurrentUser();
            if (user) {
                await logApiCall(user.id, query);
            }

            return discoveryResponse;
        } catch (error) {
            console.error('Discovery search failed:', error);
            return { results: [] };
        }
    }

    private filterByCategory(results: DiscoveredBusiness[], category?: string): DiscoveredBusiness[] {
        if (!category || category === 'all') return results;

        const categoryConfig = BUSINESS_CATEGORIES.find((c) => c.id === category);
        if (!categoryConfig) return results;

        const keywords: Record<string, string[]> = {
            restaurant: ['restaurant', 'bakery', 'cafe', 'food'],
            clinic: ['clinic', 'medical', 'health'],
            gym: ['gym', 'fitness'],
            salon: ['salon', 'beauty', 'spa'],
            dental: ['dental', 'dentist'],
            legal: ['legal', 'law', 'attorney'],
            real_estate: ['real estate', 'property'],
            auto: ['auto', 'car', 'repair'],
            plumber: ['plumber', 'plumbing'],
        };

        const terms = keywords[category] || [category];
        return results.filter((r) =>
            terms.some((t) => r.name.toLowerCase().includes(t))
        );
    }
}
