import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicShareableReport } from '@/app/hub-actions';
import PublicReportView from './PublicReportView';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const res = await getPublicShareableReport(slug);
    if (!res.success || !res.report) {
        return {
            title: 'Website Audit Report | LeadScout',
            description: 'Interactive website performance and security audit report.',
        };
    }

    return {
        title: `${res.report.businessName} - Website Performance & Audit Report`,
        description: `Comprehensive website audit report for ${res.report.websiteUrl}. Score: ${res.report.overallScore}/100. Prepared by ${res.report.agency.name}.`,
    };
}

export default async function ReportPage({ params }: PageProps) {
    const { slug } = await params;
    const res = await getPublicShareableReport(slug);

    if (!res.success || !res.report) {
        notFound();
    }

    return <PublicReportView report={res.report} slug={slug} />;
}
