// Plan definitions - shared constants (no 'use server' here)

export const PLANS = {
    free: {
        name: 'Free',
        leads: 10,
        audits: 5,
        searches: 20,
        apiAccess: false,
        pdfExport: false,
        excelExport: false,
        advancedLeadData: false,
        api: 0,
    },
    pro: {
        name: 'Pro',
        leads: 100,
        audits: 50,
        searches: 500,
        apiAccess: true,
        pdfExport: true,
        excelExport: false,
        advancedLeadData: false,
        price: 29,
        api: 1000,
    },
    enterprise: {
        name: 'Enterprise',
        leads: Infinity,
        audits: Infinity,
        searches: Infinity,
        apiAccess: true,
        pdfExport: true,
        excelExport: true,
        advancedLeadData: true,
        price: 99,
        api: 10000,
    },
} as const;

export type PlanType = keyof typeof PLANS;

// Get current period string (YYYY-MM)
export function getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
