// Plan definitions - shared constants (no 'use server' here)
// Internal key 'enterprise' kept for billing compatibility; displayed as 'Agency'

export const PLANS = {
    free: {
        name: 'Free',
        leads: 10,
        audits: 5,
        searches: 20,
        apiAccess: false,
        pdfExport: false,
        csvExport: false,
        excelExport: false,
        advancedLeadData: false,
        api: 0,
    },
    pro: {
        name: 'Pro',
        leads: 500,
        audits: 50,
        searches: 500,
        apiAccess: true,
        pdfExport: true,
        csvExport: true,
        excelExport: false,
        advancedLeadData: false,
        price: 29,
        api: 1000,
    },
    enterprise: {
        name: 'Agency',
        leads: Infinity,
        audits: Infinity,
        searches: Infinity,
        apiAccess: true,
        pdfExport: true,
        csvExport: true,
        excelExport: true,
        advancedLeadData: true,
        price: 79,
        api: 10000,
    },
} as const;

export const CREDIT_PACKS = [
    { id: 'starter', credits: 50, price: 19, label: '50 Credits' },
    { id: 'growth', credits: 200, price: 59, label: '200 Credits' },
    { id: 'scale', credits: 500, price: 129, label: '500 Credits' },
] as const;

export type PlanType = keyof typeof PLANS;

export function isAgencyPlan(plan: PlanType): boolean {
    return plan === 'enterprise';
}

// Get current period string (YYYY-MM)
export function getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
