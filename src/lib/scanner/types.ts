export interface AuditResult {
    score: number; // 0 to 100
    title: string;
    description: string;
    status: 'pass' | 'fail' | 'warning';
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
        business: AuditResult; // Pixels, Contact info
        content: AuditResult;
        social: AuditResult;
    };
}

export interface ScannerOptions {
    checkMobile?: boolean;
    checkPerformance?: boolean;
    checkSEO?: boolean;
}
