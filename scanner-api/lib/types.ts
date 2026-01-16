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
        security: AuditResult;
        mobile: AuditResult;
        performance: AuditResult;
        seo: AuditResult;
        business: AuditResult;
        content: AuditResult;
        social: AuditResult;
        // Advanced checks
        metaTags: AuditResult;
        headings: AuditResult;
        accessibility: AuditResult;
        contactInfo: AuditResult;
        favicon: AuditResult;
        technicalSEO: AuditResult;
        images: AuditResult;
        httpsRedirect: AuditResult;
    };
    aiSummary?: string;
    priorityFixes?: string[];
}

export interface ScannerOptions {
    checkMobile?: boolean;
    checkPerformance?: boolean;
    checkSEO?: boolean;
}
