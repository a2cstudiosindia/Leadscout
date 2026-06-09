import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

// Better-Auth requires actual values at initialization time.
// During build, env vars may not be set. We use fallbacks to allow build to complete,
// but actual runtime will use the real env vars.
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://localhost:5432/placeholder";
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || "placeholder-secret-for-build-only-32chars";
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

// Google OAuth credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

// Polar configuration
const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN || "";
const POLAR_PRO_PRODUCT_ID = process.env.POLAR_PRO_PRODUCT_ID || "";
const POLAR_ENTERPRISE_PRODUCT_ID = process.env.POLAR_ENTERPRISE_PRODUCT_ID || "";
const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET || "";

// Check if we're in build mode (DATABASE_URL will be placeholder)
const isBuildTime = DATABASE_URL.includes('placeholder');

const polarEnabled = Boolean(POLAR_ACCESS_TOKEN && POLAR_PRO_PRODUCT_ID && POLAR_ENTERPRISE_PRODUCT_ID);
const createPolarCustomerOnSignUp = process.env.POLAR_CREATE_CUSTOMER_ON_SIGNUP === 'true';

const polarClient = polarEnabled
    ? new Polar({ accessToken: POLAR_ACCESS_TOKEN, server: 'production' })
    : null;

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
    trustedOrigins: [BETTER_AUTH_URL],
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    plugins: polarEnabled && polarClient
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
                            console.log('Polar webhook received:', payload.type);
                        }
                    })
                ]
            })
        ]
        : [],
});

// Type export for use in other files
export type Session = typeof auth.$Infer.Session;

