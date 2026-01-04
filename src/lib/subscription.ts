'use server';

import { createClient } from '@/lib/supabase/server';
import { PLANS, type PlanType, getCurrentPeriod } from '@/lib/plans';


// Get user's subscription
export async function getSubscription() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

    // Return free plan if no subscription exists
    if (!subscription) {
        return {
            plan: 'free' as PlanType,
            limits: PLANS.free,
        };
    }

    return {
        plan: subscription.plan as PlanType,
        limits: PLANS[subscription.plan as PlanType],
        stripeCustomerId: subscription.stripe_customer_id,
        stripeSubscriptionId: subscription.stripe_subscription_id,
        currentPeriodEnd: subscription.current_period_end,
    };
}

// Get current usage
export async function getUsage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const period = getCurrentPeriod();

    const { data: usage } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', period)
        .single();

    return {
        period,
        leads: usage?.leads_count ?? 0,
        audits: usage?.audits_count ?? 0,
        apiCalls: usage?.api_calls ?? 0,
    };
}

// Check if user can perform action
export async function checkLimit(action: 'leads' | 'audits' | 'api') {
    const subscription = await getSubscription();
    const usage = await getUsage();

    if (!subscription || !usage) {
        return { allowed: false, reason: 'Not authenticated' };
    }

    const limits = subscription.limits;

    switch (action) {
        case 'leads':
            if (usage.leads >= limits.leads) {
                return {
                    allowed: false,
                    reason: `You've reached your limit of ${limits.leads} leads this month. Upgrade to Pro for more!`,
                    current: usage.leads,
                    limit: limits.leads,
                };
            }
            break;
        case 'audits':
            if (usage.audits >= limits.audits) {
                return {
                    allowed: false,
                    reason: `You've reached your limit of ${limits.audits} audits this month. Upgrade to Pro for more!`,
                    current: usage.audits,
                    limit: limits.audits,
                };
            }
            break;
        case 'api':
            if (!limits.apiAccess) {
                return {
                    allowed: false,
                    reason: 'API access requires a Pro or Enterprise plan.',
                };
            }
            break;
    }

    return { allowed: true };
}

// Increment usage counter
export async function incrementUsage(action: 'leads' | 'audits' | 'api') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const period = getCurrentPeriod();

    // Upsert usage record
    const column = action === 'leads' ? 'leads_count'
        : action === 'audits' ? 'audits_count'
            : 'api_calls';

    // First try to get existing record
    const { data: existing } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', period)
        .single();

    if (existing) {
        // Update existing
        await supabase
            .from('usage')
            .update({ [column]: (existing[column] ?? 0) + 1 })
            .eq('id', existing.id);
    } else {
        // Insert new
        await supabase
            .from('usage')
            .insert({
                user_id: user.id,
                period,
                [column]: 1,
            });
    }
}

// Track analytics event
export async function trackEvent(event: string, metadata?: Record<string, unknown>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from('events').insert({
        user_id: user.id,
        event,
        metadata: metadata ?? {},
    });
}

// Get subscription info for display
export async function getSubscriptionInfo() {
    const subscription = await getSubscription();
    const usage = await getUsage();

    if (!subscription || !usage) {
        return null;
    }

    return {
        plan: subscription.plan,
        planName: subscription.limits.name,
        usage: {
            leads: { current: usage.leads, limit: subscription.limits.leads },
            audits: { current: usage.audits, limit: subscription.limits.audits },
        },
        features: {
            apiAccess: subscription.limits.apiAccess,
            pdfExport: subscription.limits.pdfExport,
        },
    };
}
