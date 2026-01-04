import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-keys';
import { checkLimit, incrementUsage } from '@/lib/subscription';
import { Scanner } from '@/lib/scanner';

// POST /api/v1/audit - Run a website audit
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
    const limitCheck = await checkLimit('audits');
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

        // Increment usage
        await incrementUsage('audits');
        await incrementUsage('api');

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
}
