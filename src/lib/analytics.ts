'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth-session';

export interface AnalyticsData {
    overview: {
        totalLeads: number;
        totalAudits: number;
        conversionRate: number;
        potentialRevenue: number;
    };
    leadsByStatus: {
        new: number;
        auditing: number;
        audited: number;
        contacted: number;
    };
    leadsOverTime: Array<{
        date: string;
        count: number;
    }>;
    recentEvents: Array<{
        event: string;
        metadata: Record<string, unknown>;
        created_at: string;
    }>;
}

export async function getAnalytics(): Promise<{ success: boolean; data?: AnalyticsData; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const supabase = await createClient();

    // Fetch leads and events in parallel (replaces multiple serial roundtrips)
    const [leadsRes, eventsRes] = await Promise.all([
        supabase
            .from('leads')
            .select('id, status, value, created_at')
            .eq('user_id', user.id),
        supabase
            .from('events')
            .select('event, metadata, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),
    ]);

    const leads = leadsRes.data || [];
    const totalLeads = leads.length;

    const leadsByStatus = {
        new: 0,
        auditing: 0,
        audited: 0,
        contacted: 0,
    };

    let potentialRevenue = 0;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const dateMap = new Map<string, number>();
    const leadIds: string[] = [];

    // Single-pass computation for counts, revenue, and timeline
    for (const lead of leads) {
        leadIds.push(lead.id);
        const status = lead.status as keyof typeof leadsByStatus;
        if (status in leadsByStatus) {
            leadsByStatus[status]++;
        }
        potentialRevenue += lead.value || 0;

        if (lead.created_at) {
            const createdAtTime = new Date(lead.created_at).getTime();
            if (createdAtTime >= thirtyDaysAgo) {
                const date = new Date(lead.created_at).toISOString().split('T')[0];
                dateMap.set(date, (dateMap.get(date) || 0) + 1);
            }
        }
    }

    // Calculate total audits if leads exist
    let totalAudits = 0;
    if (leadIds.length > 0) {
        const { count } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .in('lead_id', leadIds);
        totalAudits = count || 0;
    }

    // Calculate conversion rate (contacted / total)
    const conversionRate = totalLeads > 0
        ? Math.round((leadsByStatus.contacted / totalLeads) * 100)
        : 0;

    const leadsOverTime: AnalyticsData['leadsOverTime'] = [];
    dateMap.forEach((count, date) => {
        leadsOverTime.push({ date, count });
    });
    leadsOverTime.sort((a, b) => a.date.localeCompare(b.date));

    return {
        success: true,
        data: {
            overview: {
                totalLeads,
                totalAudits,
                conversionRate,
                potentialRevenue,
            },
            leadsByStatus,
            leadsOverTime,
            recentEvents: eventsRes.data || [],
        },
    };
}
