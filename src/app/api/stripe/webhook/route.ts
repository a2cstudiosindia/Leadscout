import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Force dynamic rendering (no static pre-rendering)
export const dynamic = 'force-dynamic';

// Use service role for webhook (no user context)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/stripe/webhook - Handle Stripe webhook events
export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.user_id;
            const plan = session.metadata?.plan;
            const subscriptionId = session.subscription as string;

            if (userId && plan && subscriptionId) {
                // Fetch subscription details
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const periodEnd = subscription.items.data[0]?.current_period_end;

                await supabaseAdmin
                    .from('subscriptions')
                    .upsert({
                        user_id: userId,
                        plan,
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: subscriptionId,
                        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
                    });

                console.log(`User ${userId} upgraded to ${plan}`);
            }
            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;

            // Find user by customer ID
            const { data: sub } = await supabaseAdmin
                .from('subscriptions')
                .select('user_id')
                .eq('stripe_customer_id', customerId)
                .single();

            if (sub) {
                const periodEnd = subscription.items.data[0]?.current_period_end;
                await supabaseAdmin
                    .from('subscriptions')
                    .update({
                        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
                    })
                    .eq('stripe_customer_id', customerId);
            }
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;

            // Downgrade to free
            await supabaseAdmin
                .from('subscriptions')
                .update({ plan: 'free', stripe_subscription_id: null })
                .eq('stripe_customer_id', customerId);

            console.log(`Customer ${customerId} subscription canceled`);
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
