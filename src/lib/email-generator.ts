import { ScanReport } from "./scanner/types";

export function generateColdEmail(businessName: string, url: string, report: ScanReport) {
    const issues = [];
    if (report.checks.security.score < 50) issues.push("security risks (SSL)");
    if (report.checks.mobile.score < 50) issues.push("mobile responsiveness issues");
    if (report.checks.performance.score < 50) issues.push("slow load times");
    if (report.checks.business.score < 50) issues.push("missing tracking pixels (you are flying blind!)");

    const issueString = issues.length > 0
        ? `I ran a quick audit and noticed some critical errors like ${issues.join(' and ')}.`
        : "I ran a quick audit and while your site looks good, there are opportunities to convert more visitors.";

    const subject = `Question about ${businessName}'s website`;

    const body = `Hi ${businessName} Team,

I'm a local digital consultant and I was just browsing ${url}.

${issueString}

These issues are likely costing you customers every day. I specialize in fixing exactly these types of problems.

I generated a full PDF report detailing these errors. Would you be open to me sending it over?

Best,
[Your Name]`;

    return { subject, body };
}
