-- Async scan job queue
CREATE TABLE IF NOT EXISTS scan_jobs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    url text NOT NULL,
    lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    result_data jsonb,
    error_message text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_scan_jobs_user_status ON scan_jobs (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_queued ON scan_jobs (status, created_at ASC) WHERE status = 'queued';

ALTER TABLE scan_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scan jobs" ON scan_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scan jobs" ON scan_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
