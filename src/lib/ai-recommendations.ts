/**
 * AI-Powered Recommendation Generator
 * Generates personalized, actionable recommendations for each audit check
 */

interface AuditCheck {
    title: string;
    description: string;
    status: 'pass' | 'fail' | 'warning';
    score: number;
}

interface ScanChecks {
    security: AuditCheck;
    mobile: AuditCheck;
    performance: AuditCheck;
    seo: AuditCheck;
    business: AuditCheck;
    content: AuditCheck;
    social: AuditCheck;
}

interface AIRecommendations {
    security: string;
    mobile: string;
    performance: string;
    seo: string;
    business: string;
    content: string;
    social: string;
    summary: string;
    priorityFixes: string[];
}

const SYSTEM_PROMPT = `You are a web development expert and digital marketing consultant. Your job is to analyze website audit results and provide specific, actionable recommendations that a web agency can use to sell their services.

Your recommendations should be:
1. SPECIFIC to the website and issues found
2. ACTIONABLE with clear next steps
3. SALES-ORIENTED to help agencies pitch improvements
4. PRIORITIZED based on business impact

For each audit category, provide a 1-2 sentence recommendation that:
- Explains the specific impact of the issue
- Suggests a concrete fix or improvement
- Emphasizes the business benefit (conversions, SEO, trust, etc.)

Respond in JSON format only.`;

export async function generateAIRecommendations(
    url: string,
    checks: ScanChecks,
    overallScore: number
): Promise<AIRecommendations | null> {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GROK_API_KEY;

    if (!apiKey) {
        console.log('[AI] No API key found, skipping AI recommendations');
        return null;
    }

    const prompt = `
Analyze this website audit for ${url} (Overall Score: ${overallScore}/100) and provide personalized recommendations.

AUDIT RESULTS:
${Object.entries(checks).map(([key, check]) =>
        `- ${check.title}: ${check.status.toUpperCase()} (${check.score}/100) - ${check.description}`
    ).join('\n')}

Provide recommendations in this exact JSON format:
{
    "security": "Recommendation for security...",
    "mobile": "Recommendation for mobile...",
    "performance": "Recommendation for performance...",
    "seo": "Recommendation for SEO...",
    "business": "Recommendation for tracking/analytics...",
    "content": "Recommendation for content...",
    "social": "Recommendation for social media...",
    "summary": "A 2-3 sentence executive summary of the website's health and top priorities",
    "priorityFixes": ["Top priority fix 1", "Priority fix 2", "Priority fix 3"]
}

IMPORTANT:
- For PASS items, acknowledge what's good but suggest next-level improvements
- For FAIL/WARNING items, emphasize urgency and business impact
- Keep each recommendation under 100 words
- Make recommendations specific to this website, not generic
`;

    try {
        // Try OpenRouter first (has access to many models)
        if (process.env.OPENROUTER_API_KEY) {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://leadscout.io',
                    'X-Title': 'LeadScout'
                },
                body: JSON.stringify({
                    model: 'anthropic/claude-3-haiku',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices?.[0]?.message?.content;
                if (content) {
                    // Extract JSON from the response
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        return JSON.parse(jsonMatch[0]) as AIRecommendations;
                    }
                }
            }
        }

        // Fallback to Grok API
        if (process.env.GROK_API_KEY) {
            const response = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'grok-beta',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices?.[0]?.message?.content;
                if (content) {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        return JSON.parse(jsonMatch[0]) as AIRecommendations;
                    }
                }
            }
        }

        return null;
    } catch (error) {
        console.error('[AI] Failed to generate recommendations:', error);
        return null;
    }
}

/**
 * Fallback static recommendations if AI fails
 */
export function getStaticRecommendation(checkKey: string, status: string, description: string): string {
    const recommendations: Record<string, Record<string, string>> = {
        security: {
            fail: 'Install an SSL certificate (free via Let\'s Encrypt) immediately. Without HTTPS, visitors see "Not Secure" warnings and Google penalizes your SEO rankings.',
            warning: 'Your SSL is configured but consider enabling HSTS and ensuring all resources load over HTTPS to maximize security scores.',
            pass: 'SSL is properly configured. Consider adding security headers (CSP, X-Frame-Options) for enterprise-level protection.'
        },
        mobile: {
            fail: 'Add a viewport meta tag urgently. Over 60% of web traffic is mobile - without it, your site is unusable on phones and tablets.',
            warning: 'Mobile viewport is set but test on various devices. Consider larger tap targets and thumb-friendly navigation.',
            pass: 'Mobile responsive design detected. Optimize images for mobile and ensure Core Web Vitals pass on mobile devices.'
        },
        performance: {
            fail: 'Slow loading is costing you customers. Compress images, enable caching, use a CDN, and minimize JavaScript to improve speed.',
            warning: 'Loading speed is acceptable but can improve. Lazy load images, defer non-critical scripts, and optimize your hosting.',
            pass: 'Great loading speed! Maintain performance by monitoring Core Web Vitals and optimizing new content as you add it.'
        },
        seo: {
            fail: 'Missing critical SEO elements. Add meta title, description, heading hierarchy, and alt text for images.',
            warning: 'Basic SEO in place but needs improvement. Optimize meta descriptions, add structured data, and improve internal linking.',
            pass: 'SEO fundamentals are solid. Focus on content strategy, backlink building, and featured snippet optimization.'
        },
        business: {
            fail: 'No analytics tracking means no visibility into visitor behavior. Install Google Analytics 4 and conversion tracking today.',
            warning: 'Some tracking detected but may be incomplete. Verify tracking is firing correctly and set up conversion goals.',
            pass: 'Analytics tracking is active. Set up advanced features like event tracking, funnels, and remarketing audiences.'
        },
        content: {
            fail: 'Outdated content signals neglect to visitors. Update copyright dates, refresh testimonials, and add recent case studies.',
            warning: 'Content could be fresher. Start a blog, update key pages quarterly, and showcase recent work.',
            pass: 'Content appears current. Consider adding a blog strategy and updating evergreen content annually.'
        },
        social: {
            fail: 'Broken social links hurt credibility. Fix or remove dead links immediately.',
            warning: 'No social links found. Add links to active business profiles to build trust and engagement.',
            pass: 'Social profiles are linked. Consider embedding feeds or adding sharing buttons to increase engagement.'
        }
    };

    return recommendations[checkKey]?.[status] ||
        'Review this area for potential improvements to enhance user experience and conversions.';
}
