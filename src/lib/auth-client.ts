import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth/client";

const getBaseUrl = () => {
    if (typeof window !== "undefined") return window.location.origin;
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    return "http://localhost:3000";
};

export const authClient = createAuthClient({
    baseURL: getBaseUrl(),
    plugins: [polarClient()]
});

// Export commonly used methods for convenience
export const {
    signIn,
    signUp,
    signOut,
    useSession,
} = authClient;

// Social sign-in helper
export const signInWithGoogle = async (redirectTo?: string) => {
    return authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo || "/dashboard",
    });
};

// Polar checkout helper
export const checkout = async (slug: 'pro' | 'enterprise') => {
    return authClient.checkout({ slug });
};

// Polar customer portal helper
export const customerPortal = async () => {
    return authClient.customer.portal();
};
