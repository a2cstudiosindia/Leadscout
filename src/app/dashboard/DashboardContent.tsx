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
import { Users, Search, Activity, Download, RefreshCw, Mail, Star, Phone, FileSpreadsheet, MapPin, Trash2, Zap, LayoutGrid, List, X, Copy, Clock, Briefcase, Globe2, Layers } from "lucide-react";
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
            // Re-fetch subscription to reflect new plan
            getSubscriptionInfo().then((info) => {
                if (info) {
                    setIsEnterprise(info.plan === 'enterprise');
                    setIsPro(info.plan === 'pro' || info.plan === 'enterprise');
                }
            });
            // Clean up the URL
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
                toast(result.duplicateWarning, { duration: 5000 });
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

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        {activeTab === 'find' ? 'Lead Discovery' : activeTab === 'leads' ? 'Pipeline & Deals' : activeTab === 'clients' ? 'Clients Hub' : activeTab === 'exchange' ? 'B2B Exchange' : 'Direct Scan'}
                    </h1>
                    <p className="page-subtitle">
                        {activeTab === 'find' ? 'Discover and qualify local businesses with poor web presence' : activeTab === 'leads' ? 'Track prospect audits and move deals through stages to Closed Won' : activeTab === 'clients' ? 'Manage active client retainers, contract renewals, and recurring MRR' : activeTab === 'exchange' ? 'Monetize out-of-scope referrals and claim verified client opportunities' : 'Run an in-depth technical SEO, speed, and security audit on any URL'}
                    </p>
                </div>

                {/* Growth Engine Lifecycle Bar */}
                <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-[var(--r-lg)] border border-[var(--border)] shadow-xs overflow-x-auto max-w-full">
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
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-md)] text-xs font-medium transition-all whitespace-nowrap ${
                                activeTab === step.tab
                                    ? 'bg-[var(--neutral-900)] text-white font-semibold shadow-xs'
                                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--neutral-100)]'
                            }`}
                        >
                            <step.icon size={13} className={activeTab === step.tab ? 'text-white' : 'text-[var(--ink-muted)]'} />
                            <span>{step.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger animate-fade-in" role="region" aria-label="Dashboard statistics">
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="stat-label">Total Leads</span>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-500)' }}>
                            <Users size={16} />
                        </div>
                    </div>
                    <div className="stat-value tabular">{stats.totalLeads}</div>
                    <div className="stat-accent-line" style={{ background: 'var(--brand-500)' }} />
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="stat-label">Audits Run</span>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--success-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success-700)' }}>
                            <Activity size={16} />
                        </div>
                    </div>
                    <div className="stat-value tabular">{stats.auditsRun}</div>
                    <div className="stat-accent-line" style={{ background: 'var(--success-500)' }} />
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="stat-label">Searches Used</span>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--warning-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning-700)' }}>
                            <Search size={16} />
                        </div>
                    </div>
                    <div className="stat-value tabular">
                        {stats.searchesUsed}
                        <span style={{ fontSize: 'var(--t-sm)', fontWeight: 500, color: 'var(--ink-muted)' }}>
                            /{stats.searchesLimit === Infinity ? '∞' : stats.searchesLimit}
                        </span>
                    </div>
                    <div className="stat-accent-line" style={{ background: 'var(--warning-500)' }} />
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="stat-label">Pipeline Value</span>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>
                    <div className="stat-value tabular">
                        ${stats.potentialValue > 999 ? (stats.potentialValue/1000).toFixed(1) + 'k' : stats.potentialValue}
                    </div>
                    <div className="stat-accent-line" style={{ background: '#7c3aed' }} />
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Direct Scan */}
                {activeTab === 'scan' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                        {!report ? (
                            <div className="animate-fade-in" style={{ width: '100%', maxWidth: 600, textAlign: 'center' }}>
                                <div style={{ marginBottom: 32 }}>
                                    <h2 style={{ fontSize: 'var(--t-2xl)', fontWeight: 800, color: 'var(--ink-primary)', letterSpacing: '-0.04em', marginBottom: 6 }}>Run a Web Audit</h2>
                                    <p style={{ color: 'var(--ink-tertiary)', fontSize: 'var(--t-sm)' }}>Enter any website URL to generate a comprehensive performance and SEO analysis.</p>
                                </div>

                                <div style={{ position: 'relative', marginBottom: 20 }}>
                                    <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)', pointerEvents: 'none' }}>
                                        <Search size={17} />
                                    </div>
                                    <input
                                        type="url"
                                        placeholder="https://example.com"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                                        className="input input-lg"
                                        style={{ paddingLeft: 44, paddingRight: 120 }}
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => handleScan()}
                                        disabled={loading || !url}
                                        className="btn btn-primary"
                                        style={{ position: 'absolute', right: 6, top: 6, bottom: 6, height: 'auto' }}
                                    >
                                        {loading ? (activeJobId ? 'Queued...' : 'Scanning...') : 'Run Audit'}
                                    </button>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                                    {[['var(--success-500)', 'SEO Analysis'], ['var(--brand-500)', 'Performance'], ['var(--danger-500)', 'Security'], ['var(--warning-500)', 'Mobile Check']].map(([color, label]) => (
                                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--t-xs)', color: 'var(--ink-muted)', fontWeight: 500 }}>
                                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
                                            {label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ width: '100%' }} className="animate-fade-in">
                                {/* Toolbar */}
                                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', marginBottom: 16 }}>
                                    <button onClick={() => setReport(null)} className="btn btn-ghost btn-sm">
                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                        New Audit
                                    </button>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {currentLeadId && (
                                            <button onClick={handleSaveReport} className="btn btn-secondary btn-sm">
                                                <Activity size={13} /> Save to Lead
                                            </button>
                                        )}
                                        <button onClick={() => generatePDF(report)} className="btn btn-primary btn-sm">
                                            <Download size={13} /> Download PDF
                                        </button>
                                    </div>
                                </div>

                                {/* Score Hero + Meta */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ marginBottom: 16 }}>
                                    <div className="audit-score-hero">
                                        <span className="audit-score-number tabular">{report.overallScore}</span>
                                        <span className="audit-score-label">Overall Score</span>
                                    </div>
                                    <div className="card" style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <p style={{ fontSize: 'var(--t-xs)', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Analysis Target</p>
                                        <p style={{ fontWeight: 600, color: 'var(--ink-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'var(--t-sm)' }} title={report.url}>{report.url}</p>
                                        <p style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-muted)' }}>{new Date(report.scannedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="card" style={{ padding: '20px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 }}
                                        onClick={() => {
                                            const { subject, body } = generateColdEmail(report.url, report.url, report);
                                            navigator.clipboard.writeText(`${subject}\n\n${body}`);
                                            toast.success('Email draft copied!');
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Mail size={14} style={{ color: 'var(--accent)' }} />
                                            <p style={{ fontSize: 'var(--t-xs)', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Smart Outreach</p>
                                        </div>
                                        <p style={{ fontWeight: 600, fontSize: 'var(--t-sm)', color: 'var(--ink-primary)' }}>Copy AI Email Pitch &rarr;</p>
                                    </div>
                                </div>

                                {/* Audit Checks */}
                                <div className="card" style={{ padding: 20 }}>
                                    <h3 style={{ fontWeight: 700, fontSize: 'var(--t-md)', color: 'var(--ink-primary)', marginBottom: 16, letterSpacing: '-0.02em' }}>Audit Breakdown</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 10 }}>
                                        {Object.entries(report.checks).filter(([k]) => k !== 'seo').map(([key, result]: [string, any]) => (
                                            <div key={key} className="audit-check-item">
                                                <div className="audit-check-status-bar" style={{
                                                    background: result.status === 'pass' ? 'var(--success-500)' : result.status === 'warning' ? 'var(--warning-500)' : 'var(--danger-500)'
                                                }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                                        <h4 style={{ fontWeight: 600, fontSize: 'var(--t-sm)', color: 'var(--ink-primary)' }}>{result.title}</h4>
                                                        <span className={`badge badge-${result.status === 'pass' ? 'success' : result.status === 'warning' ? 'warning' : 'danger'}`}>
                                                            {result.status}
                                                        </span>
                                                    </div>
                                                    <p style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-tertiary)', lineHeight: 1.6 }}>{result.description}</p>
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
                    <div className="card" style={{ padding: 24, minHeight: 500 }}>

                        {/* Category pills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
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
                                    className={`btn btn-sm ${category === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ borderRadius: 99 }}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Search bar */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                            <div className="input-with-icon" style={{ flex: 1 }}>
                                <Search size={15} className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Search businesses (e.g. Roofers in Austin)"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFind()}
                                    className="input"
                                />
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'score' | 'name')}
                                className="input"
                                style={{ width: 130 }}
                            >
                                <option value="score">By Score</option>
                                <option value="name">By Name</option>
                            </select>
                            <button
                                onClick={() => handleFind()}
                                disabled={finding}
                                className="btn btn-primary"
                                style={{ flexShrink: 0, minWidth: 80 }}
                            >
                                {finding ? 'Searching...' : 'Search'}
                            </button>
                        </div>

                        {/* Results table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table" style={{ minWidth: 760 }}>
                                <thead>
                                    <tr>
                                        <th>Business Details</th>
                                        <th>Contact & Address</th>
                                        <th style={{ textAlign: 'center' }}>Score</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {getSortedLeads(leads).map((lead) => {
                                        const badge = lead.priority ? getPriorityBadge(lead.priority) : null;
                                        return (
                                            <tr key={lead.place_id} className="hover:bg-gray-50/50 transition-colors">
                                                <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                        <h3 style={{ fontSize: 'var(--t-base)', fontWeight: 600, color: 'var(--ink-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lead.name}>
                                                            {lead.name}
                                                        </h3>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                                                            {lead.rating && (
                                                                <span className="badge badge-warning" style={{ gap: 3 }}>
                                                                    <Star size={9} fill="currentColor" />
                                                                    {lead.rating}
                                                                    {lead.user_ratings_total !== undefined && <span style={{ opacity: 0.65, fontWeight: 400 }}>({lead.user_ratings_total})</span>}
                                                                </span>
                                                            )}
                                                            {badge && (
                                                                <span className="badge badge-default" title={lead.score_reasons?.join('\n') || `Score: ${lead.lead_score}`}>
                                                                    {badge.label}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                        {lead.website ? (
                                                            <a href={lead.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--t-xs)', color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: 200 }} title={lead.website}>{lead.website}</a>
                                                        ) : (
                                                            <span style={{ fontSize: 'var(--t-xs)', color: 'var(--danger-500)', fontStyle: 'italic' }}>No website</span>
                                                        )}
                                                        {lead.phone && (
                                                            <button
                                                                onClick={() => { navigator.clipboard.writeText(lead.phone!); toast.success('Phone copied!'); }}
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--t-xs)', color: 'var(--ink-secondary)', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                                                                title="Click to copy"
                                                            >
                                                                <Phone size={11} style={{ color: 'var(--ink-muted)', flexShrink: 0 }} />
                                                                {lead.phone}
                                                            </button>
                                                        )}
                                                        {lead.formatted_address && (
                                                            <a
                                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.formatted_address)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}
                                                            >
                                                                <MapPin size={11} style={{ color: 'var(--ink-muted)', flexShrink: 0 }} />
                                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{lead.formatted_address}</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', verticalAlign: 'middle' }}>
                                                    <div className={`score-circle ${
                                                        (lead.lead_score ?? 0) >= 80 ? 'score-high' :
                                                        (lead.lead_score ?? 0) >= 50 ? 'score-medium' : 'score-low'
                                                    }`}>
                                                        {lead.lead_score ?? 0}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', verticalAlign: 'middle' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                                        <button onClick={() => quickAudit(lead)} disabled={!lead.website || scanningLead === lead.place_id} className="btn btn-secondary btn-sm">
                                                            {scanningLead === lead.place_id ? 'Queuing...' : 'Audit'}
                                                        </button>
                                                        <button onClick={() => handleSave(lead)} disabled={savingLead === lead.place_id} className="btn btn-primary btn-sm">
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
                                <div className="empty-state">
                                    <div className="empty-state-icon"><Search size={20} /></div>
                                    <p className="empty-state-title">No results</p>
                                    <p className="empty-state-desc">No leads found for that search. Try a different query.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {/* Pipeline & Leads */}
                {activeTab === 'leads' && (
                    <div className="card" style={{ overflow: 'hidden', minHeight: 500 }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--neutral-50)' }}>
                            <h2 style={{ fontSize: 'var(--t-md)', fontWeight: 700, color: 'var(--ink-primary)', letterSpacing: '-0.02em' }}>Leads Pipeline</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div className="tab-bar" style={{ padding: '2px' }}>
                                    <button
                                        onClick={() => setLeadsView('list')}
                                        className={`tab-item${leadsView === 'list' ? ' active' : ''}`}
                                        title="List view"
                                    >
                                        <List size={14} />
                                        List
                                    </button>
                                    <button
                                        onClick={() => setLeadsView('kanban')}
                                        className={`tab-item${leadsView === 'kanban' ? ' active' : ''}`}
                                        title="Kanban view"
                                    >
                                        <LayoutGrid size={14} />
                                        Board
                                    </button>
                                </div>

                                {isPro && (
                                    <button
                                        onClick={() => handleExportCSV(false)}
                                        disabled={exporting}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        <Download size={13} />
                                        {exporting ? 'Exporting...' : 'CSV'}
                                    </button>
                                )}

                                <button
                                    onClick={() => handleExport(false)}
                                    disabled={exporting}
                                    className="btn btn-primary btn-sm"
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
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                            <Users size={32} />
                                        </div>
                                        <p className="text-gray-500 font-medium">No leads in your pipeline yet.</p>
                                        <button onClick={() => changeTab('find')} className="mt-2 text-[#39C0B3] font-bold hover:underline">Find Leads &rarr;</button>
                                    </div>
                                )}

                                {myLeads.filter(l => !showFavoritesOnly || l.is_favorite).length > 0 && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[950px] bg-white">
                                            <thead className="bg-gray-50/50">
                                                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    {isEnterprise && <th className="p-4 w-12 text-center">Sel</th>}
                                                    <th className="p-4 font-semibold text-gray-400">Business Details</th>
                                                    <th className="p-4 font-semibold text-gray-400">Contact & Address</th>
                                                    <th className="p-4 font-semibold text-gray-400">Status</th>
                                                    <th className="p-4 font-semibold text-gray-400">Est. Value</th>
                                                    <th className="p-4 font-semibold text-gray-400 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {myLeads.filter(l => !showFavoritesOnly || l.is_favorite).map((lead) => (
                                                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                                                        {isEnterprise && (
                                                            <td className="p-4 text-center align-middle">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedLeads.has(lead.id)}
                                                                    onChange={() => toggleLeadSelection(lead.id)}
                                                                    className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-400"
                                                                />
                                                            </td>
                                                        )}
                                                        <td className="p-4 align-top">
                                                            <div className="flex items-start gap-3">
                                                                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border shrink-0 mt-0.5",
                                                                    lead.status === 'audited' ? "bg-teal-50 text-teal-600 border-teal-200" : "bg-gray-100 text-gray-500 border-gray-200"
                                                                )}>
                                                                    {lead.business_name.substring(0, 1)}
                                                                </div>
                                                                <div className="flex flex-col gap-0.5">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-sm text-gray-900 line-clamp-1" title={lead.business_name}>
                                                                            {lead.business_name}
                                                                        </span>
                                                                        {isEnterprise && (
                                                                            <button
                                                                                onClick={() => handleToggleFavorite(lead.id)}
                                                                                className={cn(
                                                                                    "p-1 rounded transition-colors",
                                                                                    lead.is_favorite ? "text-amber-400 fill-amber-400 hover:text-amber-500" : "text-gray-300 hover:text-amber-400"
                                                                                )}
                                                                                title={lead.is_favorite ? "Remove favorite" : "Mark favorite"}
                                                                            >
                                                                                <Star size={15} fill={lead.is_favorite ? "currentColor" : "none"} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    {lead.website_url ? (
                                                                        <a href={lead.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline line-clamp-1" title={lead.website_url}>{lead.website_url}</a>
                                                                    ) : (
                                                                        <span className="text-xs text-red-400 italic">No website</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 align-top">
                                                            <div className="flex flex-col gap-1">
                                                                {lead.phone && (
                                                                    <button 
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(lead.phone!);
                                                                            toast.success("Phone number copied!");
                                                                        }}
                                                                        className="text-xs text-gray-600 flex items-center gap-1.5 hover:text-teal-600 transition-colors focus:outline-none w-fit"
                                                                        title="Click to copy phone number"
                                                                    >
                                                                        <Phone size={12} className="text-teal-500 shrink-0" />
                                                                        <span className="line-clamp-1">{lead.phone}</span>
                                                                    </button>
                                                                )}
                                                                {lead.address && (
                                                                    <a
                                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address)}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-xs text-gray-500 flex items-center gap-1.5 hover:text-teal-600 transition-colors line-clamp-1"
                                                                        title="View on Google Maps"
                                                                    >
                                                                        <MapPin size={12} className="text-teal-500 shrink-0" />
                                                                        <span className="line-clamp-1">{lead.address}</span>
                                                                    </a>
                                                                )}
                                                                {!lead.phone && !lead.address && (
                                                                    <span className="text-xs text-gray-400 italic">No contact info</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 align-top">
                                                            <select
                                                                value={lead.status}
                                                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                                className={cn(
                                                                    "text-xs font-bold px-3 py-1 rounded-full border outline-none cursor-pointer capitalize transition-all",
                                                                    lead.status === 'new' ? "bg-gray-100 text-gray-600 border-gray-200" :
                                                                    lead.status === 'auditing' ? "bg-amber-50 text-amber-600 border-amber-200" :
                                                                    lead.status === 'audited' ? "bg-blue-50 text-blue-600 border-blue-200" :
                                                                    lead.status === 'contacted' ? "bg-purple-50 text-purple-600 border-purple-200" :
                                                                    "bg-green-50 text-green-600 border-green-200"
                                                                )}
                                                            >
                                                                <option value="new">New</option>
                                                                <option value="auditing">Auditing</option>
                                                                <option value="audited">Audited</option>
                                                                <option value="contacted">Contacted</option>
                                                                <option value="closed">Closed</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4 align-top">
                                                            <div className="relative w-24">
                                                                <span className="absolute left-2 top-1 text-gray-400 text-xs">$</span>
                                                                <input
                                                                    type="number"
                                                                    defaultValue={lead.value || ''}
                                                                    onBlur={(e) => handleValueChange(lead.id, e.target.value)}
                                                                    className="w-full pl-5 bg-transparent border-b border-gray-200 hover:border-gray-400 focus:border-teal-500 text-xs font-semibold text-gray-800 px-1 py-1 outline-none transition-colors"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="p-4 align-top text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                {lead.status === 'audited' && (
                                                                    <button
                                                                        onClick={() => handleGenerateEmail(lead.id, lead.business_name)}
                                                                        disabled={generatingEmail === lead.id}
                                                                        className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                                                                        title="Outreach Email"
                                                                    >
                                                                        <Mail size={14} />
                                                                    </button>
                                                                )}
                                                                {lead.website_url && (
                                                                    <button
                                                                        onClick={() => handleScan(lead.website_url, lead.id)}
                                                                        className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                                                                        title="Re-Audit"
                                                                    >
                                                                        <RefreshCw size={14} />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDeleteLeads([lead.id])}
                                                                    className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
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
