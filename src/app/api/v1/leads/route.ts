import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, ApiContext } from '@/lib/api-middleware';
import { createClient } from '@/lib/supabase/server';

// GET /api/v1/leads - List user's leads
export const GET = withApiAuth(async (req: NextRequest, context: ApiContext) => {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    // Filters
    const status = searchParams.get('status');
    const isFavorite = searchParams.get('favorite');
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
        .from('leads')
        .select('id, business_name, website_url, status, notes, value, phone, address, is_favorite, created_at', { count: 'exact' })
        .eq('user_id', context.userId);

    // Apply filters
    if (status) query = query.eq('status', status);
    if (isFavorite === 'true') query = query.eq('is_favorite', true);
    if (fromDate) query = query.gte('created_at', fromDate);
    if (toDate) query = query.lte('created_at', toDate);

    // Pagination
    query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    const { data: leads, error, count } = await query;

    if (error) {
        return NextResponse.json(
            { error: 'Failed to fetch leads' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        data: leads,
        meta: {
            total: count,
            limit,
            offset,
        }
    });
}, { action: 'api' }); // Just general API limit check for listing

// POST /api/v1/leads - Create a new lead
export const POST = withApiAuth(async (req: NextRequest, context: ApiContext) => {
    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
        );
    }

    const { business_name, website_url, notes, value, phone, address } = body;

    if (!business_name) {
        return NextResponse.json(
            { error: 'business_name is required' },
            { status: 400 }
        );
    }

    const supabase = await createClient();
    const { data: lead, error } = await supabase
        .from('leads')
        .insert({
            user_id: context.userId,
            business_name,
            website_url: website_url || null,
            notes: notes || null,
            value: value || null,
            phone: phone || null,
            address: address || null,
            status: 'new',
        })
        .select()
        .single();

    if (error) {
        console.error('API create lead error:', error);
        return NextResponse.json(
            { error: 'Failed to create lead' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        data: lead,
    }, { status: 201 });

}, { action: 'leads' }); // Checks 'leads' limit + 'api' limit
