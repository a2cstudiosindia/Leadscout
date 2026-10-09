import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, ApiContext } from '@/lib/api-middleware';

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

    // Run audit using external API
    const scannerApiUrl = process.env.SCANNER_API_URL;
    if (!scannerApiUrl) {
        return NextResponse.json(
            { error: 'Scanner API is not configured' },
            { status: 500 }
        );
    }

    try {
        const response = await fetch(`${scannerApiUrl}/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        const data = await response.json();
        
        if (!response.ok || !data.success) {
            return NextResponse.json(
                { error: data.error || 'Failed to scan website' },
                { status: response.status === 200 ? 500 : response.status }
            );
        }

        const report = data.report;

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
        return NextResponse.json(
            { error: 'Failed to scan website' },
            { status: 500 }
        );
    }
}, { action: 'audits' }); // Checks 'audits' limit + 'api' limit
