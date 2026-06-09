-- Google Places API response cache
CREATE TABLE IF NOT EXISTS places_cache (
    query_hash text PRIMARY KEY,
    response_data jsonb NOT NULL,
    cached_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at timestamp with time zone NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_places_cache_expires ON places_cache (expires_at);

-- API cost monitoring
CREATE TABLE IF NOT EXISTS api_call_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    endpoint text NOT NULL,
    query text,
    estimated_cost numeric(10, 4) DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_call_logs_user ON api_call_logs (user_id, created_at DESC);
