import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, ApiContext } from '@/lib/api-middleware';
import { createClient } from '@/lib/supabase/server';

// GET /api/v1/leads/[id] - Get a single lead
export const GET = withApiAuth(async (req: NextRequest, context: ApiContext, params: { params: { id: string } }) => {
    const supabase = await createClient();
    const { id } = await params.params;

    const { data: lead, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .eq('user_id', context.userId)
        .single();

    if (error) {
        return NextResponse.json(
            { error: 'Lead not found' },
            { status: 404 }
        );
    }

    return NextResponse.json({
        success: true,
        data: lead,
    });
}, { action: 'api' });

// PATCH /api/v1/leads/[id] - Update a lead
export const PATCH = withApiAuth(async (req: NextRequest, context: ApiContext, params: { params: { id: string } }) => {
    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
        );
    }

    const supabase = await createClient();
    const { id } = await params.params;

    // Allowed fields to update
    const { status, notes, value, phone, address, business_name, website_url } = body;
    const updates: any = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (value !== undefined) updates.value = value;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (business_name) updates.business_name = business_name;
    if (website_url !== undefined) updates.website_url = website_url;

    if (Object.keys(updates).length === 0) {
        return NextResponse.json(
            { error: 'No valid fields to update' },
            { status: 400 }
        );
    }

    const { data: lead, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .eq('user_id', context.userId)
        .select()
        .single();

    if (error) {
        return NextResponse.json(
            { error: 'Failed to update lead' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        data: lead,
    });
}, { action: 'api' });

// DELETE /api/v1/leads/[id] - Delete a lead
export const DELETE = withApiAuth(async (req: NextRequest, context: ApiContext, params: { params: { id: string } }) => {
    const supabase = await createClient();
    const { id } = await params.params;

    const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
        .eq('user_id', context.userId);

    if (error) {
        return NextResponse.json(
            { error: 'Failed to delete lead' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        message: 'Lead deleted successfully',
    });
}, { action: 'api' });
