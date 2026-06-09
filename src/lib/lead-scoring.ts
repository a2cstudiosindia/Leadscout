import { ScanReport } from './scanner/types';

export const SCORING_WEIGHTS = {
    noWebsite: 10,
    badMobile: 8,
    noSsl: 7,
    oldTechStack: 5,
    noTracking: 4,
    brokenSocial: 3,
    outdatedContent: 2,
} as const;

export type LeadPriority = 'hot' | 'warm' | 'cold';

export interface LeadScoreResult {
    score: number;
    reasons: string[];
    priority: LeadPriority;
}

interface ScorableLead {
    website?: string | null;
    website_url?: string | null;
}

function getPriority(score: number): LeadPriority {
    if (score >= 8) return 'hot';
    if (score >= 4) return 'warm';
    return 'cold';
}

function hasWebsite(lead: ScorableLead): boolean {
    const url = lead.website || lead.website_url;
    return Boolean(url && url.trim().length > 0);
}

export function calculateLeadScore(
    lead: ScorableLead,
    auditReport?: ScanReport | null
): LeadScoreResult {
    const reasons: string[] = [];
    let score = 0;

    if (!hasWebsite(lead)) {
        score += SCORING_WEIGHTS.noWebsite;
        reasons.push('No website — highest opportunity for web design services');
        return { score, reasons, priority: getPriority(score) };
    }

    if (!auditReport?.checks) {
        return { score, reasons, priority: getPriority(score) };
    }

    const { checks } = auditReport;

    if (checks.mobile && (checks.mobile.score < 50 || checks.mobile.status === 'fail')) {
        score += SCORING_WEIGHTS.badMobile;
        reasons.push('Poor mobile experience — site not optimized for phones');
    }

    if (checks.security && (checks.security.status === 'fail' || checks.security.title?.toLowerCase().includes('ssl'))) {
        score += SCORING_WEIGHTS.noSsl;
        reasons.push('No SSL certificate — visitors see "Not Secure" warning');
    }

    const techIndicators = ['wordpress', 'wix', 'squarespace', 'weebly', 'joomla'];
    const htmlContent = JSON.stringify(checks).toLowerCase();
    const hasOldTech = techIndicators.some((t) => htmlContent.includes(t));
    if (hasOldTech && checks.performance?.score !== undefined && checks.performance.score < 60) {
        score += SCORING_WEIGHTS.oldTechStack;
        reasons.push('Outdated tech stack with performance issues');
    }

    if (checks.business && checks.business.status !== 'pass' && checks.business.title?.toLowerCase().includes('tracking')) {
        score += SCORING_WEIGHTS.noTracking;
        reasons.push('No analytics or tracking — business is flying blind');
    }

    if (checks.social && checks.social.status === 'fail') {
        score += SCORING_WEIGHTS.brokenSocial;
        reasons.push('Broken social media links — looks unprofessional');
    }

    if (checks.content && (checks.content.status === 'warning' || checks.content.status === 'fail')) {
        score += SCORING_WEIGHTS.outdatedContent;
        reasons.push('Outdated content — copyright or freshness issues');
    }

    return { score, reasons, priority: getPriority(score) };
}

export function getPriorityBadge(priority: LeadPriority): { label: string; emoji: string; className: string } {
    switch (priority) {
        case 'hot':
            return { label: 'Hot', emoji: '🔥', className: 'bg-red-100 text-red-700 border-red-200' };
        case 'warm':
            return { label: 'Warm', emoji: '🟡', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
        case 'cold':
            return { label: 'Cold', emoji: '🔵', className: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
}
