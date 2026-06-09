import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, ApiContext } from '@/lib/api-middleware';
import { createClient } from '@/lib/supabase/server';
import { generatePDFBuffer } from '@/lib/pdf-generator';
import { trackEvent } from '@/lib/subscription';
import { ScanReport } from '@/lib/scanner/types';

export const POST = withApiAuth(async (
    _req: NextRequest,
    context: ApiContext,
    routeContext: { params: Promise<{ leadId: string }> }
) => {
    const { leadId } = await routeContext.params;

    if (!leadId) {
        return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: lead } = await supabase
        .from('leads')
        .select('id, business_name')
        .eq('id', leadId)
        .eq('user_id', context.userId)
        .single();

    if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const { data: report } = await supabase
        .from('reports')
        .select('scan_data, overall_score')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (!report?.scan_data) {
        return NextResponse.json({ error: 'No audit report found for this lead' }, { status: 404 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('agency_name, agency_logo_url')
        .eq('id', context.userId)
        .single();

    const pdfBuffer = generatePDFBuffer(report.scan_data as ScanReport, {
        name: profile?.agency_name || undefined,
        logoUrl: profile?.agency_logo_url || undefined,
    });

    await trackEvent('pdf_report_generated', { leadId, businessName: lead.business_name });

    return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="audit_${lead.business_name?.replace(/[^a-z0-9]/gi, '_') || leadId}.pdf"`,
        },
    });
}, { action: 'api' });
