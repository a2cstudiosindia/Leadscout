import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client for server-side database operations.
 * Auth is handled by Better Auth — this client is only for database queries.
 * Uses the anon key by default. All calls are already guarded by Better Auth
 * session checks (getCurrentUser()) in the calling code.
 */
export async function createClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )
}
