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

    if (!lead.website) return { success: false, error: "Lead has no website" };

    const { error } = await supabase.from('leads').insert({
        user_id: user.id,
        business_name: lead.name,
        website_url: lead.website,
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
