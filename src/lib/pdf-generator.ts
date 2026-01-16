import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ScanReport } from './scanner/types';

interface AgencyBranding {
    name?: string;
    logoUrl?: string;
    email?: string;
    phone?: string;
    primaryColor?: [number, number, number]; // RGB
}

export function generatePDF(report: ScanReport, branding?: AgencyBranding) {
    const doc = new jsPDF();
    const primaryColor = branding?.primaryColor || [33, 150, 243]; // Default blue

    // ===== PAGE 1: EXECUTIVE SUMMARY =====

    // Header with branding
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text(branding?.name || "Website Audit Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Target: ${report.url}`, 14, 32);
    doc.text(`Date: ${new Date(report.scannedAt).toLocaleDateString()}`, 14, 38);

    // Score Circle
    const scoreColor = report.overallScore >= 80 ? [40, 167, 69] :
        report.overallScore >= 50 ? [255, 153, 0] : [220, 53, 69];

    doc.setDrawColor(...scoreColor as [number, number, number]);
    doc.setLineWidth(3);
    doc.circle(175, 30, 15);
    doc.setFontSize(18);
    doc.setTextColor(...scoreColor as [number, number, number]);
    doc.text(report.overallScore.toString(), report.overallScore >= 10 ? 168 : 171, 34);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("SCORE", 169, 50);

    // Executive Summary Box
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, 55, 182, 35, 3, 3, 'F');

    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text("Executive Summary", 20, 65);

    doc.setFontSize(10);
    doc.setTextColor(80);

    const summaryText = report.aiSummary || generateSummary(report);
    const summaryLines = doc.splitTextToSize(summaryText, 170);
    doc.text(summaryLines.slice(0, 3), 20, 73);

    // Priority Fixes Box
    if (report.priorityFixes && report.priorityFixes.length > 0) {
        doc.setFillColor(255, 248, 240);
        doc.roundedRect(14, 95, 182, 30, 3, 3, 'F');

        doc.setFontSize(11);
        doc.setTextColor(180, 80, 0);
        doc.text("⚡ Priority Fixes", 20, 105);

        doc.setFontSize(9);
        doc.setTextColor(80);
        const fixesText = report.priorityFixes.slice(0, 3).map((f, i) => `${i + 1}. ${f}`).join('  •  ');
        doc.text(doc.splitTextToSize(fixesText, 170), 20, 113);
    }

    // Main Checks Table
    const coreChecks = ['security', 'mobile', 'performance', 'seo', 'business', 'content', 'social'];
    const tableData = coreChecks
        .map(key => {
            const check = (report.checks as any)[key];
            if (!check?.title) return null;
            return [
                check.title,
                check.status.toUpperCase(),
                `${check.score}/100`,
                check.description || '',
                check.recommendation || '-'
            ];
        })
        .filter(Boolean);

    autoTable(doc, {
        startY: report.priorityFixes?.length ? 130 : 95,
        head: [['Check', 'Status', 'Score', 'Finding', 'Recommendation']],
        body: tableData as any,
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor,
            textColor: 255,
            fontSize: 9,
            fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 28 },
            1: { cellWidth: 18, halign: 'center' },
            2: { cellWidth: 16, halign: 'center' },
            3: { cellWidth: 50 },
            4: { cellWidth: 'auto', fontStyle: 'italic' }
        },
        didParseCell: (data: any) => {
            if (data.section === 'body' && data.column.index === 1) {
                const status = data.cell.raw as string;
                if (status === 'FAIL') data.cell.styles.textColor = [220, 53, 69];
                if (status === 'PASS') data.cell.styles.textColor = [40, 167, 69];
                if (status === 'WARNING') data.cell.styles.textColor = [255, 153, 0];
            }
        }
    });

    // ===== PAGE 2: DETAILED TECHNICAL CHECKS =====
    const advancedChecks = ['metaTags', 'headings', 'accessibility', 'contactInfo', 'favicon', 'technicalSEO', 'images', 'httpsRedirect'];
    const hasAdvancedChecks = advancedChecks.some(key => (report.checks as any)[key]);

    if (hasAdvancedChecks) {
        doc.addPage();

        doc.setFontSize(16);
        doc.setTextColor(...primaryColor);
        doc.text("Technical Deep Dive", 14, 20);

        const advancedTableData = advancedChecks
            .map(key => {
                const check = (report.checks as any)[key];
                if (!check?.title) return null;
                return [
                    check.title,
                    check.status.toUpperCase(),
                    `${check.score}/100`,
                    check.description || ''
                ];
            })
            .filter(Boolean);

        if (advancedTableData.length > 0) {
            autoTable(doc, {
                startY: 28,
                head: [['Check', 'Status', 'Score', 'Details']],
                body: advancedTableData as any,
                theme: 'grid',
                headStyles: {
                    fillColor: [100, 100, 100],
                    textColor: 255,
                    fontSize: 9
                },
                bodyStyles: { fontSize: 8 },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 35 },
                    1: { cellWidth: 20, halign: 'center' },
                    2: { cellWidth: 18, halign: 'center' },
                    3: { cellWidth: 'auto' }
                },
                didParseCell: (data: any) => {
                    if (data.section === 'body' && data.column.index === 1) {
                        const status = data.cell.raw as string;
                        if (status === 'FAIL') data.cell.styles.textColor = [220, 53, 69];
                        if (status === 'PASS') data.cell.styles.textColor = [40, 167, 69];
                        if (status === 'WARNING') data.cell.styles.textColor = [255, 153, 0];
                    }
                }
            });
        }
    }

    // ===== FOOTER ON ALL PAGES =====
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Sales pitch on last page
        if (i === pageCount) {
            const y = (doc as any).lastAutoTable?.finalY || 200;
            const startY = Math.min(y + 20, 250);

            doc.setFillColor(240, 248, 255);
            doc.roundedRect(14, startY, 182, 35, 3, 3, 'F');

            doc.setFontSize(12);
            doc.setTextColor(...primaryColor);
            doc.text("How We Can Help", 20, startY + 10);

            doc.setFontSize(9);
            doc.setTextColor(60);
            doc.text([
                "We identified critical issues that may be costing you customers every day.",
                "Our team can fix these problems quickly and professionally.",
                "",
                `Contact: ${branding?.email || 'hello@agency.com'}  ${branding?.phone || ''}`
            ], 20, startY + 18);
        }

        // Page number footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, 100, 290, { align: 'center' });
        doc.text(`Generated by ${branding?.name || 'LeadScout'}`, 14, 290);
    }

    doc.save(`audit_report_${report.url.replace(/[^a-z0-9]/gi, '_')}.pdf`);
}

function generateSummary(report: ScanReport): string {
    const failedChecks = Object.values(report.checks).filter((c: any) => c?.status === 'fail').length;
    const warningChecks = Object.values(report.checks).filter((c: any) => c?.status === 'warning').length;
    const passedChecks = Object.values(report.checks).filter((c: any) => c?.status === 'pass').length;

    if (report.overallScore >= 80) {
        return `This website scores ${report.overallScore}/100, showing good overall health with ${passedChecks} checks passing. There are ${warningChecks} minor improvements to consider for optimal performance and user experience.`;
    } else if (report.overallScore >= 50) {
        return `This website scores ${report.overallScore}/100 with ${failedChecks} critical issues and ${warningChecks} warnings that need attention. Addressing these could significantly improve conversions and search rankings.`;
    } else {
        return `This website scores ${report.overallScore}/100, indicating serious issues that are likely hurting business. ${failedChecks} critical problems were found that require immediate attention to improve user trust and search visibility.`;
    }
}
