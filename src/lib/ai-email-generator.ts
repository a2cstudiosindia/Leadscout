/**
 * AI-Powered Cold Email Generator
 * Generates personalized outreach emails based on website audit results
 */

interface AuditCheck {
    title: string;
    description: string;
    status: 'pass' | 'fail' | 'warning';
    score: number;
    recommendation?: string;
}

interface EmailGenerationInput {
    businessName: string;
    websiteUrl: string;
    ownerName?: string;
    industry?: string;
    city?: string;
    overallScore: number;
    checks: Record<string, AuditCheck>;
    agencyName?: string;
    agencyEmail?: string;
    agencyPhone?: string;
}

interface GeneratedEmail {
    subject: string;
    body: string;
    followUpSubject?: string;
    followUpBody?: string;
}

const SYSTEM_PROMPT = `You are an expert sales copywriter for a web development agency. Your job is to write compelling cold emails that convert website audit findings into sales opportunities.

Your emails should:
1. Be PERSONAL and reference specific issues found
2. Create URGENCY without being pushy
3. Provide VALUE by explaining business impact
4. Include a clear CALL TO ACTION
5. Be CONCISE (under 150 words for main body)
6. Sound HUMAN, not robotic or salesy

Output format: JSON with subject and body fields. Use \\n for line breaks in body.`;

export async function generateColdEmail(input: EmailGenerationInput): Promise<GeneratedEmail | null> {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GROK_API_KEY;

    if (!apiKey) {
        console.log('[EMAIL] No API key found, using template email');
        return generateTemplateEmail(input);
    }

    // Identify critical issues (fail or warning with low score)
    const criticalIssues = Object.entries(input.checks)
        .filter(([_, check]) => check.status === 'fail' || (check.status === 'warning' && check.score < 50))
        .map(([key, check]) => ({
            category: key,
            title: check.title,
            description: check.description,
            recommendation: check.recommendation
        }));

    const passedChecks = Object.entries(input.checks)
        .filter(([_, check]) => check.status === 'pass')
        .map(([key, check]) => check.title);

    const prompt = `
Generate a cold outreach email for a web agency to send to a business owner.

BUSINESS DETAILS:
- Business Name: ${input.businessName}
- Website: ${input.websiteUrl}
- Owner Name: ${input.ownerName || 'Business Owner'}
- Industry: ${input.industry || 'Local Business'}
- Location: ${input.city || 'their area'}
- Overall Website Score: ${input.overallScore}/100

CRITICAL ISSUES FOUND (${criticalIssues.length}):
${criticalIssues.map((issue, i) => `${i + 1}. ${issue.title}: ${issue.description}`).join('\n')}

WHAT'S WORKING WELL:
${passedChecks.length > 0 ? passedChecks.join(', ') : 'Limited positives found'}

AGENCY INFO:
- Agency Name: ${input.agencyName || 'our web agency'}
- Contact Email: ${input.agencyEmail || 'hello@agency.com'}
- Phone: ${input.agencyPhone || ''}

Generate a JSON response with:
{
    "subject": "Email subject line (under 60 chars, personalized)",
    "body": "Email body with \\n for line breaks",
    "followUpSubject": "Follow-up email subject",
    "followUpBody": "Follow-up email body for 3 days later"
}

IMPORTANT:
- Lead with a specific issue, not generic fluff
- Mention their business name in the subject
- Include 2-3 specific issues in the body
- End with a soft CTA (free audit, quick call, etc.)
- Make it feel like a helpful notification, not a sales pitch
`;

    try {
        // Try OpenRouter first
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
                    temperature: 0.8,
                    max_tokens: 800
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices?.[0]?.message?.content;
                if (content) {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        return JSON.parse(jsonMatch[0]) as GeneratedEmail;
                    }
                }
            }
        }

        // Fallback to Grok
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
                    temperature: 0.8,
                    max_tokens: 800
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices?.[0]?.message?.content;
                if (content) {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        return JSON.parse(jsonMatch[0]) as GeneratedEmail;
                    }
                }
            }
        }

        // Fallback to template
        return generateTemplateEmail(input);
    } catch (error) {
        console.error('[EMAIL] Failed to generate email:', error);
        return generateTemplateEmail(input);
    }
}

/**
 * Template-based email generator (fallback when AI is unavailable)
 */
function generateTemplateEmail(input: EmailGenerationInput): GeneratedEmail {
    const criticalIssues = Object.entries(input.checks)
        .filter(([_, check]) => check.status === 'fail' || check.status === 'warning')
        .slice(0, 3);

    const issuesList = criticalIssues
        .map(([_, check]) => `• ${check.title}: ${check.description}`)
        .join('\n');

    const ownerName = input.ownerName || 'there';
    const agencyName = input.agencyName || 'our agency';

    return {
        subject: `I found ${criticalIssues.length} issues on ${input.businessName}'s website`,
        body: `Hi ${ownerName},

I was researching ${input.industry || 'local'} businesses in ${input.city || 'your area'} and came across ${input.businessName}'s website.

I ran a quick technical audit and found a few issues that might be affecting your online presence:

${issuesList}

Your current website score is ${input.overallScore}/100. These issues are relatively straightforward to fix and could significantly improve your customer experience and search rankings.

Would you be open to a quick 15-minute call to discuss? I can share the full audit report and some quick wins you could implement.

Best,
${agencyName}
${input.agencyEmail || ''}
${input.agencyPhone || ''}`.trim(),
        followUpSubject: `Quick follow-up re: ${input.businessName} website`,
        followUpBody: `Hi ${ownerName},

Just wanted to follow up on my previous email about ${input.businessName}'s website.

I know you're busy running your business, but I wanted to make sure you saw the issues I found. Some of them, like ${criticalIssues[0]?.[1]?.title || 'security concerns'}, can really hurt your credibility with potential customers.

Happy to send over the full report if you'd like to see the details - no strings attached.

Let me know!

${agencyName}`.trim()
    };
}

/**
 * Generate multiple email variations for A/B testing
 */
export async function generateEmailVariations(input: EmailGenerationInput, count: number = 3): Promise<GeneratedEmail[]> {
    const variations: GeneratedEmail[] = [];

    for (let i = 0; i < count; i++) {
        const email = await generateColdEmail(input);
        if (email) {
            variations.push(email);
        }
    }

    return variations;
}
