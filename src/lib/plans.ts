// Plan definitions - shared constants (no 'use server' here)

export const PLANS = {
    free: {
        name: 'Free',
        leads: 10,
        audits: 5,
        apiAccess: false,
        pdfExport: false,
    },
    pro: {
        name: 'Pro',
        leads: 100,
        audits: 50,
        apiAccess: true,
        pdfExport: true,
        price: 29,
    },
    enterprise: {
        name: 'Enterprise',
        leads: Infinity,
        audits: Infinity,
        apiAccess: true,
        pdfExport: true,
        price: 99,
    },
} as const;

export type PlanType = keyof typeof PLANS;

// Get current period string (YYYY-MM)
export function getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
