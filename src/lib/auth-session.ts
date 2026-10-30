'use server';

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";

/**
 * Get the current session from Better-Auth
 * Cached per request/action lifecycle using React cache()
 */
export const getSession = cache(async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        return session;
    } catch (error) {
        console.error("Error getting session:", error);
        return null;
    }
});

/**
 * Get the current user from the session
 * Returns null if not authenticated
 */
export const getCurrentUser = cache(async () => {
    const session = await getSession();
    return session?.user || null;
});

/**
 * Check if user is authenticated
 */
export const isAuthenticated = cache(async () => {
    const session = await getSession();
    return !!session;
});
