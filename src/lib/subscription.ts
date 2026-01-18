'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/auth-session';
import { PLANS, type PlanType, getCurrentPeriod } from '@/lib/plans';

// TEST MODE: Set TEST_MODE_PLAN in .env to override subscription for testing
// Valid values: 'pro' or 'enterprise'
// Example: TEST_MODE_PLAN=enterprise

// Get user's subscription
export async function getSubscription() {
    const user = await getCurrentUser();
    if (!user) return null;

    // TEST MODE: Override subscription for testing Pro/Enterprise features
    const testModePlan = process.env.TEST_MODE_PLAN as PlanType | undefined;
    if (testModePlan && (testModePlan === 'pro' || testModePlan === 'enterprise')) {
        console.log(`[SUBSCRIPTION] 🧪 TEST MODE: Using ${testModePlan} plan`);
        return {
            plan: testModePlan,
            limits: PLANS[testModePlan],
        };
    }

    const supabase = createAdminClient();
    const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('[SUBSCRIPTION] Error fetching subscription:', error);
    }

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

// Get current usage (uses admin client to bypass RLS)
export async function getUsage() {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = createAdminClient();
    const period = getCurrentPeriod();

    const { data: usage, error } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', period)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('[USAGE] Error fetching usage:', error);
    }

    return {
        period,
        leads: usage?.leads_count ?? 0,
        audits: usage?.audits_count ?? 0,
        searches: usage?.searches_count ?? 0,
        apiCalls: usage?.api_calls ?? 0,
    };
}

// Check if user can perform action
export async function checkLimit(action: 'leads' | 'audits' | 'searches' | 'api') {
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
        case 'searches':
            if (usage.searches >= limits.searches) {
                return {
                    allowed: false,
                    reason: `You've reached your limit of ${limits.searches} searches this month. Upgrade for more!`,
                    current: usage.searches,
                    limit: limits.searches,
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

// Increment usage counter (uses admin client to bypass RLS)
export async function incrementUsage(action: 'leads' | 'audits' | 'searches' | 'api') {
    const user = await getCurrentUser();
    if (!user) {
        console.error('[USAGE] No user found for incrementUsage');
        return;
    }

    const supabase = createAdminClient();
    const period = getCurrentPeriod();

    // Map action to column name
    const column = action === 'leads' ? 'leads_count'
        : action === 'audits' ? 'audits_count'
            : action === 'searches' ? 'searches_count'
                : 'api_calls';

    console.log(`[USAGE] Incrementing ${action} for user ${user.id}, period ${period}`);

    // First try to get existing record
    const { data: existing, error: selectError } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', period)
        .single();

    if (selectError && selectError.code !== 'PGRST116') {
        console.error('[USAGE] Error fetching usage record:', selectError);
    }

    if (existing) {
        // Update existing record
        const newValue = (existing[column] ?? 0) + 1;
        const { error: updateError } = await supabase
            .from('usage')
            .update({ [column]: newValue })
            .eq('id', existing.id);

        if (updateError) {
            console.error('[USAGE] Error updating usage:', updateError);
        } else {
            console.log(`[USAGE] Updated ${action} to ${newValue}`);
        }
    } else {
        // Insert new record
        const { error: insertError } = await supabase
            .from('usage')
            .insert({
                user_id: user.id,
                period,
                [column]: 1,
            });

        if (insertError) {
            console.error('[USAGE] Error inserting usage:', insertError);
        } else {
            console.log(`[USAGE] Created new usage record for ${action}`);
        }
    }
}

// Track analytics event (uses admin client to bypass RLS)
export async function trackEvent(event: string, metadata?: Record<string, unknown>) {
    const user = await getCurrentUser();
    if (!user) return;

    const supabase = createAdminClient();
    const { error } = await supabase.from('events').insert({
        user_id: user.id,
        event,
        metadata: metadata ?? {},
    });

    if (error) {
        console.error('[EVENTS] Error tracking event:', error);
    }
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
            searches: { current: usage.searches, limit: subscription.limits.searches },
        },
        features: {
            apiAccess: subscription.limits.apiAccess,
            pdfExport: subscription.limits.pdfExport,
        },
    };
}

// Update subscription from Polar webhook
export async function updateSubscriptionFromPolar(
    userId: string,
    plan: PlanType,
    polarSubscriptionId: string,
    polarCustomerId?: string
) {
    const supabase = createAdminClient();

    // Calculate period end (30 days from now)
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { error } = await supabase
        .from('subscriptions')
        .upsert({
            user_id: userId,
            plan: plan,
            polar_subscription_id: polarSubscriptionId,
            polar_customer_id: polarCustomerId,
            current_period_end: periodEnd.toISOString(),
        }, { onConflict: 'user_id' });

    if (error) {
        console.error('[SUBSCRIPTION] Error updating subscription from Polar:', error);
    }
}

// Cancel subscription from Polar webhook
export async function cancelSubscriptionFromPolar(userId: string) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('subscriptions')
        .update({ plan: 'free' })
        .eq('user_id', userId);

    if (error) {
        console.error('[SUBSCRIPTION] Error canceling subscription from Polar:', error);
    }
}

