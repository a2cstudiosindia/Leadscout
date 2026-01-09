import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, ApiContext } from '@/lib/api-middleware';
import { Scanner } from '@/lib/scanner';

// POST /api/v1/audit - Run a website audit
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

    const { url } = body;

    if (!url) {
        return NextResponse.json(
            { error: 'url is required' },
            { status: 400 }
        );
    }

    // Validate URL format
    try {
        new URL(url);
    } catch {
        return NextResponse.json(
            { error: 'Invalid URL format' },
            { status: 400 }
        );
    }

    // Run audit
    const scanner = new Scanner();
    try {
        const report = await scanner.scan(url);
        await scanner.close();

        return NextResponse.json({
            success: true,
            data: {
                url: report.url,
                overallScore: report.overallScore,
                checks: report.checks,
                scannedAt: report.scannedAt,
            },
        });
    } catch (error) {
        console.error('API audit error:', error);
        await scanner.close();
        return NextResponse.json(
            { error: 'Failed to scan website' },
            { status: 500 }
        );
    }
}, { action: 'audits' }); // Checks 'audits' limit + 'api' limit
