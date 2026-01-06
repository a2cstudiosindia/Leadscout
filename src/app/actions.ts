"use server";

import { Scanner } from "@/lib/scanner";
import { DiscoveryService } from "@/lib/discovery/service";
import { createClient } from "@/lib/supabase/server";
import { DiscoveredBusiness } from "@/lib/discovery/types";
import { checkLimit, incrementUsage, trackEvent, getSubscriptionInfo } from "@/lib/subscription";

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

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });

    if (error) {
        return { success: false, error: "Failed to fetch leads" };
    }

    return { success: true, leads: data };
}

export async function saveReport(leadId: string, report: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase.from('leads').update(updates).eq('id', leadId).eq('user_id', user.id);

    if (error) {
        console.error("Update lead error:", error);
        return { success: false, error: "Failed to update lead" };
    }

    return { success: true };
}

export async function deleteLead(leadIds: string | string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    // If no profile exists, return defaults (or empty)
    if (error && error.code !== 'PGRST116') {
        return { success: false, error: "Failed to fetch profile" };
    }

    return { success: true, profile: data };
}

export async function updateProfile(data: { agency_name: string; agency_logo_url: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    // Check if user has Enterprise plan
    const subscription = await getSubscription();
    if (!subscription || subscription.plan !== 'enterprise') {
        return { success: false, error: "Excel export is an Enterprise feature. Please upgrade to access this." };
    }

    // Fetch leads with their latest reports using a join
    let query = supabase
        .from('leads')
        .select(`
            id,
            business_name,
            website_url,
            google_place_id,
            phone,
            address,
            status,
            notes,
            value,
            is_favorite,
            last_contacted_at,
            created_at,
            reports (
                overall_score,
                scan_data,
                created_at
            )
        `)
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

    // Convert to Excel format using xlsx
    const XLSX = await import('xlsx');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exportData = leads.map((lead: any) => {
        // Get the latest report if exists
        const latestReport = lead.reports?.sort((a: { created_at: string }, b: { created_at: string }) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        const scanData = latestReport?.scan_data || {};

        // Extract individual scores from scan_data
        const performanceScore = scanData.categories?.performance?.score ?? '';
        const seoScore = scanData.categories?.seo?.score ?? '';
        const accessibilityScore = scanData.categories?.accessibility?.score ?? '';
        const bestPracticesScore = scanData.categories?.['best-practices']?.score ?? '';

        // Count issues
        const issuesCount = scanData.issues?.length || 0;
        const criticalIssues = scanData.issues?.filter((i: { severity: string }) => i.severity === 'critical')?.length || 0;
        const warningIssues = scanData.issues?.filter((i: { severity: string }) => i.severity === 'warning')?.length || 0;

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
            // Audit Report Data
            'Overall Score': latestReport?.overall_score ?? '',
            'Performance Score': performanceScore ? Math.round(performanceScore * 100) : '',
            'SEO Score': seoScore ? Math.round(seoScore * 100) : '',
            'Accessibility Score': accessibilityScore ? Math.round(accessibilityScore * 100) : '',
            'Best Practices Score': bestPracticesScore ? Math.round(bestPracticesScore * 100) : '',
            'Total Issues': issuesCount,
            'Critical Issues': criticalIssues,
            'Warning Issues': warningIssues,
            'Audit Date': latestReport?.created_at ? new Date(latestReport.created_at).toLocaleDateString() : '',
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths for better readability
    worksheet['!cols'] = [
        { wch: 25 }, // Business Name
        { wch: 35 }, // Website URL
        { wch: 15 }, // Phone
        { wch: 40 }, // Address
        { wch: 30 }, // Google Place ID
        { wch: 12 }, // Status
        { wch: 40 }, // Notes
        { wch: 15 }, // Estimated Value
        { wch: 10 }, // Favorite
        { wch: 14 }, // Last Contacted
        { wch: 14 }, // Lead Created
        { wch: 12 }, // Overall Score
        { wch: 15 }, // Performance
        { wch: 10 }, // SEO
        { wch: 15 }, // Accessibility
        { wch: 15 }, // Best Practices
        { wch: 12 }, // Total Issues
        { wch: 14 }, // Critical Issues
        { wch: 14 }, // Warning Issues
        { wch: 12 }, // Audit Date
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

    await trackEvent('leads_exported', { count: leads.length, includesReports: true });

    return {
        success: true,
        data: buffer,
        filename: `leadscout_export_${new Date().toISOString().split('T')[0]}.xlsx`,
        count: leads.length
    };
}

// Helper to check Enterprise features
import { getSubscription } from "@/lib/subscription";
