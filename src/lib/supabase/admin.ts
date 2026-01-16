import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client with service role key for server-side admin operations.
 * This bypasses RLS - use only for trusted server-side code.
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
        console.error('[SUPABASE] SUPABASE_SERVICE_ROLE_KEY is not set!');
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
    }

    return createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
