'use server';

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Get the current session from Better-Auth
 * Use this in server components and server actions
 */
export async function getSession() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        return session;
    } catch (error) {
        console.error("Error getting session:", error);
        return null;
    }
}

/**
 * Get the current user from the session
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
    const session = await getSession();
    return session?.user || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
    const session = await getSession();
    return !!session;
}
