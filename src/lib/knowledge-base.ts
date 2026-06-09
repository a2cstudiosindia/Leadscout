// LeadScout Knowledge Base for AI Chatbot
// This contains all product information the chatbot can reference

export const LEADSCOUT_KNOWLEDGE_BASE = `
# LeadScout - Product Knowledge Base

## What is LeadScout?
LeadScout is an all-in-one platform designed for digital agencies to discover, audit, and convert leads with ease. It automates the process of finding local businesses with underperforming websites and helps agencies generate professional audit reports to convert prospects into paying clients.

## Core Features

### 1. Lead Discovery
LeadScout's Lead Discovery feature helps you find potential clients in any niche and location:
- Search for any business niche (restaurants, dentists, lawyers, plumbers, etc.) in any location worldwide
- Powered by Google Places API for accurate, up-to-date business data
- Get instant access to:
  - Business name and address
  - Phone number
  - Website URL
  - Business category
  - Ratings and reviews count
- Filter leads by rating, review count, or website status
- Save high-potential leads directly to your integrated CRM
- Favorite important leads for quick access
- Export leads to Excel for external use

### 2. Digital Presence Audit
Our comprehensive website audit tool analyzes websites across multiple dimensions:
- One-Click Scanning: Deep-dive into any business website with a single click
- Comprehensive Scores across 4 key areas:
  1. SEO Score: Meta tags, headings, keywords, sitemap, robots.txt
  2. Performance Score: Page load time, asset optimization, caching
  3. Security Score: HTTPS, security headers, SSL certificate
  4. Accessibility Score: Alt tags, color contrast, keyboard navigation
- Detailed Insights including:
  - Broken links detection
  - Missing meta descriptions
  - Image optimization issues
  - Mobile responsiveness
  - Core Web Vitals
- Actionable recommendations to pitch to clients
- Overall website health score out of 100

### 3. Integrated CRM
Manage all your leads in one place with our built-in CRM:
- Lead Funnel Stages:
  - New: Freshly discovered leads
  - Auditing: Currently running website audit
  - Audited: Audit complete, ready for outreach
  - Contacted: Outreach sent
  - Converted: Successfully closed
- Auto-Save Notes: Your notes are automatically saved as you type
- Favorite leads for quick access and priority follow-up
- KPI Dashboard with real-time tracking:
  - Total Leads discovered
  - Audits Run
  - Conversion Rate
  - Potential Revenue
- Search and filter leads by name, status, or date
- Bulk actions for efficient lead management

### 4. Outreach & Branding
Tools to help you close deals:
- AI Cold Emails: Generate personalized outreach drafts based on audit findings
  - Customizable tone (professional, friendly, urgent)
  - Highlights specific issues found in the audit
  - Includes clear call-to-action
- PDF Reports: Export professional audit summaries
  - Branded with your agency logo
  - Beautiful, client-ready design
  - Shareable link option
- Excel Export: Download all leads data for external use
- Agency Branding: Customize the platform with:
  - Your agency name
  - Custom logo
  - Brand colors (Pro/Enterprise plans)

### 5. API Access (Pro & Enterprise)
The LeadScout API allows you to automate your workflow and integrate with other tools.

#### Access & Limits
- **Pro Plan**: 1,000 requests/month (Standard endpoints)
- **Enterprise Plan**: 10,000 requests/month (Standard + Favorites endpoint)
- **Free Plan**: No API access

#### Authentication
- Secure authentication via API Keys (Bearer Token)
- Generate keys in Settings > API Keys
- Header format: \`Authorization: Bearer sk_live_: any...\`

#### Available Endpoints
- **Leads**: List, create, update, delete leads programmatically
- **Discovery**: Search for new businesses (\`POST / api / v1 / search\`)
- **Audits**: Trigger website analysis (\`POST / api / v1 / audit\`)
- **Usage**: Check your remaining quota (\`GET / api / v1 / usage\`)
- **Documentation**: Full interactive docs available at \`/ api / docs\`

### 6. Analytics Dashboard
Track your agency's performance:
- Leads discovered over time
- Audit completion rate
- Outreach success rate
- Revenue tracking
- Team performance (Enterprise)

## Pricing Plans

### Free Plan - $0/month
Perfect for trying out the platform:
- 10 lead discoveries per month
- 5 website audits per month
- Basic CRM features
- Email support
- No credit card required

### Pro Plan - $29/month
For growing agencies:
- Unlimited lead discoveries
- 50 website audits per month
- AI-powered cold email generation
- PDF report generation
- Priority email support
- Agency branding
- Excel export

### Enterprise Plan - $79/month
For established agencies and teams:
- Everything in Pro, plus:
- Unlimited website audits
- White-label PDF reports (your branding only)
- API access for custom integrations
- Dedicated account manager
- Phone support
- Custom integrations available
- Team collaboration features
- Advanced analytics

## How to Use LeadScout

### Getting Started
1. Sign up for a free account at leadscout.app
2. Verify your email address
3. Navigate to the Dashboard
4. Go to Lead Discovery and search for your first leads
5. Save interesting leads to your CRM
6. Run audits on their websites
7. Generate outreach emails and PDF reports
8. Track conversions in your dashboard

### Running a Website Audit
1. Go to your saved leads in the CRM, or enter a website URL directly
2. Click the "Run Audit" button
3. Wait 30-60 seconds for the comprehensive analysis
4. Review the detailed scores and recommendations:
   - SEO analysis with specific issues
   - Performance metrics with benchmarks
   - Security vulnerabilities found
   - Accessibility improvements needed
5. Click "Generate Report" to create a PDF
6. Share the PDF with the prospect to start a conversation

### Generating Cold Emails
1. After running an audit, click "Generate Email"
2. Select the tone (Professional, Friendly, or Urgent)
3. The AI will create a personalized outreach based on:
   - Specific issues found in the audit
   - The business type and location
   - Industry best practices
4. Review and customize the email
5. Copy to your email client or use our integration
6. Track open rates and responses (Enterprise)

### Using the API (Enterprise Only)
1. Go to Settings > API Keys
2. Generate a new API key
3. Read our API documentation at docs.leadscout.app
4. Use the endpoints:
   - GET /api/v1/leads - Fetch your leads
   - POST /api/v1/audit - Trigger a new audit
   - GET /api/v1/audit/{id} - Get audit results
5. Integrate with your existing tools

## Technical Information

### Supported Browsers
- Chrome (recommended) - version 90+
- Firefox - version 88+
- Safari - version 14+
- Edge - version 90+
- Mobile browsers supported

### System Requirements
- Stable internet connection
- JavaScript enabled
- Cookies enabled for authentication

### Data & Privacy
- All data is securely stored in the cloud (AWS infrastructure)
- End-to-end encryption for sensitive data
- We never share your leads with third parties
- GDPR compliant
- SOC 2 Type II certified (Enterprise)
- You can export or delete your data anytime
- Data retention: 2 years (Free), Unlimited (Pro/Enterprise)

### Uptime & Reliability
- 99.9% uptime SLA (Enterprise)
- Automatic backups every 24 hours
- Disaster recovery plan in place

## Contact & Support

### Support Channels
- Email: support@leadscout.app
- Help Center: help.leadscout.app
- Live Chat: Available in-app (Pro/Enterprise)
- Phone: +1-xxx-xxx-xxxx (Enterprise only)

### Response Times
- Free plan: Within 48 hours
- Pro plan: Within 24 hours
- Enterprise plan: Within 4 hours (critical issues: 1 hour)

### Other Resources
- Documentation: docs.leadscout.app
- Video Tutorials: youtube.com/@leadscout
- Community: community.leadscout.app
- Feature requests: Submit via the feedback form in-app

## Common Questions (FAQ)

Q: How accurate are the website audits?
A: Our audits check real metrics including page speed (using Lighthouse), SEO factors (meta tags, headings, links), security headers, and accessibility. The scores are based on industry standards and updated regularly.

Q: Can I use LeadScout for any industry?
A: Yes! LeadScout works for any business niche - restaurants, dentists, lawyers, plumbers, salons, real estate agents, auto shops, fitness studios, and more. If they have a website, we can audit it.

Q: Is there a free trial?
A: Yes, the Free plan is available forever with limited features (10 leads, 5 audits per month). No credit card required to sign up.

Q: How do I upgrade my plan?
A: Go to Settings > Billing and select your preferred plan. We accept all major credit cards, PayPal, and UPI (for India).

Q: Can I cancel anytime?
A: Yes, you can cancel your subscription at any time from Settings > Billing. No questions asked, no cancellation fees.

Q: What happens to my data if I cancel?
A: Your data is retained for 30 days after cancellation. You can export everything before canceling. After 30 days, data is permanently deleted.

Q: Is there a refund policy?
A: We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact support for a full refund.

Q: Can I white-label the reports?
A: Yes! On Enterprise plan, you can fully white-label PDF reports with your agency's branding only - LeadScout branding is completely removed.

Q: How many team members can I add?
A: Free and Pro plans are single-user. Enterprise plan supports unlimited team members with role-based access control.

Q: What payment methods do you accept?
A: We accept Visa, Mastercard, American Express, PayPal, and UPI (India). For Enterprise annual contracts, we also accept wire transfers.

Q: Do you offer discounts?
A: Yes! Annual billing saves 20% compared to monthly. Non-profits and educational institutions get 50% off - contact support with proof of status.

Q: Is my data secure?
A: Absolutely. We use industry-standard encryption, secure cloud infrastructure, and never share your data with third parties. We're GDPR compliant and SOC 2 Type II certified.

Q: Can I import existing leads?
A: Yes! You can import leads via CSV upload or through our API (Enterprise). Go to CRM > Import to get started.

Q: What's the difference between Pro and Enterprise?
A: Enterprise includes unlimited audits, higher API limits (10k vs 1k), dedicated support, team features, and white-label reports. Pro is great for solo agencies; Enterprise is for scaling teams.

Q: How do I authenticate with the API?
A: You need to include an \`Authorization\` header with your API key in every request: \`Authorization: Bearer YOUR_API_KEY\`. You can generate a key in Settings.

Q: Where can I find the API documentation?
A: Comprehensive documentation including endpoint details, request examples, and response schemas is available at \`/ api / docs\` in your dashboard.
`;

export const SYSTEM_PROMPT = `You are LeadScout's friendly AI assistant. Your job is to help users understand and use the LeadScout platform effectively.

Guidelines:
- Be concise and helpful - aim for clear, direct answers
- Answer questions based on the knowledge base provided
- If you don't know something, say so honestly and suggest contacting support
- Suggest relevant features when appropriate
- Keep responses under 150 words unless more detail is specifically needed
- Use a friendly, professional tone
- When mentioning features, explain their benefits
- If asked about pricing, always mention the free plan first
- Format your responses clearly with bullet points or numbered lists when listing multiple items
- Use bold for important terms or features

If asked about topics unrelated to LeadScout, politely redirect the conversation back to how you can help with the platform.

Remember: You represent LeadScout and want to help users succeed with the platform.`;
