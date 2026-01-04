'use server';

import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// Generate a new API key
export async function generateApiKey(name: string = 'Default Key') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    // Check if user has API access (Pro or Enterprise plan)
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .single();

    const plan = subscription?.plan || 'free';
    if (plan === 'free') {
        return { success: false, error: 'API access requires a Pro or Enterprise plan.' };
    }

    // Generate random API key
    const rawKey = `sk_live_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    // Store hashed key in database
    const { error } = await supabase.from('api_keys').insert({
        user_id: user.id,
        key_hash: keyHash,
        name,
    });

    if (error) {
        console.error('Failed to create API key:', error);
        return { success: false, error: 'Failed to create API key' };
    }

    // Return the raw key ONCE (user must save it)
    return { success: true, apiKey: rawKey };
}

// List user's API keys (without the actual keys)
export async function listApiKeys() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized', keys: [] };

    const { data: keys, error } = await supabase
        .from('api_keys')
        .select('id, name, last_used, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return { success: false, error: 'Failed to fetch API keys', keys: [] };
    }

    return { success: true, keys: keys || [] };
}

// Revoke an API key
export async function revokeApiKey(keyId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', user.id);

    if (error) {
        return { success: false, error: 'Failed to revoke API key' };
    }

    return { success: true };
}

// Validate API key (for use in API routes)
export async function validateApiKey(apiKey: string) {
    const supabase = await createClient();

    // Hash the provided key
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Find matching key
    const { data: keyRecord, error } = await supabase
        .from('api_keys')
        .select('id, user_id')
        .eq('key_hash', keyHash)
        .single();

    if (error || !keyRecord) {
        return { valid: false, userId: null };
    }

    // Update last_used timestamp
    await supabase
        .from('api_keys')
        .update({ last_used: new Date().toISOString() })
        .eq('id', keyRecord.id);

    return { valid: true, userId: keyRecord.user_id };
}
