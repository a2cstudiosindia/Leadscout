"use client";

import { useEffect, useState } from "react";
import { trackPublicReportView, trackPublicReportCtaClick } from "@/app/hub-actions";
import { 
    ShieldCheck, 
    Smartphone, 
    Zap, 
    Search, 
    Target, 
    FileText, 
    Share2, 
    Calendar, 
    ExternalLink, 
    CheckCircle2, 
    AlertTriangle, 
    XCircle,
    ArrowUpRight,
    Building2,
    Check
} from "lucide-react";

interface PublicReportProps {
    slug: string;
    report: {
        slug: string;
        businessName: string;
        websiteUrl: string;
        overallScore: number;
        scanData: any;
        createdAt?: string;
        agency: {
            name: string;
            logoUrl: string | null;
            calendarLink: string | null;
        };
    };
}

export default function PublicReportView({ slug, report }: PublicReportProps) {
    const [copied, setCopied] = useState(false);
    const checks = report.scanData?.checks || {};
    const priorityFixes: string[] = report.scanData?.priorityFixes || [];
    const aiSummary: string = report.scanData?.aiSummary || "";

    useEffect(() => {
        // Track report view
        trackPublicReportView(slug).catch(console.error);
    }, [slug]);

    const handleCtaClick = () => {
        trackPublicReportCtaClick(slug).catch(console.error);
        if (report.agency.calendarLink) {
            window.open(report.agency.calendarLink, "_blank");
        } else {
            window.location.href = `mailto:contact@${report.agency.name.toLowerCase().replace(/\s+/g, '')}.com?subject=Website Audit Review for ${report.businessName}`;
        }
    };

    const copyLink = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getScoreBadge = (score: number) => {
        if (score >= 80) return { label: "Good Health", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", ring: "border-emerald-500" };
        if (score >= 50) return { label: "Needs Optimization", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", ring: "border-amber-500" };
        return { label: "Critical Attention", color: "text-rose-400 bg-rose-500/10 border-rose-500/20", ring: "border-rose-500" };
    };

    const badge = getScoreBadge(report.overallScore);

    const checkCategories = [
        { key: "security", label: "Security & SSL", icon: ShieldCheck, item: checks.security },
        { key: "mobile", label: "Mobile Responsiveness", icon: Smartphone, item: checks.mobile },
        { key: "performance", label: "Speed & Performance", icon: Zap, item: checks.performance },
        { key: "seo", label: "SEO & Search Discovery", icon: Search, item: checks.seo },
        { key: "business", label: "Analytics & Tracking", icon: Target, item: checks.business },
        { key: "content", label: "Content Freshness", icon: FileText, item: checks.content },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
            {/* Top Navigation Bar with Agency White-label Branding */}
            <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {report.agency.logoUrl ? (
                            <img 
                                src={report.agency.logoUrl} 
                                alt={report.agency.name} 
                                className="h-9 w-auto object-contain rounded" 
                            />
                        ) : (
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                                <Building2 className="w-5 h-5" />
                            </div>
                        )}
                        <div>
                            <span className="font-semibold text-sm tracking-tight text-white block">
                                {report.agency.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block -mt-0.5">
                                Verified Client Audit Report
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={copyLink}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition"
                            title="Copy report link"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                            <span>{copied ? "Copied!" : "Share"}</span>
                        </button>
                        <button
                            onClick={handleCtaClick}
                            className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Book Consultation</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
                <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-900/40 p-6 sm:p-10 shadow-2xl backdrop-blur-md overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div className="space-y-3 max-w-2xl">
                            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
                                <span>Performance & Revenue Audit</span>
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                                {report.businessName}
                            </h1>
                            <p className="text-slate-400 text-sm sm:text-base flex items-center space-x-2">
                                <span>Analyzed Website:</span>
                                <a 
                                    href={report.websiteUrl.startsWith('http') ? report.websiteUrl : `https://${report.websiteUrl}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-indigo-400 hover:text-indigo-300 underline font-mono text-xs sm:text-sm inline-flex items-center gap-1"
                                >
                                    {report.websiteUrl}
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </p>
                            <p className="text-xs text-slate-500">
                                Audit performed on {report.createdAt ? new Date(report.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}
                            </p>
                        </div>

                        {/* Overall Score Circle */}
                        <div className="flex flex-col items-center justify-center bg-slate-950/60 border border-slate-800 p-6 rounded-2xl shadow-inner min-w-[200px]">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Overall Health Score
                            </span>
                            <div className="relative flex items-center justify-center">
                                <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                                    {report.overallScore}
                                </span>
                                <span className="text-slate-500 text-lg font-bold ml-1 self-end mb-2">/100</span>
                            </div>
                            <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                                {badge.label}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Priority Fixes Alert Box */}
                {priorityFixes.length > 0 && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4">
                        <div className="flex items-center space-x-2.5 text-amber-400">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <h2 className="text-base font-bold">Top Priority Opportunities Identified</h2>
                        </div>
                        <p className="text-sm text-slate-300">
                            Fixing these critical bottlenecks will directly boost your search rankings, mobile conversion rate, and revenue potential:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {priorityFixes.map((fix, idx) => (
                                <div key={idx} className="flex items-start space-x-2.5 text-sm bg-slate-900/60 border border-amber-500/20 p-3 rounded-xl text-slate-200">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex-shrink-0">
                                        {idx + 1}
                                    </span>
                                    <span>{fix}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Executive Summary */}
                {aiSummary && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-2">
                        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                            Executive Analysis
                        </span>
                        <p className="text-sm leading-relaxed text-slate-300">
                            {aiSummary}
                        </p>
                    </div>
                )}

                {/* Category Audits Grid */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        Detailed Audit Breakdown
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {checkCategories.map((category) => {
                            const Icon = category.icon;
                            const item = category.item;
                            const status = item?.status || 'warning';
                            const score = item?.score ?? 0;

                            const statusIcon = 
                                status === 'pass' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> :
                                status === 'fail' ? <XCircle className="w-5 h-5 text-rose-400" /> :
                                <AlertTriangle className="w-5 h-5 text-amber-400" />;

                            return (
                                <div 
                                    key={category.key} 
                                    className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col justify-between hover:border-slate-700 transition"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2.5">
                                                <div className="p-2 rounded-lg bg-slate-800 text-indigo-400">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className="font-semibold text-sm text-slate-100">
                                                    {category.label}
                                                </span>
                                            </div>
                                            {statusIcon}
                                        </div>

                                        <p className="text-xs text-slate-400 leading-normal">
                                            {item?.description || "Scan details for this category."}
                                        </p>

                                        {item?.recommendation && (
                                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 text-xs text-slate-300">
                                                <span className="font-semibold text-indigo-300 block mb-0.5">Recommendation:</span>
                                                {item.recommendation}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                                        <span>Status</span>
                                        <span className="font-mono font-semibold uppercase text-slate-200">
                                            {status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Conversion Action Card */}
                <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-slate-950 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="max-w-2xl mx-auto space-y-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-block">
                            Next Steps
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            Ready to Fix These Issues & Grow Revenue?
                        </h2>
                        <p className="text-sm sm:text-base text-slate-300">
                            Schedule a 15-minute walkthrough with <strong className="text-white">{report.agency.name}</strong> to review your customized implementation roadmap.
                        </p>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleCtaClick}
                            className="inline-flex items-center space-x-2 px-8 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition"
                        >
                            <Calendar className="w-4 h-4" />
                            <span>Schedule Strategy Call</span>
                            <ArrowUpRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>

                    <p className="text-xs text-slate-500">
                        No obligation • Expert diagnosis • 100% confidential
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
                <p>
                    Audit generated for {report.businessName} by {report.agency.name} via LeadScout Hub.
                </p>
            </footer>
        </div>
    );
}
