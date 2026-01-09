import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, ApiContext } from '@/lib/api-middleware';
import { createClient } from '@/lib/supabase/server';

// POST /api/v1/leads/[id]/favorite - Toggle favorite (Enterprise only)
export const POST = withApiAuth(async (req: NextRequest, context: ApiContext, params: { params: { id: string } }) => {
    const supabase = await createClient();
    const { id } = await params.params;

    // Get current status
    const { data: lead, error: fetchError } = await supabase
        .from('leads')
        .select('is_favorite')
        .eq('id', id)
        .eq('user_id', context.userId)
        .single();

    if (fetchError || !lead) {
        return NextResponse.json(
            { error: 'Lead not found' },
            { status: 404 }
        );
    }

    // Toggle favorite
    const { data: updatedLead, error } = await supabase
        .from('leads')
        .update({ is_favorite: !lead.is_favorite })
        .eq('id', id)
        .eq('user_id', context.userId)
        .select()
        .single();

    if (error) {
        return NextResponse.json(
            { error: 'Failed to update favorite status' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        data: updatedLead,
    });
}, { action: 'api', enterpriseOnly: true }); // Restricts to Enterprise plan
