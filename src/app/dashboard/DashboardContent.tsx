"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { 
    runAudit, 
    findLeads, 
    saveLead, 
    getLeads, 
    saveReport, 
    updateLead, 
    deleteLead, 
    getStats, 
    toggleFavorite, 
    exportLeadsToExcel, 
    exportLeadsToCSV, 
    getJobStatus, 
    getScanJobs, 
    generateEmail 
} from "../actions";
import { cn } from "@/lib/utils";
import { DiscoveredBusiness, BUSINESS_CATEGORIES } from "@/lib/discovery/types";
import { generatePDF } from "@/lib/pdf-generator";
import { generateColdEmail } from "@/lib/email-generator";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getSubscriptionInfo } from "@/lib/subscription";
import { getPriorityBadge } from "@/lib/lead-scoring";
import { EMAIL_TEMPLATES, type EmailTemplateVariant } from "@/lib/ai-email-generator";
import { 
    Users, 
    Search, 
    Activity, 
    Download, 
    RefreshCw, 
    Mail, 
    Star, 
    Phone, 
    FileSpreadsheet, 
    MapPin, 
    Trash2, 
    Zap, 
    LayoutGrid, 
    List, 
    X, 
    Copy, 
    Clock, 
    DollarSign,
    Briefcase,
    Globe2,
    Layers
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import PipelineKanbanView from "@/components/pipeline/PipelineKanbanView";
import ClientsHubView from "@/components/clients/ClientsHubView";
import ExchangeHubView from "@/components/exchange/ExchangeHubView";

export default function Dashboard() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState<'scan' | 'find' | 'leads' | 'clients' | 'exchange'>('find');

    // Sync state with URL param
    useEffect(() => {
        if (tabParam === 'scan' || tabParam === 'find' || tabParam === 'leads' || tabParam === 'clients' || tabParam === 'exchange') {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    // Helper to change tab and update URL
    const changeTab = (tab: 'scan' | 'find' | 'leads' | 'clients' | 'exchange') => {
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
    const [sortBy, setSortBy] = useState<'score' | 'name'>('score');
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

        // Handle checkout success redirect from Polar
        const checkoutStatus = searchParams.get('checkout');
        if (checkoutStatus === 'success') {
            toast.success('Payment successful! Your plan has been upgraded.', { duration: 5000 });
            getSubscriptionInfo(true).then((info) => {
                if (info) {
                    setIsEnterprise(info.plan === 'enterprise');
                    setIsPro(info.plan === 'pro' || info.plan === 'enterprise');
                }
            });
            router.replace('/dashboard');
        }
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
                const errorMsg = result.error || 'Scan failed';
                if (errorMsg.includes('limit') || errorMsg.includes('Upgrade')) {
                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black/5`}>
                            <div className="flex-1 w-0 p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5">
                                        <Zap className="h-9 w-9 text-amber-500" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-semibold text-zinc-900">Audit Limit Reached</p>
                                        <p className="mt-1 text-xs text-zinc-500">{errorMsg}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex border-l border-zinc-200">
                                <button
                                    onClick={() => { toast.dismiss(t.id); router.push('/dashboard/pricing'); }}
                                    className="w-full border border-transparent rounded-none rounded-r-xl px-4 py-2 flex items-center justify-center text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
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

    async function handleFind(overrideQuery?: string, overrideCategory?: string) {
        const currentQuery = overrideQuery !== undefined ? overrideQuery : query;
        const currentCategory = overrideCategory !== undefined ? overrideCategory : category;

        if (!currentQuery) return;
        setFinding(true);
        setLeads([]);

        try {
            const result = await findLeads(currentQuery, currentCategory !== 'all' ? currentCategory : undefined);
            if (result.success) {
                setLeads(result.results);
            } else {
                const errorMsg = result.error || 'Failed to find leads';
                if (errorMsg.includes('limit') || errorMsg.includes('Upgrade')) {
                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black/5`}>
                            <div className="flex-1 w-0 p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5">
                                        <Zap className="h-9 w-9 text-amber-500" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-semibold text-zinc-900">Search Limit Reached</p>
                                        <p className="mt-1 text-xs text-zinc-500">{errorMsg}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex border-l border-zinc-200">
                                <button
                                    onClick={() => { toast.dismiss(t.id); router.push('/dashboard/pricing'); }}
                                    className="w-full border border-transparent rounded-none rounded-r-xl px-4 py-2 flex items-center justify-center text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
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
                toast(result.duplicateWarning, { duration: 5000 });
            }
            toast.success('Lead saved successfully!');
            if (activeTab === 'leads') fetchLeads();
        } else {
            const errorMsg = result.error || 'Failed to save lead';
            if (errorMsg.includes('limit') || errorMsg.includes('Upgrade')) {
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black/5`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <Zap className="h-9 w-9 text-amber-500" />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-semibold text-zinc-900">Lead Limit Reached</p>
                                    <p className="mt-1 text-xs text-zinc-500">{errorMsg}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-zinc-200">
                            <button
                                onClick={() => { toast.dismiss(t.id); router.push('/dashboard/pricing'); }}
                                className="w-full border border-transparent rounded-none rounded-r-xl px-4 py-2 flex items-center justify-center text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
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
            <Toaster position="top-right" toastOptions={{ style: { background: "#18181b", color: "#fafafa", border: "1px solid #3f3f46" } }} />
            
            {/* Page Header with Lifecycle Bar */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                        {activeTab === 'find' ? 'Lead Discovery Engine' : 
                         activeTab === 'leads' ? 'Pipeline & Deals' : 
                         activeTab === 'clients' ? 'Active Clients Hub' : 
                         activeTab === 'exchange' ? 'B2B Deal & Client Exchange' : 
                         'Direct Technical Audit'}
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        {activeTab === 'find' ? 'Search Google Places and discover businesses with poor web presence' : 
                         activeTab === 'leads' ? 'Track prospect audits and move deals through stages to Closed Won' : 
                         activeTab === 'clients' ? 'Manage active client retainers, contract renewals, and recurring MRR' : 
                         activeTab === 'exchange' ? 'Monetize out-of-scope referrals and claim verified client opportunities' : 
                         'Execute one-off headless browser diagnostic scan on any URL'}
                    </p>
                </div>

                {/* Growth Lifecycle Bar */}
                <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-xs overflow-x-auto max-w-full">
                    {[
                        { tab: 'find', label: '1. Discover', icon: Search },
                        { tab: 'scan', label: '2. Audit', icon: Zap },
                        { tab: 'leads', label: '3. Pipeline', icon: Layers },
                        { tab: 'clients', label: '4. Clients', icon: Briefcase },
                        { tab: 'exchange', label: '5. Exchange', icon: Globe2 },
                    ].map((step) => (
                        <button
                            key={step.tab}
                            onClick={() => changeTab(step.tab as any)}
                            className={cn(
                                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                                activeTab === step.tab
                                    ? "bg-zinc-900 text-white shadow-xs"
                                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                            )}
                        >
                            <step.icon size={14} className={activeTab === step.tab ? "text-white" : "text-zinc-400"} />
                            <span>{step.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10" role="region" aria-label="Dashboard statistics">
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex flex-col justify-between hover:border-zinc-300 hover:shadow-xs transition-all">
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Total Leads</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                            <Users size={20} />
                        </div>
                        <h3 className="text-4xl font-extrabold font-mono text-zinc-900 tracking-tight">{stats.totalLeads}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex flex-col justify-between hover:border-zinc-300 hover:shadow-xs transition-all">
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Audits Run</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                            <Activity size={20} />
                        </div>
                        <h3 className="text-4xl font-extrabold font-mono text-zinc-900 tracking-tight">{stats.auditsRun}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex flex-col justify-between hover:border-zinc-300 hover:shadow-xs transition-all">
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Discovery Searches</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                            <Search size={20} />
                        </div>
                        <h3 className="text-4xl font-extrabold font-mono text-zinc-900 tracking-tight">
                            {stats.searchesUsed}
                            <span className="text-sm font-normal text-zinc-400 font-mono ml-0.5">
                                /{stats.searchesLimit === Infinity ? '∞' : stats.searchesLimit}
                            </span>
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex flex-col justify-between hover:border-zinc-300 hover:shadow-xs transition-all">
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Pipeline Value</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                            <DollarSign size={20} />
                        </div>
                        <h3 className="text-4xl font-extrabold font-mono text-zinc-900 tracking-tight">
                            ${stats.potentialValue > 999 ? (stats.potentialValue/1000).toFixed(1) + 'k' : stats.potentialValue}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Direct Scan */}
                {activeTab === 'scan' && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh]">
                        {!report ? (
                            <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in duration-300">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Run a Web Audit</h2>
                                    <p className="text-sm text-zinc-500">Enter a website URL to generate a comprehensive performance, SEO, and security audit.</p>
                                </div>

                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
                                    </div>
                                    <input
                                        type="url"
                                        placeholder="https://example.com"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                                        className="w-full pl-12 pr-36 py-4 bg-white border border-zinc-200 rounded-2xl shadow-xs outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-base font-medium transition-all"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => handleScan()}
                                        disabled={loading || !url}
                                        className="absolute inset-y-2 right-2 bg-zinc-900 text-white px-6 rounded-xl font-semibold hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-xs active:scale-95"
                                    >
                                        {loading ? (activeJobId ? 'Queued...' : 'Scanning...') : 'Run Audit'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-zinc-500">
                                    <div className="flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-zinc-900" /> SEO Analysis</div>
                                    <div className="flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-zinc-700" /> Performance</div>
                                    <div className="flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-zinc-500" /> Security</div>
                                    <div className="flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-zinc-400" /> Mobile Check</div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full space-y-6 animate-in fade-in duration-300">
                                {/* Toolbar */}
                                <div className="bg-white p-4 rounded-xl border border-zinc-200 flex justify-between items-center shadow-xs">
                                    <button onClick={() => setReport(null)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors">
                                        ← New Audit
                                    </button>
                                    <div className="flex gap-2.5">
                                        {currentLeadId && (
                                            <button onClick={handleSaveReport} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">
                                                <Activity size={14} /> Save to Lead
                                            </button>
                                        )}
                                        <button onClick={() => generatePDF(report)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-black text-white transition-colors shadow-xs">
                                            <Download size={14} /> Download PDF
                                        </button>
                                    </div>
                                </div>

                                {/* Score Hero */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                    <div className="bg-[#0c0c0e] text-white p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden border border-zinc-800">
                                        <span className="text-7xl font-extrabold tracking-tight">{report.overallScore}</span>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-2">Overall Score</span>
                                    </div>

                                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
                                            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Analysis Target</p>
                                            <p className="font-bold text-zinc-900 text-sm truncate" title={report.url}>{report.url}</p>
                                            <p className="text-xs text-zinc-400 mt-2">{new Date(report.scannedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div 
                                            className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs cursor-pointer hover:border-zinc-400 transition-colors group flex flex-col justify-between"
                                            onClick={() => {
                                                const { subject, body } = generateColdEmail(report.url, report.url, report);
                                                navigator.clipboard.writeText(`${subject}\n\n${body}`);
                                                toast.success('Email draft copied to clipboard!');
                                            }}
                                        >
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Mail size={16} className="text-zinc-800" />
                                                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Smart Outreach</p>
                                                </div>
                                                <p className="font-bold text-zinc-900 text-sm group-hover:text-zinc-700 transition-colors">Copy AI Email Pitch →</p>
                                            </div>
                                            <p className="text-xs text-zinc-400 mt-2">Click to copy personalized pitch</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Audit Breakdown */}
                                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
                                    <h3 className="font-bold text-base text-zinc-900 mb-4 tracking-tight">Audit Breakdown</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Object.entries(report.checks).filter(([k]) => k !== 'seo').map(([key, result]: [string, any]) => (
                                            <div key={key} className="p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-all flex gap-3.5 bg-zinc-50/50">
                                                <div className={cn(
                                                    "w-1.5 h-full rounded-full shrink-0",
                                                    result.status === 'pass' ? "bg-zinc-900" : result.status === 'warning' ? "bg-amber-500" : "bg-rose-500"
                                                )} />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-zinc-900 text-sm capitalize">{result.title}</h4>
                                                        <span className={cn(
                                                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                                            result.status === 'pass' ? "bg-zinc-200 text-zinc-800" : result.status === 'warning' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                                                        )}>{result.status}</span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 leading-relaxed">{result.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Find Leads Tab */}
                {activeTab === 'find' && (
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs min-h-[500px]">
                        <h2 className="text-xl font-extrabold text-zinc-900 mb-6 flex items-center gap-2.5 tracking-tight">
                            <Search size={22} className="text-zinc-800" /> Lead Discovery
                        </h2>

                        {/* Category pills */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            {BUSINESS_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setCategory(cat.id);
                                        if (cat.id !== 'all') {
                                            const newQuery = `${cat.label} Near me`;
                                            setQuery(newQuery);
                                            handleFind(newQuery, cat.id);
                                        } else {
                                            setQuery('');
                                        }
                                    }}
                                    className={cn(
                                        "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
                                        category === cat.id
                                            ? "bg-zinc-900 text-white shadow-xs"
                                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Search bar */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <div className="relative flex-1">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Search businesses (e.g. Roofers in Austin, Dentists in Miami)"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFind()}
                                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-400"
                                />
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'score' | 'name')}
                                className="px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900"
                            >
                                <option value="score">Sort by Score</option>
                                <option value="name">Sort by Name</option>
                            </select>
                            <button
                                onClick={() => handleFind()}
                                disabled={finding}
                                className="bg-zinc-900 text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-black disabled:opacity-50 transition-all shadow-xs"
                            >
                                {finding ? 'Searching...' : 'Search'}
                            </button>
                        </div>

                        {/* Results table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[760px]">
                                <thead>
                                    <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-50">
                                        <th className="p-3.5">Business Details</th>
                                        <th className="p-3.5">Contact & Address</th>
                                        <th className="p-3.5 text-center">Score</th>
                                        <th className="p-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {getSortedLeads(leads).map((lead) => {
                                        const badge = lead.priority ? getPriorityBadge(lead.priority) : null;
                                        return (
                                            <tr key={lead.place_id} className="hover:bg-zinc-50/50 transition-colors">
                                                <td className="p-3.5 align-top">
                                                    <div className="flex flex-col gap-1">
                                                        <h3 className="text-sm font-bold text-zinc-900 truncate max-w-xs" title={lead.name}>
                                                            {lead.name}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-1.5 items-center">
                                                            {lead.rating && (
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                                                    <Star size={10} fill="currentColor" />
                                                                    {lead.rating}
                                                                    {lead.user_ratings_total !== undefined && (
                                                                        <span className="opacity-70 font-normal">({lead.user_ratings_total})</span>
                                                                    )}
                                                                </span>
                                                            )}
                                                            {badge && (
                                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 uppercase" title={lead.score_reasons?.join('\n') || `Score: ${lead.lead_score}`}>
                                                                    {badge.label}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3.5 align-top text-xs">
                                                    <div className="flex flex-col gap-1">
                                                        {lead.website ? (
                                                            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-zinc-900 font-medium hover:underline truncate max-w-[220px]" title={lead.website}>
                                                                {lead.website}
                                                            </a>
                                                        ) : (
                                                            <span className="text-rose-500 italic">No website</span>
                                                        )}
                                                        {lead.phone && (
                                                            <button
                                                                onClick={() => { navigator.clipboard.writeText(lead.phone!); toast.success('Phone copied!'); }}
                                                                className="text-zinc-500 hover:text-zinc-900 flex items-center gap-1.5 text-left"
                                                                title="Click to copy"
                                                            >
                                                                <Phone size={11} className="text-zinc-400 shrink-0" />
                                                                {lead.phone}
                                                            </button>
                                                        )}
                                                        {lead.formatted_address && (
                                                            <a
                                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.formatted_address)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-zinc-400 hover:text-zinc-700 flex items-center gap-1.5 truncate max-w-[220px]"
                                                                title="View on Google Maps"
                                                            >
                                                                <MapPin size={11} className="text-zinc-400 shrink-0" />
                                                                <span className="truncate">{lead.formatted_address}</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3.5 align-middle text-center">
                                                    <span className={cn(
                                                        "inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold font-mono",
                                                        (lead.lead_score ?? 0) >= 80 ? "bg-rose-100 text-rose-700" :
                                                        (lead.lead_score ?? 0) >= 50 ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-700"
                                                    )}>
                                                        {lead.lead_score ?? 0}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 align-middle text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => quickAudit(lead)} 
                                                            disabled={!lead.website || scanningLead === lead.place_id} 
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 disabled:opacity-50 transition-colors"
                                                        >
                                                            {scanningLead === lead.place_id ? 'Queuing...' : 'Audit'}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleSave(lead)} 
                                                            disabled={savingLead === lead.place_id} 
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-black text-white disabled:opacity-50 transition-colors shadow-xs"
                                                        >
                                                            {savingLead === lead.place_id ? 'Saving...' : 'Save'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {leads.length === 0 && !finding && query && (
                                <div className="text-center py-16">
                                    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-400">
                                        <Search size={20} />
                                    </div>
                                    <p className="text-sm font-semibold text-zinc-900">No leads found</p>
                                    <p className="text-xs text-zinc-500 mt-1">Try broadening your search term or selecting a different category.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Pipeline & Leads */}
                {activeTab === 'leads' && (
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden min-h-[500px]">
                        <div className="p-5 border-b border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50/50">
                            <div>
                                <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2 tracking-tight">
                                    <Layers size={18} className="text-zinc-700" /> Leads Pipeline
                                </h2>
                                <p className="text-xs text-zinc-500 mt-0.5">Drag-and-drop deals, schedule pitches, and manage client lifecycles</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex rounded-xl border border-zinc-200 bg-white p-1">
                                    <button
                                        onClick={() => setLeadsView('list')}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                            leadsView === 'list' ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
                                        )}
                                        title="List view"
                                    >
                                        <List size={14} />
                                        <span>List</span>
                                    </button>
                                    <button
                                        onClick={() => setLeadsView('kanban')}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                            leadsView === 'kanban' ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
                                        )}
                                        title="Kanban view"
                                    >
                                        <LayoutGrid size={14} />
                                        <span>Board</span>
                                    </button>
                                </div>

                                {isPro && (
                                    <button
                                        onClick={() => handleExportCSV(false)}
                                        disabled={exporting}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 transition-colors shadow-xs"
                                    >
                                        <Download size={13} />
                                        {exporting ? 'Exporting...' : 'CSV'}
                                    </button>
                                )}

                                <button
                                    onClick={() => handleExport(false)}
                                    disabled={exporting}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 text-white hover:bg-black disabled:opacity-50 transition-colors shadow-xs"
                                    aria-label="Export all leads to Excel"
                                >
                                    <FileSpreadsheet size={13} />
                                    {exporting ? 'Exporting...' : 'Excel'}
                                </button>

                                {isEnterprise && (
                                    <>
                                        <button
                                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                            className={cn(
                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                                                showFavoritesOnly
                                                    ? "bg-amber-50 text-amber-700 border-amber-300"
                                                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                                            )}
                                        >
                                            <Star size={13} fill={showFavoritesOnly ? "currentColor" : "none"} />
                                            Favorites
                                        </button>
                                        {selectedLeads.size > 0 && (
                                            <>
                                                <button
                                                    onClick={() => handleExport(true)}
                                                    disabled={exporting}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 text-zinc-800 hover:bg-zinc-200 transition-colors"
                                                >
                                                    <FileSpreadsheet size={13} />
                                                    Export ({selectedLeads.size})
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteLeads(Array.from(selectedLeads))}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                                >
                                                    <Trash2 size={13} />
                                                    Delete ({selectedLeads.size})
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}
                                <span className="text-xs font-mono font-semibold text-zinc-500 bg-white px-2.5 py-1 rounded-lg border border-zinc-200">
                                    {myLeads.filter(l => !showFavoritesOnly || l.is_favorite).length} Records
                                </span>
                            </div>
                        </div>

                        {leadsView === 'kanban' ? (
                            <div className="p-6">
                                <PipelineKanbanView
                                    leads={myLeads.filter(l => !showFavoritesOnly || l.is_favorite)}
                                    onRefresh={fetchLeads}
                                    onGenerateEmail={(id, name) => handleGenerateEmail(id, name)}
                                    onToggleFavorite={handleToggleFavorite}
                                    onDeleteLead={(id) => handleDeleteLeads([id])}
                                />
                            </div>
                        ) : (
                            <>
                                {myLeads.filter(l => !showFavoritesOnly || l.is_favorite).length === 0 && (
                                    <div className="text-center py-20 bg-white">
                                        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                                            <Users size={28} />
                                        </div>
                                        <p className="text-sm font-semibold text-zinc-800">No leads in your pipeline yet</p>
                                        <p className="text-xs text-zinc-500 mt-1">Discover businesses and save them to your CRM</p>
                                        <button onClick={() => changeTab('find')} className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition-colors">
                                            Find Leads →
                                        </button>
                                    </div>
                                )}

                                {myLeads.filter(l => !showFavoritesOnly || l.is_favorite).length > 0 && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[950px] bg-white">
                                            <thead className="bg-zinc-50 border-b border-zinc-200">
                                                <tr className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                                    {isEnterprise && <th className="p-3.5 w-12 text-center">Sel</th>}
                                                    <th className="p-3.5">Business Details</th>
                                                    <th className="p-3.5">Contact & Address</th>
                                                    <th className="p-3.5">Stage</th>
                                                    <th className="p-3.5">Est. Value</th>
                                                    <th className="p-3.5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100">
                                                {myLeads.filter(l => !showFavoritesOnly || l.is_favorite).map((lead) => (
                                                    <tr key={lead.id} className="hover:bg-zinc-50/50 transition-colors group">
                                                        {isEnterprise && (
                                                            <td className="p-3.5 text-center align-middle">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedLeads.has(lead.id)}
                                                                    onChange={() => toggleLeadSelection(lead.id)}
                                                                    className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                                                                />
                                                            </td>
                                                        )}
                                                        <td className="p-3.5 align-top">
                                                            <div className="flex items-start gap-3">
                                                                <div className={cn(
                                                                    "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border shrink-0 mt-0.5",
                                                                    lead.status === 'audited' ? "bg-zinc-100 text-zinc-900 border-zinc-300" : "bg-zinc-50 text-zinc-500 border-zinc-200"
                                                                )}>
                                                                    {lead.business_name.substring(0, 1)}
                                                                </div>
                                                                <div className="flex flex-col gap-0.5">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-sm text-zinc-900 truncate max-w-xs" title={lead.business_name}>
                                                                            {lead.business_name}
                                                                        </span>
                                                                        {isEnterprise && (
                                                                            <button
                                                                                onClick={() => handleToggleFavorite(lead.id)}
                                                                                className={cn(
                                                                                    "p-0.5 rounded transition-colors",
                                                                                    lead.is_favorite ? "text-amber-400 fill-amber-400 hover:text-amber-500" : "text-zinc-300 hover:text-amber-400"
                                                                                )}
                                                                                title={lead.is_favorite ? "Remove favorite" : "Mark favorite"}
                                                                            >
                                                                                <Star size={13} fill={lead.is_favorite ? "currentColor" : "none"} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    {lead.website_url ? (
                                                                        <a href={lead.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-600 hover:underline truncate max-w-[200px]" title={lead.website_url}>{lead.website_url}</a>
                                                                    ) : (
                                                                        <span className="text-xs text-rose-500 italic">No website</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-3.5 align-top text-xs">
                                                            <div className="flex flex-col gap-1">
                                                                {lead.phone && (
                                                                    <button 
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(lead.phone!);
                                                                            toast.success("Phone number copied!");
                                                                        }}
                                                                        className="text-zinc-600 flex items-center gap-1.5 hover:text-zinc-900 transition-colors w-fit"
                                                                        title="Click to copy phone number"
                                                                    >
                                                                        <Phone size={11} className="text-zinc-400 shrink-0" />
                                                                        <span>{lead.phone}</span>
                                                                    </button>
                                                                )}
                                                                {lead.address && (
                                                                    <a
                                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address)}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-zinc-400 flex items-center gap-1.5 hover:text-zinc-700 transition-colors truncate max-w-[200px]"
                                                                        title="View on Google Maps"
                                                                    >
                                                                        <MapPin size={11} className="text-zinc-400 shrink-0" />
                                                                        <span className="truncate">{lead.address}</span>
                                                                    </a>
                                                                )}
                                                                {!lead.phone && !lead.address && (
                                                                    <span className="text-zinc-400 italic">No contact info</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-3.5 align-top">
                                                            <select
                                                                value={lead.status}
                                                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                                className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-800 outline-none cursor-pointer capitalize"
                                                            >
                                                                <option value="new">New</option>
                                                                <option value="auditing">Auditing</option>
                                                                <option value="audited">Audited</option>
                                                                <option value="contacted">Contacted</option>
                                                                <option value="closed">Closed</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-3.5 align-top">
                                                            <div className="relative w-24">
                                                                <span className="absolute left-2.5 top-1.5 text-zinc-400 text-xs">$</span>
                                                                <input
                                                                    type="number"
                                                                    defaultValue={lead.value || ''}
                                                                    onBlur={(e) => handleValueChange(lead.id, e.target.value)}
                                                                    className="w-full pl-5 pr-2 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 outline-none focus:border-zinc-500"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="p-3.5 align-top text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                {lead.status === 'audited' && (
                                                                    <button
                                                                        onClick={() => handleGenerateEmail(lead.id, lead.business_name)}
                                                                        disabled={generatingEmail === lead.id}
                                                                        className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                                                                        title="Outreach Email"
                                                                    >
                                                                        <Mail size={14} />
                                                                    </button>
                                                                )}
                                                                {lead.website_url && (
                                                                    <button
                                                                        onClick={() => handleScan(lead.website_url, lead.id)}
                                                                        className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                                                                        title="Re-Audit"
                                                                    >
                                                                        <RefreshCw size={14} />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDeleteLeads([lead.id])}
                                                                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                                                    title="Delete Lead"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Active Clients Hub */}
                {activeTab === 'clients' && (
                    <ClientsHubView />
                )}

                {/* B2B Deal & Client Exchange */}
                {activeTab === 'exchange' && (
                    <ExchangeHubView />
                )}
            </div>

            {/* Email Modal */}
            {emailModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-zinc-200">
                        <div className="p-5 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
                            <h3 className="font-bold text-base text-zinc-900">Outreach Email — {emailModal.leadName}</h3>
                            <button onClick={() => setEmailModal(null)} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(EMAIL_TEMPLATES).map(([key, tmpl]) => (
                                    <button
                                        key={key}
                                        onClick={() => setEmailTemplate(key as EmailTemplateVariant)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                            emailTemplate === key
                                                ? "bg-zinc-900 text-white border-zinc-900"
                                                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                                        )}
                                    >
                                        {tmpl.name}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Subject Line</label>
                                <p className="mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900">{emailModal.subject}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Body</label>
                                <pre className="mt-1 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs whitespace-pre-wrap font-sans text-zinc-800 leading-relaxed">{emailModal.body}</pre>
                            </div>
                            <div className="flex gap-2.5 pt-2">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${emailModal.subject}\n\n${emailModal.body}`);
                                        toast.success('Copied to clipboard!');
                                    }}
                                    className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-black transition-colors shadow-xs"
                                >
                                    <Copy size={13} /> Copy Email
                                </button>
                                <button
                                    onClick={() => setEmailModal(null)}
                                    className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition-colors"
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
