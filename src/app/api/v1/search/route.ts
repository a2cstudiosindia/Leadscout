import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, ApiContext } from '@/lib/api-middleware';
import { DiscoveryService } from '@/lib/discovery/service';

// POST /api/v1/search - Discover leads
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

    const { query } = body;

    if (!query) {
        return NextResponse.json(
            { error: 'query is required (e.g., "plumbers in Miami")' },
            { status: 400 }
        );
    }

    try {
        const service = new DiscoveryService();
        const response = await service.search(query);

        return NextResponse.json({
            success: true,
            data: response.results,
            count: response.results.length,
        });
    } catch (error) {
        console.error('API search error:', error);
        return NextResponse.json(
            { error: 'Failed to search for leads' },
            { status: 500 }
        );
    }
}, { action: 'searches' }); // Checks 'searches' limit + 'api' limit
