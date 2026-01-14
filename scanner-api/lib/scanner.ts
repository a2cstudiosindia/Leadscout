import { chromium, Browser, Page } from 'playwright';
import { ScanReport, AuditResult } from './types';

export class Scanner {
    private browser: Browser | null = null;

    async init() {
        this.browser = await chromium.launch({ headless: true });
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async scan(url: string): Promise<ScanReport> {
        if (!this.browser) await this.init();

        // Create contexts for mobile and desktop
        const mobileContext = await this.browser!.newContext({
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
            viewport: { width: 375, height: 812 },
            isMobile: true
        });

        const page = await mobileContext.newPage();
        const startTime = Date.now();
        let response;

        try {
            response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch (error: any) {
            console.error("Failed to load page:", error);
            if (error.message.includes('ERR_NAME_NOT_RESOLVED') || error.message.includes('ERR_CONNECTION_REFUSED')) {
                const failedReport = this.generateFailedReport(url);
                failedReport.checks.security.description = "Domain does not exist or DNS failed (ERR_NAME_NOT_RESOLVED).";
                return failedReport;
            }
            return this.generateFailedReport(url);
        }

        // -- RUN CHECKS --
        const security = await this.checkSecurity(page, response, url);
        const mobile = await this.checkMobile(page);
        const business = await this.checkBusiness(page);
        const content = await this.checkContent(page);
        const social = await this.checkSocial(page);

        // Performance: Measure Time to Interactive roughly
        const loadTime = Date.now() - startTime;
        const performance: AuditResult = {
            score: loadTime < 1500 ? 100 : loadTime < 3000 ? 50 : 0,
            status: loadTime < 3000 ? 'pass' : 'warning',
            title: 'Load Speed',
            description: `Page loaded in ${(loadTime / 1000).toFixed(1)}s`,
            details: { loadTimeMs: loadTime }
        };

        // Calculate simple average score for now
        const validScores = [security, mobile, business, content, social, performance].map(c => c.score);
        const score = Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);

        await mobileContext.close();

        return {
            url,
            scannedAt: new Date().toISOString(),
            overallScore: score,
            checks: {
                security,
                mobile,
                performance,
                seo: { score: 0, status: 'warning', title: 'SEO', description: 'Pending' },
                business,
                content,
                social
            }
        };
    }

    private generateFailedReport(url: string): ScanReport {
        return {
            url,
            scannedAt: new Date().toISOString(),
            overallScore: 0,
            checks: {
                security: { score: 0, status: 'fail', title: 'Site Unreachable', description: 'Could not load website' },
                mobile: { score: 0, status: 'fail', title: 'Site Unreachable', description: 'Could not load website' },
                performance: { score: 0, status: 'fail', title: 'Site Unreachable', description: 'Could not load website' },
                seo: { score: 0, status: 'fail', title: 'Site Unreachable', description: 'Could not load website' },
                business: { score: 0, status: 'fail', title: 'Site Unreachable', description: 'Could not load website' },
                content: { score: 0, status: 'fail', title: 'Site Unreachable', description: 'Could not load website' },
                social: { score: 0, status: 'fail', title: 'Site Unreachable', description: 'Could not load website' }
            }
        }
    }

    // --- INDIVIDUAL CHECKS ---

    private async checkSecurity(page: Page, response: any, url: string): Promise<AuditResult> {
        const isHttps = url.startsWith('https://');

        if (!isHttps) {
            return { score: 0, status: 'fail', title: 'SSL Missing', description: 'Website is not using HTTPS. Visitors see "Not Secure".' };
        }
        return { score: 100, status: 'pass', title: 'SSL Secure', description: 'Website is served over HTTPS.' };
    }

    private async checkMobile(page: Page): Promise<AuditResult> {
        const viewport = await page.$('meta[name="viewport"]');
        if (!viewport) {
            return { score: 0, status: 'fail', title: 'Not Mobile Friendly', description: 'Missing viewport tag. Site will look tiny on phones.' };
        }
        return { score: 100, status: 'pass', title: 'Mobile Optimized', description: 'Mobile viewport tag is present.' };
    }

    private async checkBusiness(page: Page): Promise<AuditResult> {
        const html = await page.content();
        const hasGTM = html.includes('googletagmanager.com');
        const hasFB = html.includes('connect.facebook.net') || html.includes('fbq(');
        const hasGA = html.includes('google-analytics.com');

        const trackingScore = (hasGTM || hasFB || hasGA) ? 100 : 0;

        if (trackingScore === 0) {
            return { score: 0, status: 'warning', title: 'No Tracking Detected', description: 'No Google Analytics or Facebook Pixel found. You are flying blind.' };
        }
        return { score: 100, status: 'pass', title: 'Tracking Active', description: 'Analytics tools detected.' };
    }

    private async checkContent(page: Page): Promise<AuditResult> {
        const text = await page.innerText('body');
        const currentYear = new Date().getFullYear();
        const hasCurrentYear = text.includes(currentYear.toString()) || text.includes((currentYear - 1).toString());

        if (!hasCurrentYear) {
            return { score: 50, status: 'warning', title: 'Outdated Content', description: `Copyright year is old or missing. Shows neglect.` };
        }
        return { score: 100, status: 'pass', title: 'Content Fresh', description: 'Copyright year is current.' };
    }

    private async checkSocial(page: Page): Promise<AuditResult> {
        const links = await page.$$eval('a', (anchors) => anchors.map(a => a.href));
        const socialDomains = ['facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'youtube.com'];

        const socialLinks = links.filter(href => socialDomains.some(d => href.includes(d)));

        const brokenLinks = socialLinks.filter(href => href.endsWith('#') || href.endsWith('facebook.com/') || href.endsWith('instagram.com/'));

        if (brokenLinks.length > 0) {
            return { score: 0, status: 'fail', title: 'Broken Social Links', description: 'Social icons link to nowhere. Looks unprofessional.' };
        }

        if (socialLinks.length === 0) {
            return { score: 50, status: 'warning', title: 'No Social Presence', description: 'No social media links found on homepage.' };
        }

        return { score: 100, status: 'pass', title: 'Social Connected', description: `${socialLinks.length} social profiles active.` };
    }
}
