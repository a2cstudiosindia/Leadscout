'use server';

import { createClient } from '@/lib/supabase/server';

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    // Get total leads
    const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    // Get leads by status
    const { data: leads } = await supabase
        .from('leads')
        .select('status, value')
        .eq('user_id', user.id);

    const leadsByStatus = {
        new: 0,
        auditing: 0,
        audited: 0,
        contacted: 0,
    };

    let potentialRevenue = 0;
    leads?.forEach((lead) => {
        const status = lead.status as keyof typeof leadsByStatus;
        if (status in leadsByStatus) {
            leadsByStatus[status]++;
        }
        potentialRevenue += lead.value || 0;
    });

    // Get total audits (reports count)
    const { data: userLeadIds } = await supabase
        .from('leads')
        .select('id')
        .eq('user_id', user.id);

    const leadIds = userLeadIds?.map(l => l.id) || [];

    const { count: totalAudits } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .in('lead_id', leadIds.length > 0 ? leadIds : ['']);

    // Calculate conversion rate (contacted / total)
    const conversionRate = totalLeads && totalLeads > 0
        ? Math.round((leadsByStatus.contacted / totalLeads) * 100)
        : 0;

    // Get leads over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentLeads } = await supabase
        .from('leads')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

    // Group by date
    const leadsOverTime: AnalyticsData['leadsOverTime'] = [];
    const dateMap = new Map<string, number>();

    recentLeads?.forEach((lead) => {
        const date = new Date(lead.created_at).toISOString().split('T')[0];
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    dateMap.forEach((count, date) => {
        leadsOverTime.push({ date, count });
    });

    // Get recent events
    const { data: events } = await supabase
        .from('events')
        .select('event, metadata, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

    return {
        success: true,
        data: {
            overview: {
                totalLeads: totalLeads || 0,
                totalAudits: totalAudits || 0,
                conversionRate,
                potentialRevenue,
            },
            leadsByStatus,
            leadsOverTime,
            recentEvents: events || [],
        },
    };
}
