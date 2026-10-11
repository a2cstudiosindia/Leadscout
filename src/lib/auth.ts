import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

// Better-Auth requires actual values at initialization time.
// During build, env vars may not be set. We use fallbacks to allow build to complete,
// but actual runtime will use the real env vars.
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://localhost:5432/placeholder";
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || "placeholder-secret-for-build-only-32chars";
const getBaseUrl = () => {
    if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    return "http://localhost:3000";
};
const BETTER_AUTH_URL = getBaseUrl();

// Google OAuth credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

// Polar configuration — sandbox vs production based on POLAR_ENV
const POLAR_ENV = (process.env.POLAR_ENV || "sandbox") as "sandbox" | "production";
const isSandbox = POLAR_ENV === "sandbox";

const POLAR_ACCESS_TOKEN = isSandbox
    ? (process.env.POLAR_SANDBOX_ACCESS_TOKEN || "")
    : (process.env.POLAR_PROD_ACCESS_TOKEN || "");

const POLAR_PRO_PRODUCT_ID = isSandbox
    ? (process.env.POLAR_SANDBOX_PRO_PRODUCT_ID || "")
    : (process.env.POLAR_PROD_PRO_PRODUCT_ID || "");

const POLAR_ENTERPRISE_PRODUCT_ID = isSandbox
    ? (process.env.POLAR_SANDBOX_ENTERPRISE_PRODUCT_ID || "")
    : (process.env.POLAR_PROD_ENTERPRISE_PRODUCT_ID || "");

const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET || "";

// Check if we're in build mode (DATABASE_URL will be placeholder)
const isBuildTime = DATABASE_URL.includes('placeholder');

const polarEnabled = Boolean(POLAR_ACCESS_TOKEN && POLAR_PRO_PRODUCT_ID && POLAR_ENTERPRISE_PRODUCT_ID);
const createPolarCustomerOnSignUp = process.env.POLAR_CREATE_CUSTOMER_ON_SIGNUP === 'true';

if (!isBuildTime) {
    console.log(`[AUTH] Polar ${POLAR_ENV} mode, enabled: ${polarEnabled}`);
}

const polarClient = polarEnabled
    ? new Polar({ accessToken: POLAR_ACCESS_TOKEN, server: POLAR_ENV })
    : null;

// ─── Helper: determine plan from Polar product ID ──────────────
function planFromProductId(productId: string): 'pro' | 'enterprise' | null {
    if (productId === POLAR_PRO_PRODUCT_ID) return 'pro';
    if (productId === POLAR_ENTERPRISE_PRODUCT_ID) return 'enterprise';
    return null;
}

// ─── Helper: update subscription in Supabase ───────────────────
async function upsertSubscription(
    userId: string,
    plan: string,
    polarSubscriptionId?: string,
    polarCustomerId?: string,
    periodEnd?: Date
) {
    // Dynamic import to avoid circular deps
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const end = periodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { error } = await supabase
        .from('subscriptions')
        .upsert({
            user_id: userId,
            plan,
            polar_subscription_id: polarSubscriptionId || null,
            polar_customer_id: polarCustomerId || null,
            current_period_end: end.toISOString(),
        }, { onConflict: 'user_id' });

    if (error) {
        console.error(`[POLAR WEBHOOK] Failed to upsert subscription for user ${userId}:`, error);
    } else {
        console.log(`[POLAR WEBHOOK] User ${userId} → plan: ${plan}`);
    }
}

// ─── Helper: find user_id by Polar customer email ──────────────
async function findUserByEmail(email: string): Promise<string | null> {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    // Better Auth stores users in the 'user' table
    const { data, error } = await supabase
        .from('user')
        .select('id')
        .eq('email', email)
        .single();

    if (error || !data) {
        console.error(`[POLAR WEBHOOK] Could not find user with email ${email}:`, error);
        return null;
    }
    return data.id;
}

export const auth = betterAuth({
    database: new Pool({
        connectionString: DATABASE_URL,
        // Allow connections at runtime, but not during build
        max: isBuildTime ? 0 : 10,
    }),
    secret: BETTER_AUTH_SECRET,
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
        },
    },
    trustedOrigins: [
        BETTER_AUTH_URL,
        process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "",
        process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "",
        "http://localhost:3000",
    ].filter((v, i, a) => v && a.indexOf(v) === i), // deduplicate and remove empty
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    plugins: [
        ...(polarEnabled && polarClient
            ? [
                polar({
                    client: polarClient,
                    // Off by default — expired Polar tokens block Google/email sign-up
                    createCustomerOnSignUp: createPolarCustomerOnSignUp,
                    use: [
                        checkout({
                            products: [
                                { productId: POLAR_PRO_PRODUCT_ID, slug: "pro" },
                                { productId: POLAR_ENTERPRISE_PRODUCT_ID, slug: "enterprise" }
                            ],
                            successUrl: "/dashboard?checkout=success",
                            authenticatedUsersOnly: true
                        }),
                        portal(),
                        webhooks({
                            secret: POLAR_WEBHOOK_SECRET,
                            onPayload: async (payload) => {
                                const type = payload.type;
                                console.log(`[POLAR WEBHOOK] Event: ${type}`);

                                // Handle subscription lifecycle events
                                if (
                                    type === 'subscription.created' ||
                                    type === 'subscription.active' ||
                                    type === 'subscription.updated'
                                ) {
                                    const sub = payload.data as any;
                                    const email = sub.customer?.email || sub.user?.email;
                                    const polarSubId = sub.id;
                                    const polarCustomerId = sub.customer_id || sub.customer?.id || sub.customerId;

                                    // Determine plan from the product
                                    const productId = sub.product_id || sub.product?.id || sub.productId;
                                    const plan = productId ? planFromProductId(productId) : null;

                                    if (!plan) {
                                        console.warn(`[POLAR WEBHOOK] Unknown product ID: ${productId}`);
                                        return;
                                    }

                                    // Determine the user: check external_id first (sent during checkout), then metadata, then email
                                    let userId = sub.customer?.external_id || sub.customer?.externalId || sub.metadata?.user_id;
                                    if (!userId && email) {
                                        userId = await findUserByEmail(email);
                                    }

                                    if (!userId) {
                                        console.error(`[POLAR WEBHOOK] Cannot determine user for subscription ${polarSubId}`);
                                        return;
                                    }

                                    // Determine period end
                                    const periodEndRaw = sub.current_period_end || sub.currentPeriodEnd;
                                    const periodEnd = periodEndRaw ? new Date(periodEndRaw) : undefined;

                                    // Only activate on 'active' status, not canceled/revoked
                                    const status = sub.status;
                                    if (status === 'canceled' || status === 'revoked') {
                                        await upsertSubscription(userId, 'free', polarSubId, polarCustomerId);
                                    } else {
                                        await upsertSubscription(userId, plan, polarSubId, polarCustomerId, periodEnd);
                                    }
                                }

                                // Handle cancellation
                                if (type === 'subscription.canceled' || type === 'subscription.revoked') {
                                    const sub = payload.data as any;
                                    const email = sub.customer?.email || sub.user?.email;
                                    const polarSubId = sub.id;
                                    const polarCustomerId = sub.customer_id || sub.customer?.id || sub.customerId;

                                    let userId = sub.customer?.external_id || sub.customer?.externalId || sub.metadata?.user_id;
                                    if (!userId && email) {
                                        userId = await findUserByEmail(email);
                                    }

                                    if (userId) {
                                        await upsertSubscription(userId, 'free', polarSubId, polarCustomerId);
                                    }
                                }

                                // Handle order completion (one-time purchases)
                                if (type === 'order.created') {
                                    console.log('[POLAR WEBHOOK] Order created:', JSON.stringify(payload.data, null, 2));
                                }
                            }
                        })
                    ]
                })
            ]
            : [])
    ],
});

// Type export for use in other files
export type Session = typeof auth.$Infer.Session;
