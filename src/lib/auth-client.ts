import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
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
