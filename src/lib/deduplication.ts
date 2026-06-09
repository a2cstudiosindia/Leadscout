const DUPLICATE_THRESHOLD = 0.85;

interface LeadIdentity {
    id?: string;
    business_name?: string;
    name?: string;
    address?: string;
    formatted_address?: string;
}

function normalize(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function bigrams(text: string): Set<string> {
    const set = new Set<string>();
    for (let i = 0; i < text.length - 1; i++) {
        set.add(text.slice(i, i + 2));
    }
    return set;
}

function diceCoefficient(a: string, b: string): number {
    if (!a || !b) return 0;
    if (a === b) return 1;

    const bigramsA = bigrams(a);
    const bigramsB = bigrams(b);
    if (bigramsA.size === 0 && bigramsB.size === 0) return 1;
    if (bigramsA.size === 0 || bigramsB.size === 0) return 0;

    let intersection = 0;
    for (const bg of bigramsA) {
        if (bigramsB.has(bg)) intersection++;
    }

    return (2 * intersection) / (bigramsA.size + bigramsB.size);
}

function getLeadKey(lead: LeadIdentity): string {
    const name = lead.business_name || lead.name || '';
    const address = lead.address || lead.formatted_address || '';
    return normalize(`${name} ${address}`);
}

export interface DuplicateCheckResult {
    isDuplicate: boolean;
    matchedLeadId?: string;
    confidence: number;
}

export function isDuplicate(
    newLead: LeadIdentity,
    existingLeads: LeadIdentity[]
): DuplicateCheckResult {
    const newKey = getLeadKey(newLead);
    if (!newKey) return { isDuplicate: false, confidence: 0 };

    let bestMatch: { id?: string; confidence: number } = { confidence: 0 };

    for (const existing of existingLeads) {
        const existingKey = getLeadKey(existing);
        const confidence = diceCoefficient(newKey, existingKey);

        if (confidence > bestMatch.confidence) {
            bestMatch = { id: existing.id, confidence };
        }
    }

    return {
        isDuplicate: bestMatch.confidence >= DUPLICATE_THRESHOLD,
        matchedLeadId: bestMatch.confidence >= DUPLICATE_THRESHOLD ? bestMatch.id : undefined,
        confidence: bestMatch.confidence,
    };
}

export { DUPLICATE_THRESHOLD };
