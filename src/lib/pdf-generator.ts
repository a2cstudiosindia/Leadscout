import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ScanReport } from './scanner/types';

export function generatePDF(report: ScanReport) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(33, 150, 243); // Blue
    doc.text("Website Audit Report", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Target: ${report.url}`, 14, 30);
    doc.text(`Date: ${new Date(report.scannedAt).toLocaleDateString()}`, 14, 36);

    // Score Circle (Simulated)
    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(2);
    doc.circle(170, 25, 12);
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(report.overallScore.toString(), 166, 27);

    doc.setFontSize(10);
    doc.text("Score", 165, 42);

    // Summary Table
    const tableData = Object.values(report.checks)
        .filter((c: any) => c.title) // Ensure valid checks
        .map((c: any) => [
            c.title,
            c.status.toUpperCase(),
            c.score + '/100',
            c.description
        ]);

    autoTable(doc, {
        startY: 50,
        head: [['Check', 'Status', 'Score', 'Details']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [33, 150, 243], textColor: 255 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40 },
            1: { cellWidth: 25 },
            2: { cellWidth: 20 },
            3: { cellWidth: 'auto' }
        },
        didParseCell: function (data: any) {
            if (data.section === 'body' && data.column.index === 1) {
                const status = data.cell.raw as string;
                if (status === 'FAIL') data.cell.styles.textColor = [220, 53, 69]; // Red
                if (status === 'PASS') data.cell.styles.textColor = [40, 167, 69]; // Green
                if (status === 'WARNING') data.cell.styles.textColor = [255, 193, 7]; // Orange
            }
        }
    });

    // Footer (Sales Pitch)
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("How we can help fix this:", 14, finalY);

    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text([
        "We found critical issues that are likely hurting your conversion rates.",
        "As a specialized web agency, we can fix these errors in less than 48 hours.",
        "Contact us at: hello@agency.com"
    ], 14, finalY + 10);

    doc.save(`audit_report_${report.url.replace(/[^a-z0-9]/gi, '_')}.pdf`);
}
