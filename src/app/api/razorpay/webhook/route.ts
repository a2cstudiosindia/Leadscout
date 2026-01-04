import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Use service role for webhook (no user context)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify Razorpay webhook signature
function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
    return expectedSignature === signature;
}

// POST /api/razorpay/webhook - Handle Razorpay webhook events
export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
        console.error('Razorpay webhook: Missing signature');
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
        console.error('Razorpay webhook: Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    let event;
    try {
        event = JSON.parse(body);
    } catch {
        console.error('Razorpay webhook: Invalid JSON');
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const eventType = event.event;
    const payload = event.payload;

    console.log(`Razorpay webhook received: ${eventType}`);

    switch (eventType) {
        // Payment captured - backup verification
        case 'payment.captured': {
            const payment = payload.payment?.entity;
            if (!payment) break;

            const userId = payment.notes?.user_id;
            const plan = payment.notes?.plan;

            if (userId && plan) {
                // Check if subscription already exists (from verify endpoint)
                const { data: existing } = await supabaseAdmin
                    .from('subscriptions')
                    .select('plan')
                    .eq('user_id', userId)
                    .single();

                // Only update if still on free plan (verify endpoint didn't run)
                if (!existing || existing.plan === 'free') {
                    const currentPeriodEnd = new Date();
                    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

                    await supabaseAdmin.from('subscriptions').upsert({
                        user_id: userId,
                        plan: plan,
                        stripe_subscription_id: payment.id,
                        current_period_end: currentPeriodEnd.toISOString(),
                    });

                    console.log(`Webhook: User ${userId} upgraded to ${plan} via payment.captured`);
                }
            }
            break;
        }

        // Subscription charged (for recurring payments)
        case 'subscription.charged': {
            const subscription = payload.subscription?.entity;
            const payment = payload.payment?.entity;
            if (!subscription || !payment) break;

            const userId = subscription.notes?.user_id;
            if (userId) {
                // Extend subscription period
                const currentPeriodEnd = new Date();
                currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

                await supabaseAdmin
                    .from('subscriptions')
                    .update({
                        current_period_end: currentPeriodEnd.toISOString(),
                    })
                    .eq('user_id', userId);

                console.log(`Webhook: User ${userId} subscription renewed`);
            }
            break;
        }

        // Refund created - downgrade user
        case 'refund.created': {
            const refund = payload.refund?.entity;
            const payment = payload.payment?.entity;
            if (!payment) break;

            const userId = payment.notes?.user_id;
            if (userId) {
                // Downgrade to free plan
                await supabaseAdmin
                    .from('subscriptions')
                    .update({
                        plan: 'free',
                        stripe_subscription_id: null,
                    })
                    .eq('user_id', userId);

                console.log(`Webhook: User ${userId} refunded, downgraded to free`);
            }
            break;
        }

        // Payment failed
        case 'payment.failed': {
            const payment = payload.payment?.entity;
            if (payment) {
                console.log(`Payment failed for order: ${payment.order_id}`);
                // Could send email notification here
            }
            break;
        }

        default:
            console.log(`Unhandled Razorpay event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
}
