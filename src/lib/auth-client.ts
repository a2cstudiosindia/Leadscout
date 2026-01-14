import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth/client";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
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
