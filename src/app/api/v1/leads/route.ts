import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-keys';
import { checkLimit, incrementUsage } from '@/lib/subscription';
import { createClient } from '@/lib/supabase/server';

// GET /api/v1/leads - List user's leads
export async function GET(request: NextRequest) {
    // Validate API key
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: 'Missing or invalid Authorization header' },
            { status: 401 }
        );
    }

    const apiKey = authHeader.replace('Bearer ', '');
    const { valid, userId } = await validateApiKey(apiKey);

    if (!valid || !userId) {
        return NextResponse.json(
            { error: 'Invalid API key' },
            { status: 401 }
        );
    }

    // Increment API call usage
    await incrementUsage('api');

    // Fetch leads
    const supabase = await createClient();
    const { data: leads, error } = await supabase
        .from('leads')
        .select('id, business_name, website_url, status, notes, value, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json(
            { error: 'Failed to fetch leads' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        data: leads,
        count: leads.length,
    });
}

// POST /api/v1/leads - Create a new lead
export async function POST(request: NextRequest) {
    // Validate API key
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: 'Missing or invalid Authorization header' },
            { status: 401 }
        );
    }

    const apiKey = authHeader.replace('Bearer ', '');
    const { valid, userId } = await validateApiKey(apiKey);

    if (!valid || !userId) {
        return NextResponse.json(
            { error: 'Invalid API key' },
            { status: 401 }
        );
    }

    // Check usage limit
    const limitCheck = await checkLimit('leads');
    if (!limitCheck.allowed) {
        return NextResponse.json(
            { error: limitCheck.reason },
            { status: 429 }
        );
    }

    // Parse request body
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
        );
    }

    const { business_name, website_url, notes, value } = body;

    if (!business_name) {
        return NextResponse.json(
            { error: 'business_name is required' },
            { status: 400 }
        );
    }

    // Create lead
    const supabase = await createClient();
    const { data: lead, error } = await supabase
        .from('leads')
        .insert({
            user_id: userId,
            business_name,
            website_url: website_url || null,
            notes: notes || null,
            value: value || null,
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

    // Increment usage
    await incrementUsage('leads');
    await incrementUsage('api');

    return NextResponse.json({
        success: true,
        data: lead,
    }, { status: 201 });
}
