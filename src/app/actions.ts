"use server";

import { Scanner } from "@/lib/scanner";
import { DiscoveryService } from "@/lib/discovery/service";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth-session";
import { DiscoveredBusiness } from "@/lib/discovery/types";
import { checkLimit, incrementUsage, trackEvent, getSubscriptionInfo, getSubscription } from "@/lib/subscription";

export async function runAudit(url: string) {
    // Check usage limit
    const limitCheck = await checkLimit('audits');
    if (!limitCheck.allowed) {
        return { success: false, error: limitCheck.reason };
    }

    const scanner = new Scanner();
    try {
        const report = await scanner.scan(url);
        await scanner.close();

        // Track usage
        await incrementUsage('audits');
        await trackEvent('audit_run', { url, score: report.overallScore });

        return { success: true, report };
    } catch (error) {
        console.error("Audit failed:", error);
        await scanner.close();
        return { success: false, error: "Failed to scan website" };
    }
}

export async function findLeads(query: string) {
    // Check search limit
    const limitCheck = await checkLimit('searches');
    if (!limitCheck.allowed) {
        return { success: false, error: limitCheck.reason, results: [] };
    }

    const service = new DiscoveryService();
    try {
        const result = await service.search(query);

        // Track usage
        await incrementUsage('searches');
        await trackEvent('search_performed', { query, resultsCount: result.results.length });

        return { success: true, results: result.results };
    } catch (error) {
        console.error("Discovery failed:", error);
        return { success: false, error: "Failed to find leads", results: [] };
    }
}



export async function saveLead(lead: DiscoveredBusiness) {
    // Check usage limit
    const limitCheck = await checkLimit('leads');
    if (!limitCheck.allowed) {
        return { success: false, error: limitCheck.reason };
    }

    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();
    const { error } = await supabase.from('leads').insert({
        user_id: user.id,
        business_name: lead.name,
        website_url: lead.website || null,
        google_place_id: lead.place_id,
        phone: lead.phone || null,
        address: lead.formatted_address || null,
        status: 'new'
    });

    if (error) {
        console.error("Save lead error:", error);
        return { success: false, error: "Failed to save lead" };
    }

    // Track usage
    await incrementUsage('leads');
    await trackEvent('lead_saved', { name: lead.name, website: lead.website });

    return { success: true };
}

export async function getLeads() {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return { success: false, error: "Failed to fetch leads" };
    }

    return { success: true, leads: data };
}

export async function saveReport(leadId: string, report: any) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();
    const { error } = await supabase.from('reports').insert({
        lead_id: leadId,
        overall_score: report.overallScore,
        scan_data: report,
    });

    if (error) {
        console.error("Save report error:", error);
        return { success: false, error: "Failed to save report" };
    }

    // Update lead status to 'audited'
    await supabase.from('leads').update({ status: 'audited' }).eq('id', leadId);

    return { success: true };
}

export async function updateLead(leadId: string, updates: { status?: string; notes?: string; value?: number }) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();
    const { error } = await supabase.from('leads').update(updates).eq('id', leadId).eq('user_id', user.id);

    if (error) {
        console.error("Update lead error:", error);
        return { success: false, error: "Failed to update lead" };
    }

    return { success: true };
}

export async function deleteLead(leadIds: string | string[]) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();
    const ids = Array.isArray(leadIds) ? leadIds : [leadIds];

    const { error } = await supabase
        .from('leads')
        .delete()
        .in('id', ids)
        .eq('user_id', user.id);

    if (error) {
        console.error("Delete lead error:", error);
        return { success: false, error: "Failed to delete lead(s)" };
    }

    return { success: true, deletedCount: ids.length };
}


export async function getProfile() {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    // If no profile exists, return defaults (or empty)
    if (error && error.code !== 'PGRST116') {
        return { success: false, error: "Failed to fetch profile" };
    }

    return { success: true, profile: data };
}

export async function updateProfile(data: { agency_name: string; agency_logo_url: string }) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();
    const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        agency_name: data.agency_name,
        agency_logo_url: data.agency_logo_url,
        updated_at: new Date().toISOString(),
    });

    if (error) {
        console.error("Profile update error:", error);
        return { success: false, error: "Failed to update profile" };
    }

    return { success: true };
}

export async function getStats() {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();

    // Get total leads count
    const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    // Get total audits run (reports count for user's leads)
    const { data: userLeads } = await supabase
        .from('leads')
        .select('id')
        .eq('user_id', user.id);

    const leadIds = userLeads?.map(l => l.id) || [];

    const { count: auditsCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .in('lead_id', leadIds.length > 0 ? leadIds : ['']);

    // Get total potential value
    const { data: leads } = await supabase
        .from('leads')
        .select('value')
        .eq('user_id', user.id);

    const totalValue = leads?.reduce((sum, lead) => sum + (lead.value || 0), 0) || 0;

    // Get searches usage from subscription info
    const subscriptionInfo = await getSubscriptionInfo();
    const searchesUsed = subscriptionInfo?.usage?.searches?.current ?? 0;
    const searchesLimit = subscriptionInfo?.usage?.searches?.limit ?? 0;

    return {
        success: true,
        stats: {
            totalLeads: leadsCount || 0,
            auditsRun: auditsCount || 0,
            potentialValue: totalValue,
            searchesUsed,
            searchesLimit,
        }
    };
}

export async function uploadLogo(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();
    const file = formData.get('logo') as File;
    if (!file) return { success: false, error: "No file provided" };

    // Upload to Supabase Storage in a folder named after the user's ID
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`; // folder structure matches RLS policy

    const { error: uploadError } = await supabase.storage
        .from('agency-logos')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        return { success: false, error: "Failed to upload logo: " + uploadError.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('agency-logos')
        .getPublicUrl(filePath);

    // Update profile with new logo URL
    const { error: updateError } = await supabase.from('profiles').upsert({
        id: user.id,
        agency_logo_url: publicUrl,
        updated_at: new Date().toISOString(),
    });

    if (updateError) {
        console.error("Profile update error:", updateError);
        return { success: false, error: "Failed to update profile" };
    }

    return { success: true, logoUrl: publicUrl };
}

// Toggle favorite status for a lead (Enterprise only)
export async function toggleFavorite(leadId: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();

    // Check if user has Enterprise plan
    const subscription = await getSubscription();
    if (!subscription || subscription.plan !== 'enterprise') {
        return { success: false, error: "Favorite leads is an Enterprise feature. Please upgrade to access this." };
    }

    // Get current favorite status
    const { data: lead } = await supabase
        .from('leads')
        .select('is_favorite')
        .eq('id', leadId)
        .eq('user_id', user.id)
        .single();

    if (!lead) {
        return { success: false, error: "Lead not found" };
    }

    // Toggle the status
    const { error } = await supabase
        .from('leads')
        .update({ is_favorite: !lead.is_favorite })
        .eq('id', leadId)
        .eq('user_id', user.id);

    if (error) {
        console.error("Toggle favorite error:", error);
        return { success: false, error: "Failed to update favorite status" };
    }

    return { success: true, isFavorite: !lead.is_favorite };
}

// Export leads to Excel/CSV with complete data (Enterprise only)
export async function exportLeadsToExcel(leadIds?: string[]) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();

    // Check if user has Enterprise plan
    const subscription = await getSubscription();
    if (!subscription || subscription.plan !== 'enterprise') {
        return { success: false, error: "Excel export is an Enterprise feature. Please upgrade to access this." };
    }

    // Fetch leads
    let query = supabase
        .from('leads')
        .select('id, business_name, website_url, google_place_id, phone, address, status, notes, value, is_favorite, last_contacted_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (leadIds && leadIds.length > 0) {
        query = query.in('id', leadIds);
    }

    const { data: leads, error } = await query;

    if (error || !leads) {
        console.error("Export error:", error);
        return { success: false, error: "Failed to fetch leads" };
    }

    // Fetch reports separately for all leads
    const leadIdList = leads.map((l) => l.id);
    const { data: allReports } = await supabase
        .from('reports')
        .select('lead_id, overall_score, scan_data, created_at')
        .in('lead_id', leadIdList.length > 0 ? leadIdList : ['']);

    // Create a map of lead_id to latest report
    const reportsMap = new Map<string, { lead_id: string; overall_score: number; scan_data: any; created_at: string }>();
    if (allReports) {
        allReports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        for (const report of allReports) {
            if (!reportsMap.has(report.lead_id)) {
                reportsMap.set(report.lead_id, report);
            }
        }
    }

    console.log(`Export: Found ${leads.length} leads, ${allReports?.length || 0} reports`);

    // Convert to Excel format
    const XLSX = await import('xlsx');

    const exportData = leads.map((lead) => {
        const latestReport = reportsMap.get(lead.id);
        const scanData = latestReport?.scan_data || {};
        const checks = scanData.checks || {};

        // Extract individual scores
        const securityScore = checks.security?.score ?? '';
        const mobileScore = checks.mobile?.score ?? '';
        const performanceScore = checks.performance?.score ?? '';
        const seoScore = checks.seo?.score ?? '';
        const businessScore = checks.business?.score ?? '';
        const contentScore = checks.content?.score ?? '';
        const socialScore = checks.social?.score ?? '';

        // Count by status
        const allChecksArray = Object.values(checks) as Array<{ status?: string }>;
        const passCount = allChecksArray.filter(c => c?.status === 'pass').length;
        const failCount = allChecksArray.filter(c => c?.status === 'fail').length;
        const warningCount = allChecksArray.filter(c => c?.status === 'warning').length;

        return {
            'Business Name': lead.business_name || '',
            'Website URL': lead.website_url || '',
            'Phone': lead.phone || '',
            'Address': lead.address || '',
            'Google Place ID': lead.google_place_id || '',
            'Status': lead.status || 'new',
            'Notes': lead.notes || '',
            'Estimated Value': lead.value ? `$${lead.value}` : '',
            'Favorite': lead.is_favorite ? 'Yes' : 'No',
            'Last Contacted': lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleDateString() : '',
            'Lead Created': new Date(lead.created_at).toLocaleDateString(),
            'Overall Score': latestReport?.overall_score ?? '',
            'Security Score': securityScore,
            'Mobile Score': mobileScore,
            'Performance Score': performanceScore,
            'SEO Score': seoScore,
            'Business Info Score': businessScore,
            'Content Score': contentScore,
            'Social Score': socialScore,
            'Checks Passed': passCount,
            'Checks Failed': failCount,
            'Checks Warning': warningCount,
            'Audit Date': latestReport?.created_at ? new Date(latestReport.created_at).toLocaleDateString() : '',
            'Website Scanned': scanData.url || '',
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    worksheet['!cols'] = [
        { wch: 25 }, { wch: 35 }, { wch: 15 }, { wch: 40 }, { wch: 30 },
        { wch: 12 }, { wch: 40 }, { wch: 15 }, { wch: 10 }, { wch: 14 },
        { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 35 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

    const buffer = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

    await trackEvent('leads_exported', { count: leads.length, includesReports: true });

    return {
        success: true,
        data: buffer,
        filename: `leadscout_export_${new Date().toISOString().split('T')[0]}.xlsx`,
        count: leads.length
    };
}
