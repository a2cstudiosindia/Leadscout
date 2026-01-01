"use server";

import { Scanner } from "@/lib/scanner";
import { DiscoveryService } from "@/lib/discovery/service";
import { createClient } from "@/lib/supabase/server";
import { DiscoveredBusiness } from "@/lib/discovery/types";

export async function runAudit(url: string) {
    const scanner = new Scanner();
    try {
        const report = await scanner.scan(url);
        await scanner.close();
        return { success: true, report };
    } catch (error) {
        console.error("Audit failed:", error);
        await scanner.close();
        return { success: false, error: "Failed to scan website" };
    }
}

export async function findLeads(query: string) {
    const service = new DiscoveryService();
    try {
        const result = await service.search(query);
        return { success: true, results: result.results };
    } catch (error) {
        console.error("Discovery failed:", error);
        return { success: false, error: "Failed to find leads", results: [] };
    }
}



export async function saveLead(lead: DiscoveredBusiness) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase.from('leads').insert({
        user_id: user.id,
        business_name: lead.name,
        website_url: lead.website || null, // Allow null website
        google_place_id: lead.place_id,
        status: 'new'
    });

    if (error) {
        console.error("Save lead error:", error);
        return { success: false, error: "Failed to save lead" };
    }

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

    return {
        success: true,
        stats: {
            totalLeads: leadsCount || 0,
            auditsRun: auditsCount || 0,
            potentialValue: totalValue
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
