"use server";

import { getCurrentUser } from "@/lib/auth-session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PipelineStage, ClientStatus, BillingType, ExchangeCategory, DealType } from "@/lib/database.types";
import crypto from "crypto";

// ============================================================
// 1. PIPELINE & DEAL ACTIONS
// ============================================================

export async function updateLeadPipelineStage(
    leadId: string,
    pipeline_stage: PipelineStage,
    extra?: { win_probability?: number; expected_close_date?: string }
) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();
    const updatePayload: Record<string, any> = { pipeline_stage };
    if (extra?.win_probability !== undefined) updatePayload.win_probability = extra.win_probability;
    if (extra?.expected_close_date !== undefined) updatePayload.expected_close_date = extra.expected_close_date;

    const { error } = await supabase
        .from('leads')
        .update(updatePayload)
        .eq('id', leadId)
        .eq('user_id', user.id);

    if (error) {
        console.error("Update pipeline stage error:", error);
        return { success: false, error: "Failed to update pipeline stage" };
    }

    // Log activity
    await logActivity({
        lead_id: leadId,
        type: 'stage_change',
        title: `Pipeline Stage Updated to "${pipeline_stage.replace('_', ' ').toUpperCase()}"`,
        description: `Lead moved to ${pipeline_stage} stage`,
    });

    return { success: true };
}

export async function updateLeadContact(
    leadId: string,
    contactData: {
        contact_name?: string;
        contact_email?: string;
        contact_role?: string;
        linkedin_url?: string;
    }
) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();
    const { error } = await supabase
        .from('leads')
        .update(contactData)
        .eq('id', leadId)
        .eq('user_id', user.id);

    if (error) {
        console.error("Update lead contact error:", error);
        return { success: false, error: "Failed to update contact info" };
    }

    return { success: true };
}

// ============================================================
// 2. CLIENT MANAGEMENT ACTIONS (ACTIVE CLIENTS HUB)
// ============================================================

export async function getClients() {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized", clients: [] };

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Failed to fetch clients:", error);
        return { success: false, error: "Failed to fetch clients", clients: [] };
    }

    return { success: true, clients: data || [] };
}

export async function createClientAccount(data: {
    company_name: string;
    website_url?: string;
    primary_contact_name?: string;
    primary_contact_email?: string;
    primary_contact_phone?: string;
    billing_type?: BillingType;
    monthly_value?: number;
    contract_start_date?: string;
    contract_renewal_date?: string;
    notes?: string;
    status?: ClientStatus;
    lead_id?: string;
}) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();
    const { data: newClient, error } = await supabase
        .from('clients')
        .insert({
            user_id: user.id,
            company_name: data.company_name,
            website_url: data.website_url || null,
            primary_contact_name: data.primary_contact_name || null,
            primary_contact_email: data.primary_contact_email || null,
            primary_contact_phone: data.primary_contact_phone || null,
            billing_type: data.billing_type || 'monthly_retainer',
            monthly_value: data.monthly_value || 0,
            contract_start_date: data.contract_start_date || null,
            contract_renewal_date: data.contract_renewal_date || null,
            notes: data.notes || null,
            status: data.status || 'active',
            lead_id: data.lead_id || null,
        })
        .select()
        .single();

    if (error) {
        console.error("Create client error:", error);
        return { success: false, error: "Failed to create client" };
    }

    // Log activity
    await logActivity({
        client_id: newClient.id,
        type: 'client_created',
        title: `Client Account Created`,
        description: `Added ${data.company_name} to active clients`,
    });

    return { success: true, client: newClient };
}

export async function updateClientAccount(
    clientId: string,
    updates: {
        company_name?: string;
        website_url?: string;
        primary_contact_name?: string;
        primary_contact_email?: string;
        primary_contact_phone?: string;
        billing_type?: BillingType;
        monthly_value?: number;
        contract_start_date?: string;
        contract_renewal_date?: string;
        notes?: string;
        status?: ClientStatus;
    }
) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();
    const { error } = await supabase
        .from('clients')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', clientId)
        .eq('user_id', user.id);

    if (error) {
        console.error("Update client error:", error);
        return { success: false, error: "Failed to update client" };
    }

    return { success: true };
}

export async function deleteClientAccount(clientId: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();
    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', user.id);

    if (error) {
        console.error("Delete client error:", error);
        return { success: false, error: "Failed to delete client" };
    }

    return { success: true };
}

export async function convertLeadToClient(
    leadId: string,
    clientData?: {
        billing_type?: BillingType;
        monthly_value?: number;
        contract_start_date?: string;
        contract_renewal_date?: string;
        notes?: string;
    }
) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();

    // 1. Fetch Lead Data
    const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .eq('user_id', user.id)
        .single();

    if (leadError || !lead) {
        return { success: false, error: "Lead not found" };
    }

    // 2. Mark lead stage as closed_won
    await supabase
        .from('leads')
        .update({ pipeline_stage: 'closed_won', win_probability: 100 })
        .eq('id', leadId);

    // 3. Create client record
    const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
            user_id: user.id,
            lead_id: lead.id,
            company_name: lead.business_name,
            website_url: lead.website_url,
            primary_contact_name: lead.contact_name || null,
            primary_contact_email: lead.contact_email || null,
            primary_contact_phone: lead.phone || null,
            status: 'active',
            billing_type: clientData?.billing_type || 'monthly_retainer',
            monthly_value: clientData?.monthly_value ?? lead.value ?? 0,
            contract_start_date: clientData?.contract_start_date || new Date().toISOString().split('T')[0],
            contract_renewal_date: clientData?.contract_renewal_date || null,
            notes: clientData?.notes || lead.notes || null,
        })
        .select()
        .single();

    if (clientError) {
        console.error("Convert to client error:", clientError);
        return { success: false, error: "Failed to convert lead to client" };
    }

    // 4. Log activities
    await logActivity({
        lead_id: leadId,
        client_id: newClient.id,
        type: 'client_converted',
        title: `Won Deal: Converted to Client`,
        description: `Successfully closed deal and moved ${lead.business_name} to Active Clients Hub ($${newClient.monthly_value}/mo)`,
    });

    return { success: true, client: newClient };
}

// ============================================================
// 3. ACTIVITIES STREAM
// ============================================================

export async function logActivity(data: {
    lead_id?: string;
    client_id?: string;
    type: string;
    title: string;
    description?: string;
    metadata?: any;
}) {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    const supabase = await createClient();
    await supabase.from('activities').insert({
        user_id: user.id,
        lead_id: data.lead_id || null,
        client_id: data.client_id || null,
        type: data.type,
        title: data.title,
        description: data.description || null,
        metadata: data.metadata || {},
    });

    return { success: true };
}

export async function getActivities(targetId: string, targetType: 'lead' | 'client') {
    const user = await getCurrentUser();
    if (!user) return { success: false, activities: [] };

    const supabase = await createClient();
    let query = supabase.from('activities').select('*').eq('user_id', user.id);

    if (targetType === 'lead') {
        query = query.eq('lead_id', targetId);
    } else {
        query = query.eq('client_id', targetId);
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(20);

    if (error) {
        return { success: false, activities: [] };
    }

    return { success: true, activities: data || [] };
}

// ============================================================
// 4. SHAREABLE INTERACTIVE WEB AUDIT VIEWER
// ============================================================

export async function generateShareableReport(reportId: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();

    // Check if report belongs to user's lead
    const { data: report, error: reportErr } = await supabase
        .from('reports')
        .select('id, lead_id, overall_score, scan_data, leads(business_name, user_id)')
        .eq('id', reportId)
        .single();

    if (reportErr || !report) {
        return { success: false, error: "Report not found" };
    }

    // Check if shareable report already exists
    const { data: existing } = await supabase
        .from('shareable_reports')
        .select('*')
        .eq('report_id', reportId)
        .single();

    if (existing) {
        return {
            success: true,
            slug: existing.slug,
            url: `/report/${existing.slug}`,
            viewsCount: existing.views_count,
            ctaClicks: existing.cta_clicks,
        };
    }

    // Generate unique slug
    const randomHex = crypto.randomBytes(4).toString('hex');
    const leadName = (report as any).leads?.business_name
        ? (report as any).leads.business_name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)
        : 'audit';
    const slug = `${leadName}-${randomHex}`;

    const { data: created, error: createErr } = await supabase
        .from('shareable_reports')
        .insert({
            report_id: reportId,
            slug,
            views_count: 0,
            cta_clicks: 0,
            is_active: true,
        })
        .select()
        .single();

    if (createErr || !created) {
        console.error("Create shareable report error:", createErr);
        return { success: false, error: "Failed to generate public report link" };
    }

    return {
        success: true,
        slug: created.slug,
        url: `/report/${created.slug}`,
        viewsCount: 0,
        ctaClicks: 0,
    };
}

export async function getPublicShareableReport(slug: string) {
    // Note: Public action, uses admin client to safely query published report data
    const supabase = createAdminClient();

    const { data: shareable, error: shareErr } = await supabase
        .from('shareable_reports')
        .select(`
            id,
            slug,
            views_count,
            cta_clicks,
            is_active,
            created_at,
            reports (
                id,
                overall_score,
                scan_data,
                created_at,
                leads (
                    id,
                    user_id,
                    business_name,
                    website_url,
                    address,
                    phone
                )
            )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (shareErr || !shareable) {
        return { success: false, error: "Report not found or has expired" };
    }

    const report = shareable.reports as any;
    const lead = report?.leads;
    const userId = lead?.user_id;

    // Fetch agency profile for white-label branding
    let agencyProfile = null;
    if (userId) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('agency_name, agency_logo_url, calendar_link')
            .eq('id', userId)
            .single();

        agencyProfile = profile;
    }

    return {
        success: true,
        report: {
            slug: shareable.slug,
            businessName: lead?.business_name || 'Website Audit',
            websiteUrl: lead?.website_url || '',
            overallScore: report?.overall_score || 0,
            scanData: report?.scan_data || {},
            createdAt: report?.created_at,
            agency: {
                name: agencyProfile?.agency_name || "Digital Solutions",
                logoUrl: agencyProfile?.agency_logo_url || null,
                calendarLink: agencyProfile?.calendar_link || null,
            }
        }
    };
}

export async function trackPublicReportView(slug: string) {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from('shareable_reports')
        .select('views_count')
        .eq('slug', slug)
        .single();

    if (data) {
        await supabase
            .from('shareable_reports')
            .update({
                views_count: (data.views_count || 0) + 1,
                last_viewed_at: new Date().toISOString(),
            })
            .eq('slug', slug);
    }
    return { success: true };
}

export async function trackPublicReportCtaClick(slug: string) {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from('shareable_reports')
        .select('cta_clicks')
        .eq('slug', slug)
        .single();

    if (data) {
        await supabase
            .from('shareable_reports')
            .update({
                cta_clicks: (data.cta_clicks || 0) + 1,
            })
            .eq('slug', slug);
    }
    return { success: true };
}

// ============================================================
// 5. B2B CLIENT & DEAL EXCHANGE NETWORK
// ============================================================

export async function getExchangeListings(category?: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized", listings: [] };

    const supabase = await createClient();
    let query = supabase
        .from('exchange_listings')
        .select('*')
        .order('created_at', { ascending: false });

    if (category && category !== 'all') {
        query = query.eq('category', category as ExchangeCategory);
    }

    const { data, error } = await query;
    if (error) {
        console.error("Get exchange listings error:", error);
        return { success: false, error: "Failed to fetch listings", listings: [] };
    }

    return { success: true, listings: data || [] };
}

export async function createExchangeListing(data: {
    title: string;
    category: ExchangeCategory;
    description: string;
    budget_range?: string;
    location?: string;
    deal_type?: DealType;
    bounty_amount?: number;
    commission_percentage?: number;
    contact_email?: string;
}) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();
    const { data: created, error } = await supabase
        .from('exchange_listings')
        .insert({
            creator_id: user.id,
            title: data.title,
            category: data.category,
            description: data.description,
            budget_range: data.budget_range || null,
            location: data.location || null,
            deal_type: data.deal_type || 'referral_commission',
            bounty_amount: data.bounty_amount || null,
            commission_percentage: data.commission_percentage || null,
            contact_email: data.contact_email || user.email || null,
            status: 'open',
        })
        .select()
        .single();

    if (error) {
        console.error("Create listing error:", error);
        return { success: false, error: "Failed to post listing" };
    }

    return { success: true, listing: created };
}

export async function claimExchangeListing(listingId: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();
    const { data: listing, error: fetchErr } = await supabase
        .from('exchange_listings')
        .select('*')
        .eq('id', listingId)
        .single();

    if (fetchErr || !listing) {
        return { success: false, error: "Listing not found" };
    }

    if (listing.creator_id === user.id) {
        return { success: false, error: "You cannot claim your own listing" };
    }

    if (listing.status !== 'open') {
        return { success: false, error: "Listing has already been claimed" };
    }

    const { error: updateErr } = await supabase
        .from('exchange_listings')
        .update({
            status: 'claimed',
            claimed_by: user.id,
        })
        .eq('id', listingId);

    if (updateErr) {
        return { success: false, error: "Failed to claim listing" };
    }

    return {
        success: true,
        contactEmail: listing.contact_email,
        title: listing.title,
    };
}
