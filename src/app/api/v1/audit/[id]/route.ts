import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, ApiContext } from '@/lib/api-middleware';
import { createClient } from '@/lib/supabase/server';

// GET /api/v1/audit/[id] - Get audit report
export const GET = withApiAuth(async (req: NextRequest, context: ApiContext, params: { params: { id: string } }) => {
    const supabase = await createClient();
    const { id } = await params.params;

    const { data: report, error } = await supabase
        .from('reports')
        .select(`
            *,
            leads (
                user_id
            )
        `)
        .eq('id', id)
        .single();

    if (error || !report) {
        return NextResponse.json(
            { error: 'Report not found' },
            { status: 404 }
        );
    }

    // Verify ownership via related lead
    if (report.leads.user_id !== context.userId) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 403 }
        );
    }

    // Clean up response (remove user_id check wrapper)
    const { leads, ...cleanReport } = report;

    return NextResponse.json({
        success: true,
        data: cleanReport,
    });
}, { action: 'api' });
