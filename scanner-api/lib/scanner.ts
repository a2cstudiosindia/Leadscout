import { chromium, Browser, Page } from 'playwright';
import { ScanReport, AuditResult } from './types';
import {
    checkMetaTags,
    checkHeadingStructure,
    checkAccessibility,
    checkContactInfo,
    checkFavicon,
    checkTechnicalSEO,
    checkImageOptimization,
    checkHTTPSRedirect
} from './advanced-checks';

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

        console.log('[SCANNER] Running comprehensive audit on', url);

        // -- RUN ORIGINAL CHECKS --
        const security = await this.checkSecurity(page, response, url);
        const mobile = await this.checkMobile(page);
        const business = await this.checkBusiness(page);
        const content = await this.checkContent(page);
        const social = await this.checkSocial(page);

        // Performance check
        const loadTime = Date.now() - startTime;
        const performanceRecommendation = loadTime < 1500
            ? 'Excellent speed! Consider lazy loading images and using a CDN to maintain this performance.'
            : loadTime < 3000
                ? 'Good, but can improve. Compress images, minify CSS/JS, and enable browser caching.'
                : 'Slow load time is hurting conversions. Optimize images, use a CDN, enable compression, and reduce server response time.';

        const performance: AuditResult = {
            score: loadTime < 1500 ? 100 : loadTime < 3000 ? 50 : 0,
            status: loadTime < 3000 ? 'pass' : 'warning',
            title: 'Load Speed',
            description: `Page loaded in ${(loadTime / 1000).toFixed(1)}s`,
            recommendation: performanceRecommendation,
            details: { loadTimeMs: loadTime }
        };

        // -- RUN ADVANCED CHECKS --
        console.log('[SCANNER] Running advanced checks...');

        // Run advanced checks in parallel for speed
        const [metaTags, headings, accessibility, contactInfo, favicon, images] = await Promise.all([
            checkMetaTags(page).catch(() => this.createFailedCheck('Meta Tags')),
            checkHeadingStructure(page).catch(() => this.createFailedCheck('Headings')),
            checkAccessibility(page).catch(() => this.createFailedCheck('Accessibility')),
            checkContactInfo(page).catch(() => this.createFailedCheck('Contact Info')),
            checkFavicon(page).catch(() => this.createFailedCheck('Favicon')),
            checkImageOptimization(page).catch(() => this.createFailedCheck('Images')),
        ]);

        // Run URL-based checks (don't need page)
        const [technicalSEO, httpsRedirect] = await Promise.all([
            checkTechnicalSEO(url).catch(() => this.createFailedCheck('Technical SEO')),
            checkHTTPSRedirect(url).catch(() => this.createFailedCheck('HTTPS Redirect')),
        ]);

        // SEO check now combines meta tags and headings
        const seoScore = Math.round((metaTags.score + headings.score) / 2);
        const seo: AuditResult = {
            score: seoScore,
            status: seoScore >= 80 ? 'pass' : seoScore >= 50 ? 'warning' : 'fail',
            title: seoScore >= 80 ? 'SEO Optimized' : 'SEO Needs Work',
            description: `Meta tags (${metaTags.score}/100), Headings (${headings.score}/100)`,
            recommendation: 'Add meta title, meta description, heading tags (H1-H6), alt text for images, and structured data markup.'
        };

        await mobileContext.close();

        // Calculate overall score from all checks
        const allScores = [
            security.score, mobile.score, performance.score, seo.score,
            business.score, content.score, social.score,
            accessibility.score, contactInfo.score, favicon.score,
            technicalSEO.score, images.score, httpsRedirect.score
        ];
        const overallScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

        console.log(`[SCANNER] Audit complete. Score: ${overallScore}/100`);

        return {
            url,
            scannedAt: new Date().toISOString(),
            overallScore,
            checks: {
                security, mobile, performance, seo, business, content, social,
                metaTags, headings, accessibility, contactInfo, favicon,
                technicalSEO, images, httpsRedirect
            }
        };
    }

    private createFailedCheck(name: string): AuditResult {
        return {
            score: 0,
            status: 'warning',
            title: name,
            description: 'Check could not be completed'
        };
    }

    private generateFailedReport(url: string): ScanReport {
        const failedRec = 'Verify the domain is correct and the website is online. Check DNS settings and server status.';
        const failedCheck: AuditResult = { score: 0, status: 'fail', title: 'Site Unreachable', description: 'Could not load website', recommendation: failedRec };

        return {
            url,
            scannedAt: new Date().toISOString(),
            overallScore: 0,
            checks: {
                security: failedCheck,
                mobile: failedCheck,
                performance: failedCheck,
                seo: failedCheck,
                business: failedCheck,
                content: failedCheck,
                social: failedCheck,
                metaTags: failedCheck,
                headings: failedCheck,
                accessibility: failedCheck,
                contactInfo: failedCheck,
                favicon: failedCheck,
                technicalSEO: failedCheck,
                images: failedCheck,
                httpsRedirect: failedCheck
            }
        }
    }

    // --- INDIVIDUAL CHECKS ---

    private async checkSecurity(page: Page, response: any, url: string): Promise<AuditResult> {
        const isHttps = url.startsWith('https://');

        if (!isHttps) {
            return {
                score: 0,
                status: 'fail',
                title: 'SSL Missing',
                description: 'Website is not using HTTPS. Visitors see "Not Secure".',
                recommendation: 'Install an SSL certificate (free via Let\'s Encrypt) and redirect all HTTP traffic to HTTPS. This is critical for trust and SEO rankings.'
            };
        }
        return {
            score: 100,
            status: 'pass',
            title: 'SSL Secure',
            description: 'Website is served over HTTPS.',
            recommendation: 'Great! Keep your SSL certificate up to date and consider enabling HSTS for additional security.'
        };
    }

    private async checkMobile(page: Page): Promise<AuditResult> {
        const viewport = await page.$('meta[name="viewport"]');
        if (!viewport) {
            return {
                score: 0,
                status: 'fail',
                title: 'Not Mobile Friendly',
                description: 'Missing viewport tag. Site will look tiny on phones.',
                recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to your HTML head. 60%+ of visitors are on mobile - this is critical!'
            };
        }
        return {
            score: 100,
            status: 'pass',
            title: 'Mobile Optimized',
            description: 'Mobile viewport tag is present.',
            recommendation: 'Great! Test your site on multiple devices and screen sizes. Consider adding touch-friendly buttons and larger tap targets.'
        };
    }

    private async checkBusiness(page: Page): Promise<AuditResult> {
        const html = await page.content();
        const hasGTM = html.includes('googletagmanager.com');
        const hasFB = html.includes('connect.facebook.net') || html.includes('fbq(');
        const hasGA = html.includes('google-analytics.com');

        const trackingScore = (hasGTM || hasFB || hasGA) ? 100 : 0;

        if (trackingScore === 0) {
            return {
                score: 0,
                status: 'warning',
                title: 'No Tracking Detected',
                description: 'No Google Analytics or Facebook Pixel found. You are flying blind.',
                recommendation: 'Install Google Analytics 4 and/or Facebook Pixel to track visitors, conversions, and ROI. Use Google Tag Manager for easier management.'
            };
        }
        return {
            score: 100,
            status: 'pass',
            title: 'Tracking Active',
            description: 'Analytics tools detected.',
            recommendation: 'Excellent! Set up conversion goals, funnels, and remarketing audiences to maximize your tracking data.'
        };
    }

    private async checkContent(page: Page): Promise<AuditResult> {
        const text = await page.innerText('body');
        const currentYear = new Date().getFullYear();
        const hasCurrentYear = text.includes(currentYear.toString()) || text.includes((currentYear - 1).toString());

        if (!hasCurrentYear) {
            return {
                score: 50,
                status: 'warning',
                title: 'Outdated Content',
                description: `Copyright year is old or missing. Shows neglect.`,
                recommendation: `Update the copyright year to ${currentYear}. Add a blog with fresh content. Consider updating testimonials and case studies regularly.`
            };
        }
        return {
            score: 100,
            status: 'pass',
            title: 'Content Fresh',
            description: 'Copyright year is current.',
            recommendation: 'Good job keeping content current! Add new blog posts monthly and update key pages quarterly for best SEO results.'
        };
    }

    private async checkSocial(page: Page): Promise<AuditResult> {
        const links = await page.$$eval('a', (anchors) => anchors.map(a => a.href));
        const socialDomains = ['facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'youtube.com'];

        const socialLinks = links.filter(href => socialDomains.some(d => href.includes(d)));

        const brokenLinks = socialLinks.filter(href => href.endsWith('#') || href.endsWith('facebook.com/') || href.endsWith('instagram.com/'));

        if (brokenLinks.length > 0) {
            return {
                score: 0,
                status: 'fail',
                title: 'Broken Social Links',
                description: 'Social icons link to nowhere. Looks unprofessional.',
                recommendation: 'Fix broken social media links immediately. Either remove the icons or link them to active business profiles.'
            };
        }

        if (socialLinks.length === 0) {
            return {
                score: 50,
                status: 'warning',
                title: 'No Social Presence',
                description: 'No social media links found on homepage.',
                recommendation: 'Add links to your active social profiles (Facebook, Instagram, LinkedIn). Social proof increases trust and conversions by 15-20%.'
            };
        }

        return {
            score: 100,
            status: 'pass',
            title: 'Social Connected',
            description: `${socialLinks.length} social profiles active.`,
            recommendation: 'Great social presence! Consider adding social sharing buttons on blog posts and embedding a live feed for engagement.'
        };
    }
}
