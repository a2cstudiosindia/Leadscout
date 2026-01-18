import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRICES } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// POST /api/stripe/checkout - Create a checkout session
export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { plan } = body;

    if (!plan || !['pro', 'enterprise'].includes(plan)) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const priceId = STRIPE_PRICES[plan as 'pro' | 'enterprise'];
    if (!priceId) {
        return NextResponse.json({ error: 'Price not configured' }, { status: 500 });
    }

    // Get or create Stripe customer
    let customerId: string;

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();

    if (subscription?.stripe_customer_id) {
        customerId = subscription.stripe_customer_id;
    } else {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
            email: user.email,
            metadata: { user_id: user.id },
        });
        customerId = customer.id;

        // Save customer ID
        await supabase.from('subscriptions').upsert({
            user_id: user.id,
            stripe_customer_id: customerId,
            plan: 'free',
        });
    }

    // Get origin for redirect URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create checkout session
    const stripeSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${origin}/dashboard?checkout=success`,
        cancel_url: `${origin}/pricing?checkout=canceled`,
        metadata: { user_id: user.id, plan },
    });

    return NextResponse.json({ url: stripeSession.url });
}
