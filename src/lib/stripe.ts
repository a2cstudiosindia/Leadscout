import Stripe from 'stripe';

// Lazy-load Stripe to avoid build-time initialization
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
    if (!stripeInstance) {
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2025-12-15.clover',
        });
    }
    return stripeInstance;
}

// Legacy export for compatibility
export const stripe = {
    get customers() { return getStripe().customers; },
    get checkout() { return getStripe().checkout; },
    get subscriptions() { return getStripe().subscriptions; },
    get billingPortal() { return getStripe().billingPortal; },
    get webhooks() { return getStripe().webhooks; },
};

// Price IDs (set these in your environment)
export const STRIPE_PRICES = {
    pro: process.env.STRIPE_PRO_PRICE_ID!,
    enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
};
