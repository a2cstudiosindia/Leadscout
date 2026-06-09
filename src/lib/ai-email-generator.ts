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

export type EmailTemplateVariant = 'friendly_audit' | 'urgent_security' | 'value_proposal';

export const EMAIL_TEMPLATES: Record<EmailTemplateVariant, { name: string; description: string }> = {
    friendly_audit: {
        name: 'Friendly Audit Share',
        description: 'Warm, helpful tone sharing audit findings',
    },
    urgent_security: {
        name: 'Urgent Security Alert',
        description: 'Emphasizes critical security and trust issues',
    },
    value_proposal: {
        name: 'Value Proposal',
        description: 'ROI-focused pitch with clear business value',
    },
};

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
    template?: EmailTemplateVariant;
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

function getTemplateInstructions(template: EmailTemplateVariant): string {
    switch (template) {
        case 'urgent_security':
            return 'Use an URGENT but professional tone. Lead with security/SSL issues. Emphasize customer trust and data protection risks. Subject should convey urgency.';
        case 'value_proposal':
            return 'Use a VALUE-FOCUSED tone. Lead with ROI and business impact (lost customers, lower rankings). Include specific numbers where possible. End with a clear proposal CTA.';
        case 'friendly_audit':
        default:
            return 'Use a FRIENDLY, helpful tone. Position yourself as someone who noticed issues and wants to help. Share findings like a helpful notification, not a sales pitch.';
    }
}

export async function generateColdEmail(input: EmailGenerationInput): Promise<GeneratedEmail | null> {
    const template = input.template || 'friendly_audit';
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GROK_API_KEY;

    if (!apiKey) {
        console.log('[EMAIL] No API key found, using template email');
        return generateTemplateEmail({ ...input, template });
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

TEMPLATE STYLE: ${EMAIL_TEMPLATES[template].name}
${getTemplateInstructions(template)}

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

        return generateTemplateEmail({ ...input, template });
    } catch (error) {
        console.error('[EMAIL] Failed to generate email:', error);
        return generateTemplateEmail({ ...input, template });
    }
}

/**
 * Template-based email generator (fallback when AI is unavailable)
 */
function generateTemplateEmail(input: EmailGenerationInput): GeneratedEmail {
    const template = input.template || 'friendly_audit';
    const criticalIssues = Object.entries(input.checks)
        .filter(([_, check]) => check.status === 'fail' || check.status === 'warning')
        .slice(0, 3);

    const issuesList = criticalIssues
        .map(([_, check]) => `• ${check.title}: ${check.description}`)
        .join('\n');

    const ownerName = input.ownerName || 'there';
    const agencyName = input.agencyName || 'our agency';
    const topIssue = criticalIssues[0]?.[1]?.title || 'website issues';

    const templates: Record<EmailTemplateVariant, GeneratedEmail> = {
        friendly_audit: {
            subject: `Quick audit of ${input.businessName}'s website`,
            body: `Hi ${ownerName},

I came across ${input.businessName} while researching ${input.industry || 'local'} businesses in ${input.city || 'your area'}.

I ran a quick website audit and noticed a few things worth addressing:

${issuesList}

Your site scored ${input.overallScore}/100 — nothing major, but a few quick fixes could help you get more customers online.

Happy to share the full report if you're interested. No pressure — just thought you'd want to know.

Best,
${agencyName}
${input.agencyEmail || ''}`.trim(),
            followUpSubject: `Following up — ${input.businessName} website audit`,
            followUpBody: `Hi ${ownerName},\n\nJust circling back on the audit I ran for ${input.businessName}. Happy to send the full report over if helpful.\n\n${agencyName}`.trim(),
        },
        urgent_security: {
            subject: `⚠️ Security issue on ${input.businessName}'s website`,
            body: `Hi ${ownerName},

I need to flag something important about ${input.businessName}'s website (${input.websiteUrl}).

During a routine audit, I found security issues that may affect customer trust:

${issuesList}

Visitors may see "Not Secure" warnings, which causes many people to leave immediately. This is fixable, but it shouldn't wait.

Can we schedule a quick 10-minute call this week? I can walk you through exactly what needs to be fixed.

${agencyName}
${input.agencyEmail || ''}`.trim(),
            followUpSubject: `Re: security concerns for ${input.businessName}`,
            followUpBody: `Hi ${ownerName},\n\nWanted to make sure you saw my note about ${topIssue} on your website. Happy to help fix this quickly.\n\n${agencyName}`.trim(),
        },
        value_proposal: {
            subject: `${input.businessName} — leaving revenue on the table?`,
            body: `Hi ${ownerName},

I analyzed ${input.businessName}'s website and found opportunities that could directly impact your bottom line:

${issuesList}

Current score: ${input.overallScore}/100. Businesses in your space typically see 20-40% more online inquiries after fixing these issues.

I'd like to propose a quick website refresh focused on the highest-impact fixes. Would a 15-minute call work this week?

${agencyName}
${input.agencyEmail || ''}`.trim(),
            followUpSubject: `ROI opportunity for ${input.businessName}`,
            followUpBody: `Hi ${ownerName},\n\nFollowing up on the website improvements I identified for ${input.businessName}. The fixes are straightforward and the ROI is clear.\n\n${agencyName}`.trim(),
        },
    };

    return templates[template];
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
