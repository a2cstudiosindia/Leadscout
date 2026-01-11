import { NextRequest, NextResponse } from 'next/server';
import { getRazorpay, RAZORPAY_PLANS } from '@/lib/razorpay';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// POST /api/razorpay/order - Create a Razorpay order
export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;

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

    const planDetails = RAZORPAY_PLANS[plan as 'pro' | 'enterprise'];
    const razorpay = getRazorpay();

    try {
        // Create short receipt (max 40 chars)
        const shortId = user.id.slice(0, 8);
        const timestamp = Date.now().toString().slice(-8);

        const order = await razorpay.orders.create({
            amount: planDetails.amount,
            currency: planDetails.currency,
            receipt: `rcpt_${shortId}_${timestamp}`,
            notes: {
                user_id: user.id,
                plan: plan,
                user_email: user.email || '',
            },
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error('Razorpay order creation failed:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
