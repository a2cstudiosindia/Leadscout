import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// POST /api/razorpay/verify - Verify payment and update subscription
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        console.error('Razorpay signature verification failed');
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Calculate subscription end date (1 month from now)
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    // Update subscription in database
    const { error } = await supabase.from('subscriptions').upsert({
        user_id: user.id,
        plan: plan,
        stripe_customer_id: null, // Not using Stripe
        stripe_subscription_id: razorpay_payment_id, // Store Razorpay payment ID here
        current_period_end: currentPeriodEnd.toISOString(),
    });

    if (error) {
        console.error('Failed to update subscription:', error);
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    console.log(`User ${user.id} upgraded to ${plan} via Razorpay`);

    return NextResponse.json({
        success: true,
        message: 'Payment verified and subscription activated',
        plan,
    });
}
