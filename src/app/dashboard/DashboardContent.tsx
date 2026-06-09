"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { runAudit, findLeads, saveLead, getLeads, saveReport, updateLead, deleteLead, getStats, toggleFavorite, exportLeadsToExcel, exportLeadsToCSV, getJobStatus, getScanJobs, generateEmail } from "../actions";
import { cn } from "@/lib/utils";
import { DiscoveredBusiness, BUSINESS_CATEGORIES } from "@/lib/discovery/types";
import { generatePDF } from "@/lib/pdf-generator";
import { generateColdEmail } from "@/lib/email-generator";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getSubscriptionInfo } from "@/lib/subscription";
import { getPriorityBadge } from "@/lib/lead-scoring";
import { EMAIL_TEMPLATES, type EmailTemplateVariant } from "@/lib/ai-email-generator";
import { Users, Search, Activity, Download, RefreshCw, Mail, Star, Phone, FileSpreadsheet, MapPin, Trash2, Zap, LayoutGrid, List, X, Copy, Clock } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState<'scan' | 'find' | 'leads'>('find');

    // Sync state with URL param
    useEffect(() => {
        if (tabParam === 'scan' || tabParam === 'find' || tabParam === 'leads') {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    // Helper to change tab and update URL
    const changeTab = (tab: 'scan' | 'find' | 'leads') => {
        setActiveTab(tab);
        router.push(`${pathname}?tab=${tab}`);
    };

    // Scan State
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<any>(null);

    // Discovery State
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("all");
    const [finding, setFinding] = useState(false);
    const [leads, setLeads] = useState<DiscoveredBusiness[]>([]);
    const [sortBy, setSortBy] = useState<'score' | 'date' | 'name'>('score');
    const [scanningLead, setScanningLead] = useState<string | null>(null);
    const [savingLead, setSavingLead] = useState<string | null>(null);

    // Async job state
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [recentJobs, setRecentJobs] = useState<any[]>([]);

    // Outreach state
    const [emailModal, setEmailModal] = useState<{ subject: string; body: string; leadName: string } | null>(null);
    const [generatingEmail, setGeneratingEmail] = useState<string | null>(null);
    const [emailTemplate, setEmailTemplate] = useState<EmailTemplateVariant>('friendly_audit');

    // CRM view state
    const [leadsView, setLeadsView] = useState<'list' | 'kanban'>('list');
    const [isPro, setIsPro] = useState(false);

    // My Leads State (CRM)
    const [myLeads, setMyLeads] = useState<any[]>([]);
    const [loadingLeads, setLoadingLeads] = useState(false);
    const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);
    const [stats, setStats] = useState({ totalLeads: 0, auditsRun: 0, potentialValue: 0, searchesUsed: 0, searchesLimit: 0 });

    // Enterprise Features State
    const [isEnterprise, setIsEnterprise] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        getSubscriptionInfo().then((info) => {
            if (info) {
                setIsEnterprise(info.plan === 'enterprise');
                setIsPro(info.plan === 'pro' || info.plan === 'enterprise');
            }
        });
        fetchRecentJobs();
    }, []);

    useEffect(() => {
        if (!activeJobId) return;
        const interval = setInterval(async () => {
            const result = await getJobStatus(activeJobId);
            if (!result.success || !result.job) return;

            if (result.job.status === 'completed' && result.job.report) {
                setReport(result.job.report);
                setLoading(false);
                setActiveJobId(null);
                toast.success('Audit completed!');
                if (result.job.leadId) fetchLeads();
                fetchRecentJobs();
                clearInterval(interval);
            } else if (result.job.status === 'failed') {
                setLoading(false);
                setActiveJobId(null);
                toast.error(result.job.error || 'Scan failed');
                fetchRecentJobs();
                clearInterval(interval);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [activeJobId]);

    async function fetchRecentJobs() {
        const result = await getScanJobs();
        if (result.success) setRecentJobs(result.jobs || []);
    }

    function getSortedLeads(list: DiscoveredBusiness[]) {
        const sorted = [...list];
        if (sortBy === 'score') {
            sorted.sort((a, b) => (b.lead_score ?? 0) - (a.lead_score ?? 0));
        } else if (sortBy === 'name') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        }
        return sorted;
    }

    // CRM Actions
    async function handleStatusChange(leadId: string, newStatus: string) {
        // Optimistic update
        setMyLeads(leads => leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        const result = await updateLead(leadId, { status: newStatus });
        if (result.success) {
            toast.success('Status updated!');
        } else {
            toast.error('Failed to update status');
        }
    }

    // Notes save on blur
    async function handleNotesChange(leadId: string, newNotes: string) {
        // Optimistic update
        setMyLeads(leads => leads.map(l => l.id === leadId ? { ...l, notes: newNotes } : l));
        const result = await updateLead(leadId, { notes: newNotes });
        if (result.success) {
            toast.success('Notes saved!');
        } else {
            toast.error('Failed to save notes');
        }
    }

    // Value save on blur
    async function handleValueChange(leadId: string, valueStr: string) {
        const value = valueStr ? parseInt(valueStr) : 0;
        if (isNaN(value)) return;
        setMyLeads(leads => leads.map(l => l.id === leadId ? { ...l, value } : l));
        const result = await updateLead(leadId, { value });
        if (result.success) {
            toast.success('Value saved!');
        } else {
            toast.error('Failed to save value');
        }
    }

    // Delete leads
    async function handleDeleteLeads(leadIds: string[]) {
        if (leadIds.length === 0) return;
        const confirmMsg = leadIds.length === 1 ? 'Delete this lead?' : `Delete ${leadIds.length} leads?`;
        if (!confirm(confirmMsg)) return;

        const result = await deleteLead(leadIds);
        if (result.success) {
            setMyLeads(leads => leads.filter(l => !leadIds.includes(l.id)));
            setSelectedLeads(new Set());
            toast.success(`${result.deletedCount} lead(s) deleted!`);
            fetchStats();
        } else {
            toast.error(result.error || 'Failed to delete leads');
        }
    }

    async function handleSaveReport() {
        if (!currentLeadId || !report) return;
        const result = await saveReport(currentLeadId, report);
        if (result.success) {
            toast.success('Report saved to database!');
            // Refresh leads to show updated status
            fetchLeads();
        } else {
            toast.error('Failed to save report');
        }
    }

    // Toggle favorite (Enterprise only)
    async function handleToggleFavorite(leadId: string) {
        const result = await toggleFavorite(leadId);
        if (result.success) {
            setMyLeads(leads => leads.map(l =>
                l.id === leadId ? { ...l, is_favorite: result.isFavorite } : l
            ));
            toast.success(result.isFavorite ? 'Added to favorites!' : 'Removed from favorites');
        } else {
            toast.error(result.error || 'Failed to update favorite');
        }
    }

    // Export leads to Excel (Enterprise only)
    async function handleExport(selectedOnly: boolean = false) {
        setExporting(true);
        const leadIds = selectedOnly ? Array.from(selectedLeads) : undefined;
        const result = await exportLeadsToExcel(leadIds);

        if (result.success && result.data) {
            // Download the file
            const blob = new Blob([Uint8Array.from(atob(result.data), c => c.charCodeAt(0))], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.filename || 'leads_export.xlsx';
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`${result.count || 'Leads'} leads exported with full audit data!`);
            setSelectedLeads(new Set());
        } else {
            toast.error(result.error || 'Failed to export leads');
        }
        setExporting(false);
    }

    // Toggle lead selection
    function toggleLeadSelection(leadId: string) {
        setSelectedLeads(prev => {
            const newSet = new Set(prev);
            if (newSet.has(leadId)) {
                newSet.delete(leadId);
            } else {
                newSet.add(leadId);
            }
            return newSet;
        });
    }

    useEffect(() => {
        if (activeTab === 'leads') {
            fetchLeads();
        }
        // Fetch stats on mount and when switching tabs
        fetchStats();
    }, [activeTab]);

    async function fetchStats() {
        const result = await getStats();
        if (result.success && result.stats) {
            setStats(result.stats);
        }
    }

    async function fetchLeads() {
        setLoadingLeads(true);
        const result = await getLeads();
        if (result.success) {
            setMyLeads(result.leads || []);
        }
        setLoadingLeads(false);
    }

    async function handleScan(targetUrl: string = url, leadId?: string) {
        if (!targetUrl) return;
        setLoading(true);
        setReport(null);

        const scanLeadId = leadId || currentLeadId;
        if (leadId) setCurrentLeadId(leadId);
        else if (targetUrl !== url) setCurrentLeadId(null);

        setActiveTab('scan');
        setUrl(targetUrl);

        try {
            const result = await runAudit(targetUrl, scanLeadId || undefined);
            if (result.success && result.jobId) {
                setActiveJobId(result.jobId);
                toast.success(result.message || "Scan queued — we'll notify you when done");
                fetchRecentJobs();
            } else if (result.success && (result as any).report) {
                setReport((result as any).report);
                setLoading(false);
                if (scanLeadId && (result as any).report) {
                    await saveReport(scanLeadId, (result as any).report);
                    fetchLeads();
                }
                toast.success('Audit completed!');
            } else {
                // Check if it's a limit exceeded error
                const errorMsg = result.error || 'Scan failed';
                if (errorMsg.includes('limit') || errorMsg.includes('Upgrade')) {
                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                            <div className="flex-1 w-0 p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5">
                                        <Zap className="h-10 w-10 text-orange-500" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900">Audit Limit Reached</p>
                                        <p className="mt-1 text-sm text-gray-500">{errorMsg}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex border-l border-gray-200">
                                <button
                                    onClick={() => { toast.dismiss(t.id); router.push('/pricing'); }}
                                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-teal-600 hover:text-teal-500 focus:outline-none"
                                >
                                    Upgrade
                                </button>
                            </div>
                        </div>
                    ), { duration: 6000 });
                } else {
                    toast.error(errorMsg);
                }
            }
        } catch (e) {
            console.error(e);
            toast.error('Error running scan');
            setLoading(false);
        }
    }

    async function handleFind() {
        if (!query) return;
        setFinding(true);
        setLeads([]);

        try {
            const result = await findLeads(query, category !== 'all' ? category : undefined);
            if (result.success) {
                setLeads(result.results);
            } else {
                // Check if it's a limit exceeded error
                const errorMsg = result.error || 'Failed to find leads';
                if (errorMsg.includes('limit') || errorMsg.includes('Upgrade')) {
                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                            <div className="flex-1 w-0 p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5">
                                        <Zap className="h-10 w-10 text-orange-500" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900">Search Limit Reached</p>
                                        <p className="mt-1 text-sm text-gray-500">{errorMsg}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex border-l border-gray-200">
                                <button
                                    onClick={() => { toast.dismiss(t.id); router.push('/pricing'); }}
                                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-teal-600 hover:text-teal-500 focus:outline-none"
                                >
                                    Upgrade
                                </button>
                            </div>
                        </div>
                    ), { duration: 6000 });
                } else {
                    toast.error(errorMsg);
                }
            }
        } catch (e) {
            toast.error('Error searching');
        } finally {
            setFinding(false);
        }
    }

    async function quickAudit(lead: DiscoveredBusiness) {
        if (!lead.website) {
            toast.error('No website to scan!');
            return;
        }
        setScanningLead(lead.place_id);
        await handleScan(lead.website);
        setScanningLead(null);
    }

    async function handleGenerateEmail(leadId: string, leadName: string, isFollowUp = false) {
        setGeneratingEmail(leadId);
        const result = await generateEmail(leadId, emailTemplate, isFollowUp);
        if (result.success && result.email) {
            setEmailModal({ subject: result.email.subject, body: result.email.body, leadName });
        } else {
            toast.error(result.error || 'Failed to generate email');
        }
        setGeneratingEmail(null);
    }

    async function handleExportCSV(selectedOnly = false) {
        setExporting(true);
        const leadIds = selectedOnly ? Array.from(selectedLeads) : undefined;
        const result = await exportLeadsToCSV(leadIds);
        if (result.success && result.data) {
            const blob = new Blob([atob(result.data)], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.filename || 'leads_export.csv';
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`${result.count} leads exported to CSV!`);
        } else {
            toast.error(result.error || 'Failed to export');
        }
        setExporting(false);
    }

    async function handleSave(lead: DiscoveredBusiness) {
        setSavingLead(lead.place_id);
        const result = await saveLead(lead);
        if (result.success) {
            if (result.duplicateWarning) {
                toast(result.duplicateWarning, { icon: '⚠️', duration: 5000 });
            }
            toast.success('Lead saved successfully!');
            if (activeTab === 'leads') fetchLeads();
        } else {
            // Check if it's a limit exceeded error
            const errorMsg = result.error || 'Failed to save lead';
            if (errorMsg.includes('limit') || errorMsg.includes('Upgrade')) {
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <Zap className="h-10 w-10 text-orange-500" />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900">Lead Limit Reached</p>
                                    <p className="mt-1 text-sm text-gray-500">{errorMsg}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-gray-200">
                            <button
                                onClick={() => { toast.dismiss(t.id); router.push('/pricing'); }}
                                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-teal-600 hover:text-teal-500 focus:outline-none"
                            >
                                Upgrade
                            </button>
                        </div>
                    </div>
                ), { duration: 6000 });
            } else {
                toast.error('Failed to save: ' + errorMsg);
            }
        }
        setSavingLead(null);
    }

    return (
        <DashboardShell>
            <Toaster position="top-right" />
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8" role="region" aria-label="Dashboard statistics">
                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase">Total Leads</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.totalLeads}</h3>
                    </div>
                    <div className="p-3 bg-teal-400 text-white rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase">Audits Run</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.auditsRun}</h3>
                    </div>
                    <div className="p-3 bg-teal-400 text-white rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase">Searches</p>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {stats.searchesUsed}
                            <span className="text-sm font-medium text-gray-400">
                                /{stats.searchesLimit === Infinity ? '∞' : stats.searchesLimit}
                            </span>
                        </h3>
                    </div>
                    <div className="p-3 bg-blue-400 text-white rounded-xl">
                        <Search className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase">Potential Value</p>
                        <h3 className="text-2xl font-bold text-gray-800">
                            ${stats.potentialValue.toLocaleString()}
                        </h3>
                    </div>
                    <div className="p-3 bg-teal-400 text-white rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Direct Scan - Centered Focus Mode */}
                {activeTab === 'scan' && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        {!report ? (
                            <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold text-gray-800">New Audit</h2>
                                    <p className="text-gray-500">Enter a website URL to generate a comprehensive analysis.</p>
                                </div>

                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                                    </div>
                                    <input
                                        type="url"
                                        placeholder="https://example.com"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-lg transition-all"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => handleScan()}
                                        disabled={loading || !url}
                                        className="absolute inset-y-2 right-2 bg-teal-400 text-white px-6 rounded-xl font-bold hover:bg-teal-500 disabled:opacity-50 transition-all shadow-md active:scale-95"
                                    >
                                        {loading ? (activeJobId ? "Queued..." : "Scanning...") : "Audit"}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400">
                                    <div className="flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400" /> SEO Analysis</div>
                                    <div className="flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-400" /> Performance</div>
                                    <div className="flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-400" /> Security</div>
                                    <div className="flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-400" /> Mobile Friendly</div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full space-y-6">
                                {/* Report Header / Toolbar */}
                                <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                    <button onClick={() => setReport(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                                        &larr; Audit Another
                                    </button>
                                    <div className="flex gap-2">
                                        {currentLeadId && (
                                            <button onClick={handleSaveReport} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-black transition-colors">
                                                <Activity size={16} /> Save to Lead
                                            </button>
                                        )}
                                        <button onClick={() => generatePDF(report)} className="flex items-center gap-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-teal-100 transition-colors">
                                            <Download size={16} /> Download PDF
                                        </button>
                                    </div>
                                </div>

                                {/* Score Hero */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="bg-teal-400 text-white p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={100} /></div>
                                        <span className="text-7xl font-bold">{report.overallScore}</span>
                                        <span className="text-sm font-medium uppercase tracking-wider opacity-90 mt-2">Overall Score</span>
                                    </div>

                                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Quick Stats */}
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                            <p className="text-gray-400 text-xs font-bold uppercase mb-2">Analysis Target</p>
                                            <p className="font-bold text-gray-800 truncate" title={report.url}>{report.url}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(report.scannedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-teal-400 transition-colors group"
                                            onClick={() => {
                                                const { subject, body } = generateColdEmail(report.url, report.url, report);
                                                navigator.clipboard.writeText(`${subject}\n\n${body}`);
                                                toast.success('Email draft copied to clipboard!');
                                            }}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Mail size={16} className="text-teal-500" />
                                                <p className="text-gray-400 text-xs font-bold uppercase">Smart Outreach</p>
                                            </div>
                                            <p className="font-bold text-gray-800 group-hover:text-teal-600 transition-colors">Copy AI Email Pitch &rarr;</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Checks */}
                                <div className="grid gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-800 mb-2">Audit Breakdown</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(report.checks).filter(([k]) => k !== 'seo').map(([key, result]: [string, any]) => (
                                            <div key={key} className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow flex gap-4 bg-gray-50/50">
                                                <div className={cn("w-2 h-full rounded-full shrink-0",
                                                    result.status === 'pass' ? "bg-teal-400" : result.status === 'warning' ? "bg-orange-400" : "bg-red-500"
                                                )} />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-gray-800 capitalize text-sm">{result.title}</h4>
                                                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                                                            result.status === 'pass' ? "bg-teal-100 text-teal-700" : result.status === 'warning' ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                                                        )}>{result.status}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 leading-relaxed">{result.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Search Tab (kept mostly same but wrapped in card) */}
                {activeTab === 'find' && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm min-h-[500px]">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Search size={20} className="text-teal-500" /> Lead Discovery
                        </h2>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {BUSINESS_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                                        category === cat.id
                                            ? "bg-teal-400 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Search businesses (e.g. Roofers in Austin)"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFind()}
                                className="flex-1 p-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-400 outline-none transition-all"
                            />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'score' | 'date' | 'name')}
                                className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium"
                            >
                                <option value="score">By Score</option>
                                <option value="name">By Name</option>
                                <option value="date">By Date</option>
                            </select>
                            <button
                                onClick={handleFind}
                                disabled={finding}
                                className="bg-teal-400 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-500 disabled:opacity-50 transition-all shadow-md active:scale-95"
                            >
                                {finding ? "Searching..." : "Find"}
                            </button>
                        </div>

                        {recentJobs.length > 0 && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Clock size={14} /> Recent Scans
                                </h3>
                                <div className="space-y-2">
                                    {recentJobs.slice(0, 5).map((job) => (
                                        <div key={job.id} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 truncate max-w-[60%]">{job.url}</span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-xs font-bold",
                                                job.status === 'completed' ? "bg-green-100 text-green-700" :
                                                job.status === 'failed' ? "bg-red-100 text-red-700" :
                                                job.status === 'running' ? "bg-blue-100 text-blue-700" :
                                                "bg-yellow-100 text-yellow-700"
                                            )}>
                                                {job.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {getSortedLeads(leads).map((lead) => {
                                const badge = lead.priority ? getPriorityBadge(lead.priority) : null;
                                return (
                                <div key={lead.place_id} className="p-4 rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all flex items-center justify-between group">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold">
                                            {lead.name.substring(0, 1)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{lead.name}</h3>
                                                {badge && (
                                                    <span
                                                        className={cn("px-2 py-0.5 rounded-full text-xs font-bold border", badge.className)}
                                                        title={lead.score_reasons?.join('\n') || `Score: ${lead.lead_score}`}
                                                    >
                                                        {badge.emoji} {badge.label} ({lead.lead_score})
                                                    </span>
                                                )}
                                            </div>
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.formatted_address)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-gray-500 flex items-center gap-1 hover:text-teal-600 hover:underline cursor-pointer transition-colors group/address"
                                            >
                                                <MapPin size={12} className="text-gray-400 group-hover/address:text-teal-500 transition-colors" />
                                                {lead.formatted_address}
                                            </a>
                                            {lead.phone && (
                                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                                                    <Phone size={12} className="text-teal-500" />
                                                    {lead.phone}
                                                </p>
                                            )}
                                            {lead.website ? (
                                                <a href={lead.website} target="_blank" className="text-teal-500 text-xs hover:underline mt-1 block">{lead.website}</a>
                                            ) : <span className="text-xs text-red-400 mt-1 block">No Website</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleSave(lead)} disabled={savingLead === lead.place_id} className="px-4 py-2 text-sm font-bold text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
                                            {savingLead === lead.place_id ? "Saving..." : "Save Lead"}
                                        </button>
                                        <button onClick={() => quickAudit(lead)} disabled={!lead.website || scanningLead === lead.place_id} className="px-4 py-2 text-sm font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
                                            {scanningLead === lead.place_id ? 'Queuing...' : 'Audit'}
                                        </button>
                                    </div>
                                </div>
                            );
                            })}
                            {leads.length === 0 && !finding && query && (
                                <div className="text-center text-gray-400 py-12">No leads found. Try a different search.</div>
                            )}
                        </div>
                    </div>
                )}


                {/* My Leads (Refactored Table Look) */}
                {activeTab === 'leads' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Users size={20} className="text-teal-500" /> My Leads Pipeline
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                                    <button
                                        onClick={() => setLeadsView('list')}
                                        className={cn("p-2 transition-colors", leadsView === 'list' ? "bg-teal-50 text-teal-600" : "text-gray-400 hover:text-gray-600")}
                                        title="List view"
                                    >
                                        <List size={16} />
                                    </button>
                                    <button
                                        onClick={() => setLeadsView('kanban')}
                                        className={cn("p-2 transition-colors", leadsView === 'kanban' ? "bg-teal-50 text-teal-600" : "text-gray-400 hover:text-gray-600")}
                                        title="Kanban view"
                                    >
                                        <LayoutGrid size={16} />
                                    </button>
                                </div>

                                {isPro && (
                                    <button
                                        onClick={() => handleExportCSV(false)}
                                        disabled={exporting}
                                        className="flex items-center gap-2 text-sm font-bold bg-white border border-teal-400 text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors disabled:opacity-50"
                                    >
                                        <Download size={16} />
                                        {exporting ? 'Exporting...' : 'Export CSV'}
                                    </button>
                                )}

                                <button
                                    onClick={() => handleExport(false)}
                                    disabled={exporting}
                                    className="flex items-center gap-2 text-sm font-bold bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors shadow-sm disabled:opacity-50"
                                    aria-label="Export all leads to Excel"
                                >
                                    <FileSpreadsheet size={16} />
                                    {exporting ? 'Exporting...' : 'Export Excel'}
                                </button>

                                {isEnterprise && (
                                    <>
                                        <button
                                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                            className={cn(
                                                "flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-lg border transition-all",
                                                showFavoritesOnly
                                                    ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                                                    : "bg-white text-gray-500 hover:text-yellow-600 hover:border-yellow-200"
                                            )}
                                        >
                                            <Star size={14} fill={showFavoritesOnly ? "currentColor" : "none"} />
                                            Favorites
                                        </button>
                                        {selectedLeads.size > 0 && (
                                            <>
                                                <button
                                                    onClick={() => handleExport(true)}
                                                    disabled={exporting}
                                                    className="flex items-center gap-1 text-sm font-bold bg-teal-50 text-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
                                                >
                                                    <FileSpreadsheet size={14} />
                                                    {exporting ? 'Exporting...' : `Export ${selectedLeads.size} Selected`}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteLeads(Array.from(selectedLeads))}
                                                    className="flex items-center gap-1 text-sm font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete {selectedLeads.size} Selected
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}
                                <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded-md border">{myLeads.filter(l => !showFavoritesOnly || l.is_favorite).length} Records</span>
                            </div>
                        </div>

                        {leadsView === 'kanban' ? (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                                {(['new', 'contacted', 'audited', 'closed'] as const).map((status) => {
                                    const columnLeads = myLeads.filter(l =>
                                        (!showFavoritesOnly || l.is_favorite) &&
                                        (status === 'audited' ? (l.status === 'audited' || l.status === 'auditing') : l.status === status)
                                    );
                                    return (
                                        <div key={status} className="bg-gray-50 rounded-xl p-3 min-h-[300px]">
                                            <h3 className="text-xs font-bold uppercase text-gray-500 mb-3 capitalize">{status}</h3>
                                            <div className="space-y-2">
                                                {columnLeads.map((lead) => (
                                                    <div key={lead.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                        <p className="font-bold text-sm text-gray-800">{lead.business_name}</p>
                                                        {lead.lead_score > 0 && (
                                                            <span className="text-xs text-teal-600 font-bold">Score: {lead.lead_score}</span>
                                                        )}
                                                        <p className="text-xs text-gray-400 mt-1 truncate">{lead.website_url || 'No website'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                        <div className="divide-y divide-gray-100">
                            {myLeads.filter(l => !showFavoritesOnly || l.is_favorite).map((lead) => (
                                <div key={lead.id} className="p-6 hover:bg-gray-50 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4 items-start">
                                            {/* Checkbox for selection (Enterprise) */}
                                            {isEnterprise && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLeads.has(lead.id)}
                                                    onChange={() => toggleLeadSelection(lead.id)}
                                                    className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-400 mt-3"
                                                />
                                            )}
                                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm border",
                                                lead.status === 'audited' ? "bg-teal-100 text-teal-600 border-teal-200" : "bg-gray-100 text-gray-500 border-gray-200"
                                            )}>
                                                {lead.business_name.substring(0, 1)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-gray-800 text-lg">{lead.business_name}</h3>
                                                    {/* Favorite Star (Enterprise) */}
                                                    {isEnterprise && (
                                                        <button
                                                            onClick={() => handleToggleFavorite(lead.id)}
                                                            className={cn(
                                                                "p-1 rounded transition-colors",
                                                                lead.is_favorite ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
                                                            )}
                                                        >
                                                            <Star size={16} fill={lead.is_favorite ? "currentColor" : "none"} />
                                                        </button>
                                                    )}
                                                </div>
                                                {lead.website_url ? (
                                                    <a href={lead.website_url} target="_blank" className="text-sm text-gray-400 hover:text-teal-500 transition-colors">{lead.website_url}</a>
                                                ) : (
                                                    <span className="text-sm text-red-400">No website</span>
                                                )}
                                                {/* Phone & Address */}
                                                {(lead.phone || lead.address) && (
                                                    <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                                                        {lead.phone && (
                                                            <span className="flex items-center gap-1">
                                                                <Phone size={12} className="text-teal-500" />
                                                                {lead.phone}
                                                            </span>
                                                        )}
                                                        {lead.address && (
                                                            <a
                                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 hover:text-teal-600 hover:underline cursor-pointer transition-colors group/address"
                                                            >
                                                                <MapPin size={12} className="text-gray-400 group-hover/address:text-teal-500 transition-colors" />
                                                                {lead.address}
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {lead.status === 'audited' && (
                                                <button
                                                    onClick={() => handleGenerateEmail(lead.id, lead.business_name)}
                                                    disabled={generatingEmail === lead.id}
                                                    className="flex items-center gap-1 text-sm font-bold text-teal-600 hover:text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg transition-all"
                                                >
                                                    <Mail size={14} /> {generatingEmail === lead.id ? 'Generating...' : 'Outreach'}
                                                </button>
                                            )}
                                            {lead.website_url && (
                                                <button onClick={() => handleScan(lead.website_url, lead.id)}
                                                    className="flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-teal-600 bg-white border px-3 py-1.5 rounded-lg hover:border-teal-300 transition-all">
                                                    <RefreshCw size={14} /> Re-Audit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteLeads([lead.id])}
                                                className="flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-red-600 bg-white border px-3 py-1.5 rounded-lg hover:border-red-300 transition-all"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                        <div className="md:col-span-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Status</label>
                                            <select
                                                value={lead.status}
                                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                className="w-full bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-teal-400 outline-none"
                                            >
                                                <option value="new">New</option>
                                                <option value="auditing">Auditing</option>
                                                <option value="audited">Audited</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Internal Notes</label>
                                            <input
                                                type="text"
                                                placeholder="Add a note..."
                                                defaultValue={lead.notes || ''}
                                                onBlur={(e) => handleNotesChange(lead.id, e.target.value)}
                                                className="w-full bg-white border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:border-teal-400 outline-none transition-colors"
                                            />
                                        </div>

                                        <div className="md:col-span-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Est. Value</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1.5 text-gray-400 text-sm">$</span>
                                                <input
                                                    type="number"
                                                    defaultValue={lead.value || ''}
                                                    onBlur={(e) => handleValueChange(lead.id, e.target.value)}
                                                    className="w-full pl-6 bg-white border border-gray-200 text-sm font-bold text-gray-700 rounded-lg px-2 py-1.5 focus:border-teal-400 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {myLeads.length === 0 && (
                                <div className="text-center py-20">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <Users size={32} />
                                    </div>
                                    <p className="text-gray-500 font-medium">No leads in your pipeline yet.</p>
                                    <button onClick={() => changeTab('find')} className="mt-2 text-teal-500 font-bold hover:underline">Find Leads &rarr;</button>
                                </div>
                            )}
                        </div>
                        )}
                    </div>
                )}
            </div>

            {emailModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">Outreach Email — {emailModal.leadName}</h3>
                            <button onClick={() => setEmailModal(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(EMAIL_TEMPLATES).map(([key, tmpl]) => (
                                    <button
                                        key={key}
                                        onClick={() => setEmailTemplate(key as EmailTemplateVariant)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                                            emailTemplate === key
                                                ? "bg-teal-400 text-white border-teal-400"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
                                        )}
                                    >
                                        {tmpl.name}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Subject</label>
                                <p className="mt-1 p-3 bg-gray-50 rounded-lg text-sm font-medium">{emailModal.subject}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Body</label>
                                <pre className="mt-1 p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap font-sans">{emailModal.body}</pre>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${emailModal.subject}\n\n${emailModal.body}`);
                                        toast.success('Copied to clipboard!');
                                    }}
                                    className="flex items-center gap-2 bg-teal-400 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-teal-500"
                                >
                                    <Copy size={14} /> Copy Email
                                </button>
                                <button
                                    onClick={() => setEmailModal(null)}
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardShell>
    );
}
