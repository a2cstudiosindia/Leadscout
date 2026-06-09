import { createHash } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { DiscoveryResponse } from './types';

const CACHE_TTL_HOURS = 24;

function hashQuery(query: string, category?: string): string {
    return createHash('sha256').update(`${query.toLowerCase().trim()}|${category || 'all'}`).digest('hex');
}

export async function getCachedResults(query: string, category?: string): Promise<DiscoveryResponse | null> {
    try {
        const supabase = createAdminClient();
        const queryHash = hashQuery(query, category);

        const { data } = await supabase
            .from('places_cache')
            .select('response_data, expires_at')
            .eq('query_hash', queryHash)
            .single();

        if (!data || new Date(data.expires_at) < new Date()) {
            return null;
        }

        console.log('[PLACES-CACHE] Cache hit for query:', query);
        return data.response_data as DiscoveryResponse;
    } catch {
        return null;
    }
}

export async function cacheResults(query: string, data: DiscoveryResponse, category?: string): Promise<void> {
    try {
        const supabase = createAdminClient();
        const queryHash = hashQuery(query, category);
        const now = new Date();
        const expiresAt = new Date(now.getTime() + CACHE_TTL_HOURS * 60 * 60 * 1000);

        await supabase.from('places_cache').upsert({
            query_hash: queryHash,
            response_data: data,
            cached_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
        });
    } catch (error) {
        console.error('[PLACES-CACHE] Failed to cache results:', error);
    }
}

export async function logApiCall(userId: string, query: string, cost: number = 0.032): Promise<void> {
    try {
        const supabase = createAdminClient();
        await supabase.from('api_call_logs').insert({
            user_id: userId,
            endpoint: 'places_search',
            query,
            estimated_cost: cost,
        });
    } catch {
        // Non-critical logging
    }
}
