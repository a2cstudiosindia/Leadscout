import Razorpay from 'razorpay';

// Lazy-load Razorpay to avoid build-time initialization
let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });
    }
    return razorpayInstance;
}

// Plan pricing in INR (paise)
export const RAZORPAY_PLANS = {
    pro: {
        name: 'Pro',
        amount: 2499 * 100, // ₹2,499 in paise
        currency: 'INR',
        period: 'monthly',
    },
    enterprise: {
        name: 'Enterprise',
        amount: 7999 * 100, // ₹7,999 in paise
        currency: 'INR',
        period: 'monthly',
    },
};
