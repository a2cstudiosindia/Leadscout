import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Better-Auth requires actual values at initialization time.
// During build, env vars may not be set. We use fallbacks to allow build to complete,
// but actual runtime will use the real env vars.
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://localhost:5432/placeholder";
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || "placeholder-secret-for-build-only-32chars";
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

// Google OAuth credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

// Check if we're in build mode (DATABASE_URL will be placeholder)
const isBuildTime = DATABASE_URL.includes('placeholder');

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
});

// Type export for use in other files
export type Session = typeof auth.$Infer.Session;
