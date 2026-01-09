import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-keys';
import { checkLimit, incrementUsage, getSubscription } from '@/lib/subscription';

export type ApiContext = {
    userId: string;
    apiKeyId: string;
};

type ApiHandler = (
    req: NextRequest,
    context: ApiContext,
    params?: any
) => Promise<NextResponse>;

type ApiOptions = {
    action: 'leads' | 'audits' | 'searches' | 'api';
    enterpriseOnly?: boolean;
};

export async function withApiAuth(
    handler: ApiHandler,
    options: ApiOptions = { action: 'api' }
) {
    return async (req: NextRequest, { params }: { params?: any } = {}) => {
        try {
            // 1. Validate API Key
            const authHeader = req.headers.get('authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return NextResponse.json(
                    { error: 'Missing or invalid Authorization header' },
                    { status: 401 }
                );
            }

            const apiKey = authHeader.replace('Bearer ', '');
            let validationResult;

            try {
                validationResult = await validateApiKey(apiKey);
            } catch (error) {
                console.error('API key validation error:', error);
                return NextResponse.json(
                    { error: 'Internal system error' },
                    { status: 500 }
                );
            }

            const { valid, userId, keyId } = validationResult;

            if (!valid || !userId) {
                return NextResponse.json(
                    { error: 'Invalid API key' },
                    { status: 401 }
                );
            }

            // 2. Check Subscription & Limits
            // First check general API access (must be Pro+)
            const subscription = await getSubscription();

            if (!subscription || !subscription.limits.apiAccess) {
                return NextResponse.json(
                    { error: 'API access requires a Pro or Enterprise plan' },
                    { status: 403 }
                );
            }

            // Check Enterprise-only features if required
            if (options.enterpriseOnly && subscription.plan !== 'enterprise') {
                return NextResponse.json(
                    { error: 'This endpoint requires an Enterprise plan' },
                    { status: 403 }
                );
            }

            // Check specific action limits (leads, audits, etc.)
            const limitCheck = await checkLimit(options.action);
            if (!limitCheck.allowed) {
                return NextResponse.json(
                    { error: limitCheck.reason },
                    { status: 429 }
                );
            }

            // Also check general API call counts if configured in plans
            if (options.action !== 'api') {
                const apiLimitCheck = await checkLimit('api');
                if (!apiLimitCheck.allowed) {
                    return NextResponse.json(
                        { error: apiLimitCheck.reason },
                        { status: 429 }
                    );
                }
            }

            // 3. Rate Limiting (Simple in-memory for now, could use Redis later)
            // Note: In a serverless environment, in-memory isn't perfect but helps
            // We'll rely mainly on the monthly database counters for now

            // 4. Increment Usage & Execute
            if (options.action !== 'api') {
                await incrementUsage(options.action);
            }
            await incrementUsage('api');

            return await handler(req, { userId, apiKeyId: keyId! }, params);

        } catch (error) {
            console.error('API Middleware Error:', error);
            return NextResponse.json(
                { error: 'Internal Server Error' },
                { status: 500 }
            );
        }
    };
}
