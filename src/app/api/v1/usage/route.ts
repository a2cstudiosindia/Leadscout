import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, ApiContext } from '@/lib/api-middleware';
import { getSubscriptionInfo } from '@/lib/subscription';

// GET /api/v1/usage - Get usage stats
export const GET = withApiAuth(async (req: NextRequest, context: ApiContext) => {
    // Note: Usage stats are fetched based on the mocked auth user in getSubscriptionInfo
    // For API calls, this works if implementation uses supabase getSession/getUser under hood
    // But getSubscriptionInfo relies on auth.getUser().

    // However, since this is an API call with an API key, we might need to mock the user context
    // or manually query the usage table. Let's do a manual query to be robust.

    const { createClient } = require('@/lib/supabase/server');
    const supabase = await createClient();
    const { getCurrentPeriod } = require('@/lib/plans');
    const period = getCurrentPeriod();

    const { data: usage } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', context.userId)
        .eq('period', period)
        .single();

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', context.userId)
        .single();

    const { PLANS } = require('@/lib/plans');
    const plan = subscription?.plan || 'free';
    const limits = PLANS[plan];

    return NextResponse.json({
        success: true,
        data: {
            plan,
            period,
            usage: {
                api_calls: {
                    current: usage?.api_calls || 0,
                    limit: limits.api || 0
                },
                leads: {
                    current: usage?.leads_count || 0,
                    limit: limits.leads
                },
                audits: {
                    current: usage?.audits_count || 0,
                    limit: limits.audits
                },
                searches: {
                    current: usage?.searches_count || 0,
                    limit: limits.searches
                }
            }
        }
    });

}, { action: 'api' });
