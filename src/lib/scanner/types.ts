export interface AuditResult {
    score: number; // 0 to 100
    title: string;
    description: string;
    status: 'pass' | 'fail' | 'warning';
    recommendation?: string; // Actionable suggestion for improvement
    details?: Record<string, any>;
}

export interface ScanReport {
    url: string;
    scannedAt: string;
    overallScore: number;
    checks: {
        // Original checks
        security: AuditResult;
        mobile: AuditResult;
        performance: AuditResult;
        seo: AuditResult;
        business: AuditResult; // Pixels, Contact info
        content: AuditResult;
        social: AuditResult;
        // New advanced checks
        metaTags?: AuditResult;
        headings?: AuditResult;
        accessibility?: AuditResult;
        contactInfo?: AuditResult;
        favicon?: AuditResult;
        technicalSEO?: AuditResult;
        images?: AuditResult;
        httpsRedirect?: AuditResult;
    };
    // AI-generated summary (optional)
    aiSummary?: string;
    priorityFixes?: string[];
}

export interface ScannerOptions {
    checkMobile?: boolean;
    checkPerformance?: boolean;
    checkSEO?: boolean;
}
