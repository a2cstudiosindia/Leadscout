const robotsCache = new Map<string, { allowed: boolean; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function parseRobotsTxt(content: string, path: string): boolean {
    const lines = content.split('\n');
    let currentAgentApplies = false;
    let allowed = true;

    for (const rawLine of lines) {
        const line = rawLine.split('#')[0].trim();
        if (!line) continue;

        const [directive, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();

        if (directive.toLowerCase() === 'user-agent') {
            currentAgentApplies = value === '*' || value.toLowerCase().includes('leadscout');
        } else if (currentAgentApplies && directive.toLowerCase() === 'disallow') {
            if (value === '/' || (value && path.startsWith(value))) {
                allowed = false;
            }
        } else if (currentAgentApplies && directive.toLowerCase() === 'allow') {
            if (value && path.startsWith(value)) {
                allowed = true;
            }
        }
    }

    return allowed;
}

export async function canScrape(url: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
        const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
        const domain = parsed.hostname;
        const cached = robotsCache.get(domain);

        if (cached && cached.expiresAt > Date.now()) {
            return cached.allowed
                ? { allowed: true }
                : { allowed: false, reason: 'robots.txt disallows scraping for this domain' };
        }

        const robotsUrl = `${parsed.protocol}//${domain}/robots.txt`;
        const response = await fetch(robotsUrl, {
            signal: AbortSignal.timeout(5000),
            headers: { 'User-Agent': 'LeadScout-AuditBot/1.0' },
        });

        if (!response.ok) {
            robotsCache.set(domain, { allowed: true, expiresAt: Date.now() + CACHE_TTL_MS });
            return { allowed: true };
        }

        const content = await response.text();
        const allowed = parseRobotsTxt(content, parsed.pathname);
        robotsCache.set(domain, { allowed, expiresAt: Date.now() + CACHE_TTL_MS });

        return allowed
            ? { allowed: true }
            : { allowed: false, reason: 'robots.txt disallows scraping for this path' };
    } catch {
        return { allowed: true };
    }
}
