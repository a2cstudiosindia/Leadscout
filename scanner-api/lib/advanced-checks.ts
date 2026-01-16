/**
 * Advanced Audit Checks
 * Additional website checks for comprehensive auditing
 */

import { Page } from 'playwright';
import { AuditResult } from './types';

/**
 * Check for meta tags (title, description)
 */
export async function checkMetaTags(page: Page): Promise<AuditResult> {
    const title = await page.title();
    const metaDescription = await page.$eval(
        'meta[name="description"]',
        (el) => el.getAttribute('content')
    ).catch(() => null);

    const issues: string[] = [];
    let score = 100;

    // Title checks
    if (!title || title.length === 0) {
        issues.push('Missing page title');
        score -= 40;
    } else if (title.length < 30) {
        issues.push(`Title too short (${title.length} chars, aim for 50-60)`);
        score -= 15;
    } else if (title.length > 70) {
        issues.push(`Title too long (${title.length} chars, keep under 60)`);
        score -= 10;
    }

    // Description checks
    if (!metaDescription) {
        issues.push('Missing meta description');
        score -= 40;
    } else if (metaDescription.length < 120) {
        issues.push(`Description too short (${metaDescription.length} chars, aim for 150-160)`);
        score -= 15;
    } else if (metaDescription.length > 170) {
        issues.push(`Description too long (${metaDescription.length} chars)`);
        score -= 10;
    }

    const status = score >= 80 ? 'pass' : score >= 50 ? 'warning' : 'fail';

    return {
        score: Math.max(0, score),
        status,
        title: status === 'pass' ? 'SEO Tags Optimized' : 'SEO Tags Need Work',
        description: issues.length > 0 ? issues.join('. ') : 'Title and meta description are properly configured.',
        details: { titleLength: title?.length, descriptionLength: metaDescription?.length }
    };
}

/**
 * Check heading structure (H1-H6 hierarchy)
 */
export async function checkHeadingStructure(page: Page): Promise<AuditResult> {
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (els) =>
        els.map(el => ({ tag: el.tagName.toLowerCase(), text: el.textContent?.trim().slice(0, 50) }))
    );

    const h1Count = headings.filter(h => h.tag === 'h1').length;
    const issues: string[] = [];
    let score = 100;

    if (h1Count === 0) {
        issues.push('Missing H1 heading');
        score -= 50;
    } else if (h1Count > 1) {
        issues.push(`Multiple H1 tags found (${h1Count}). Use only one H1 per page.`);
        score -= 25;
    }

    if (headings.length < 3) {
        issues.push('Very few headings. Add more structure for better SEO.');
        score -= 20;
    }

    // Check for skipped heading levels
    const levels = headings.map(h => parseInt(h.tag.charAt(1)));
    for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i - 1] > 1) {
            issues.push('Heading levels skipped (e.g., H1 to H3). Maintain hierarchy.');
            score -= 15;
            break;
        }
    }

    const status = score >= 80 ? 'pass' : score >= 50 ? 'warning' : 'fail';

    return {
        score: Math.max(0, score),
        status,
        title: status === 'pass' ? 'Good Heading Structure' : 'Heading Issues Found',
        description: issues.length > 0 ? issues.join('. ') : 'Heading structure is properly organized.',
        details: { h1Count, totalHeadings: headings.length }
    };
}

/**
 * Check for accessibility issues
 */
export async function checkAccessibility(page: Page): Promise<AuditResult> {
    const issues: string[] = [];
    let score = 100;

    // Check images without alt text
    const imagesWithoutAlt = await page.$$eval('img', (imgs) =>
        imgs.filter(img => !img.alt || img.alt.trim() === '').length
    );
    if (imagesWithoutAlt > 0) {
        issues.push(`${imagesWithoutAlt} images missing alt text`);
        score -= Math.min(30, imagesWithoutAlt * 5);
    }

    // Check for form labels
    const inputsWithoutLabels = await page.$$eval('input:not([type="hidden"]):not([type="submit"]):not([type="button"])', (inputs) =>
        inputs.filter(input => {
            const id = input.id;
            if (!id) return true;
            return !document.querySelector(`label[for="${id}"]`);
        }).length
    );
    if (inputsWithoutLabels > 0) {
        issues.push(`${inputsWithoutLabels} form inputs without labels`);
        score -= Math.min(20, inputsWithoutLabels * 10);
    }

    // Check for links with generic text
    const genericLinks = await page.$$eval('a', (links) =>
        links.filter(a => {
            const text = a.textContent?.toLowerCase().trim();
            return text === 'click here' || text === 'read more' || text === 'learn more' || text === 'here';
        }).length
    );
    if (genericLinks > 2) {
        issues.push(`${genericLinks} links with generic text ("click here", "read more")`);
        score -= 15;
    }

    // Check for skip link
    const skipLinkElement = await page.$('a[href="#main"], a[href="#content"], .skip-link, .skip-to-content');
    const hasSkipLink = !!skipLinkElement;
    if (!hasSkipLink) {
        issues.push('No skip navigation link found');
        score -= 10;
    }

    const status = score >= 80 ? 'pass' : score >= 50 ? 'warning' : 'fail';

    return {
        score: Math.max(0, score),
        status,
        title: status === 'pass' ? 'Good Accessibility' : 'Accessibility Issues',
        description: issues.length > 0 ? issues.join('. ') : 'Basic accessibility checks passed.',
        details: { imagesWithoutAlt, inputsWithoutLabels, genericLinks }
    };
}

/**
 * Check for contact information visibility
 */
export async function checkContactInfo(page: Page): Promise<AuditResult> {
    const html = await page.content();
    const text = await page.innerText('body').catch(() => '');

    const issues: string[] = [];
    let score = 100;

    // Check for phone number pattern
    const phonePattern = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const hasPhone = phonePattern.test(text);
    if (!hasPhone) {
        issues.push('No phone number visible on homepage');
        score -= 25;
    }

    // Check for email pattern
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const hasEmail = emailPattern.test(text) || html.includes('mailto:');
    if (!hasEmail) {
        issues.push('No email address visible on homepage');
        score -= 20;
    }

    // Check for contact form
    const contactFormElement = await page.$('form[action*="contact"], form#contact, .contact-form, input[name="email"]');
    const hasContactForm = !!contactFormElement;
    if (!hasContactForm) {
        issues.push('No contact form detected');
        score -= 15;
    }

    // Check for address
    const addressPattern = /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|court|ct)/i;
    const hasAddress = addressPattern.test(text);
    if (!hasAddress) {
        issues.push('No physical address visible');
        score -= 10;
    }

    const status = score >= 80 ? 'pass' : score >= 50 ? 'warning' : 'fail';

    return {
        score: Math.max(0, score),
        status,
        title: status === 'pass' ? 'Contact Info Visible' : 'Contact Info Missing',
        description: issues.length > 0 ? issues.join('. ') : 'Contact information is prominently displayed.',
        details: { hasPhone, hasEmail, hasContactForm, hasAddress }
    };
}

/**
 * Check for favicon
 */
export async function checkFavicon(page: Page): Promise<AuditResult> {
    const faviconElement = await page.$('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
    const hasFavicon = !!faviconElement;

    if (!hasFavicon) {
        return {
            score: 0,
            status: 'fail',
            title: 'Favicon Missing',
            description: 'No favicon found. Add a favicon for a professional browser appearance.',
        };
    }

    return {
        score: 100,
        status: 'pass',
        title: 'Favicon Present',
        description: 'Favicon is properly configured.',
    };
}

/**
 * Check for sitemap and robots.txt
 */
export async function checkTechnicalSEO(baseUrl: string): Promise<AuditResult> {
    const issues: string[] = [];
    let score = 100;

    try {
        // Parse base URL
        const url = new URL(baseUrl);
        const origin = url.origin;

        // Check robots.txt
        const robotsResponse = await fetch(`${origin}/robots.txt`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
        }).catch(() => null);

        if (!robotsResponse?.ok) {
            issues.push('Missing robots.txt');
            score -= 25;
        }

        // Check sitemap.xml
        const sitemapResponse = await fetch(`${origin}/sitemap.xml`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
        }).catch(() => null);

        if (!sitemapResponse?.ok) {
            issues.push('Missing sitemap.xml');
            score -= 25;
        }

    } catch (error) {
        issues.push('Could not verify technical SEO files');
        score -= 30;
    }

    const status = score >= 80 ? 'pass' : score >= 50 ? 'warning' : 'fail';

    return {
        score: Math.max(0, score),
        status,
        title: status === 'pass' ? 'Technical SEO OK' : 'Technical SEO Issues',
        description: issues.length > 0 ? issues.join('. ') : 'Robots.txt and sitemap.xml are present.',
    };
}

/**
 * Check for image optimization
 */
export async function checkImageOptimization(page: Page): Promise<AuditResult> {
    const images = await page.$$eval('img', (imgs) =>
        imgs.map(img => ({
            src: img.src,
            width: img.naturalWidth,
            height: img.naturalHeight,
            loading: img.loading,
            hasAlt: !!img.alt,
            displayWidth: img.clientWidth,
            displayHeight: img.clientHeight
        })).filter(img => img.src && !img.src.startsWith('data:'))
    );

    const issues: string[] = [];
    let score = 100;

    // Check for lazy loading
    const nonLazyImages = images.filter(img => img.loading !== 'lazy');
    if (images.length > 3 && nonLazyImages.length > images.length / 2) {
        issues.push(`${nonLazyImages.length} images without lazy loading`);
        score -= 20;
    }

    // Check for oversized images (displayed much smaller than natural size)
    const oversizedImages = images.filter(img =>
        img.displayWidth > 0 &&
        img.width > 0 &&
        img.width > img.displayWidth * 2
    );
    if (oversizedImages.length > 0) {
        issues.push(`${oversizedImages.length} oversized images (served larger than displayed)`);
        score -= Math.min(30, oversizedImages.length * 10);
    }

    // Check for missing dimensions
    const missingDimensions = await page.$$eval('img', (imgs) =>
        imgs.filter(img => !img.width && !img.height && !img.style.width && !img.style.height).length
    );
    if (missingDimensions > 2) {
        issues.push(`${missingDimensions} images without explicit dimensions (causes layout shift)`);
        score -= 15;
    }

    const status = score >= 80 ? 'pass' : score >= 50 ? 'warning' : 'fail';

    return {
        score: Math.max(0, score),
        status,
        title: status === 'pass' ? 'Images Optimized' : 'Image Issues Found',
        description: issues.length > 0 ? issues.join('. ') : 'Images appear to be well optimized.',
        details: {
            totalImages: images.length,
            lazyLoaded: images.length - nonLazyImages.length,
            oversized: oversizedImages.length
        }
    };
}

/**
 * Check for HTTPS redirects
 */
export async function checkHTTPSRedirect(url: string): Promise<AuditResult> {
    // If already HTTPS, check if HTTP redirects properly
    try {
        const urlObj = new URL(url);

        if (urlObj.protocol === 'https:') {
            // Check if HTTP version redirects
            const httpUrl = url.replace('https://', 'http://');
            const response = await fetch(httpUrl, {
                redirect: 'manual',
                signal: AbortSignal.timeout(5000)
            }).catch(() => null);

            if (response?.status === 301 || response?.status === 302) {
                const location = response.headers.get('location');
                if (location?.startsWith('https://')) {
                    return {
                        score: 100,
                        status: 'pass',
                        title: 'HTTPS Redirect OK',
                        description: 'HTTP properly redirects to HTTPS.',
                    };
                }
            }

            return {
                score: 70,
                status: 'warning',
                title: 'No HTTP Redirect',
                description: 'HTTP may not redirect to HTTPS. Configure server to force HTTPS.',
            };
        }

        return {
            score: 0,
            status: 'fail',
            title: 'Not Using HTTPS',
            description: 'Site is served over insecure HTTP connection.',
        };

    } catch {
        return {
            score: 50,
            status: 'warning',
            title: 'Redirect Check Failed',
            description: 'Could not verify HTTPS redirect configuration.',
        };
    }
}
