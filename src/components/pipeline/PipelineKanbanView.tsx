"use client";

import { useState } from "react";
import { 
    PipelineStage 
} from "@/lib/database.types";
import { 
    updateLeadPipelineStage, 
    generateShareableReport, 
    convertLeadToClient 
} from "@/app/hub-actions";
import { updateLead } from "@/app/actions";
import { 
    Building2, 
    ExternalLink, 
    Share2, 
    Mail, 
    CheckCircle2, 
    DollarSign, 
    Clock, 
    User, 
    Trash2, 
    Star, 
    ArrowRight, 
    TrendingUp,
    Sparkles,
    Check,
    Globe,
    Phone,
    X,
    Layers
} from "lucide-react";
import toast from "react-hot-toast";

interface LeadItem {
    id: string;
    business_name: string;
    website_url?: string | null;
    phone?: string | null;
    address?: string | null;
    pipeline_stage?: PipelineStage;
    value?: number | null;
    lead_score?: number | null;
    is_favorite?: boolean;
    contact_name?: string | null;
    contact_email?: string | null;
    contact_role?: string | null;
    created_at?: string;
    notes?: string | null;
    reports?: any[];
}

interface PipelineKanbanViewProps {
    leads: LeadItem[];
    onRefresh: () => void;
    onGenerateEmail: (leadId: string, leadName: string) => void;
    onToggleFavorite: (leadId: string) => void;
    onDeleteLead: (leadId: string) => void;
}

const STAGES: { id: PipelineStage; label: string; dotColor: string }[] = [
    { id: 'lead', label: 'Discovered', dotColor: 'bg-slate-400' },
    { id: 'audit_sent', label: 'Audit Sent', dotColor: 'bg-[var(--brand-500)]' },
    { id: 'contacted', label: 'Outreached', dotColor: 'bg-blue-500' },
    { id: 'call_booked', label: 'Call Booked', dotColor: 'bg-amber-500' },
    { id: 'proposal_sent', label: 'Proposal Out', dotColor: 'bg-purple-500' },
    { id: 'closed_won', label: 'Closed Won', dotColor: 'bg-emerald-500' },
    { id: 'closed_lost', label: 'Closed Lost', dotColor: 'bg-rose-500' },
];

export default function PipelineKanbanView({
    leads,
    onRefresh,
    onGenerateEmail,
    onToggleFavorite,
    onDeleteLead,
}: PipelineKanbanViewProps) {
    const [sharingReportId, setSharingReportId] = useState<string | null>(null);
    const [shareModal, setShareModal] = useState<{ url: string; slug: string; businessName: string } | null>(null);
    const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);
    const [convertModal, setConvertModal] = useState<LeadItem | null>(null);
    const [retainerValue, setRetainerValue] = useState<number>(1500);
    const [billingType, setBillingType] = useState<'monthly_retainer' | 'one_time' | 'milestone'>('monthly_retainer');
    const [copied, setCopied] = useState(false);

    const handleStageChange = async (leadId: string, newStage: PipelineStage) => {
        try {
            const res = await updateLeadPipelineStage(leadId, newStage);
            if (res.success) {
                toast.success(`Moved to ${newStage.replace('_', ' ')}`);
                onRefresh();
            } else {
                toast.error("Failed to move deal");
            }
        } catch (e: any) {
            toast.error(e.message || "Error updating stage");
        }
    };

    const handleShareReport = async (lead: LeadItem) => {
        setSharingReportId(lead.id);
        try {
            const reportId = (lead as any).reports?.[0]?.id || (lead as any).report_id;
            const res = await generateShareableReport(reportId || lead.id);
            if (res.success && res.url) {
                const fullUrl = `${window.location.origin}${res.url}`;
                setShareModal({
                    url: fullUrl,
                    slug: res.slug || '',
                    businessName: lead.business_name,
                });
            } else {
                toast.error(res.error || "Please run an audit on this lead first.");
            }
        } catch (e: any) {
            toast.error(e.message || "Could not generate shareable report");
        } finally {
            setSharingReportId(null);
        }
    };

    const handleConvertConfirm = async () => {
        if (!convertModal) return;
        setConvertingLeadId(convertModal.id);
        try {
            const res = await convertLeadToClient(convertModal.id, {
                monthly_value: Number(retainerValue) || 0,
                billing_type: billingType,
                notes: `Converted from lead pipeline. Original score: ${convertModal.lead_score || 'N/A'}`
            });

            if (res.success) {
                toast.success(`Converted ${convertModal.business_name} to Active Client`);
                setConvertModal(null);
                onRefresh();
            } else {
                toast.error(res.error || "Failed to convert client");
            }
        } catch (e: any) {
            toast.error(e.message || "Conversion failed");
        } finally {
            setConvertingLeadId(null);
        }
    };

    const totalPipelineValue = leads.reduce((acc, l) => acc + (l.value || 0), 0);
    const wonCount = leads.filter(l => (l.pipeline_stage || 'lead') === 'closed_won').length;

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Top Pipeline Overview Card */}
            <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[var(--brand-50)] text-[var(--brand-600)] rounded-[var(--r-md)]">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-sm text-[var(--ink-primary)]">Deals & Outreach Pipeline</h2>
                            <span className="badge badge-default tabular-nums">{leads.length} Active Deals</span>
                        </div>
                        <p className="text-xs text-[var(--ink-tertiary)] mt-0.5">Drag or select stages as prospect audits transition to signed contracts.</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 text-xs border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-2 sm:pt-0 sm:pl-6">
                    <div>
                        <span className="text-[11px] text-[var(--ink-muted)] block uppercase tracking-wider font-semibold">Total Pipeline Value</span>
                        <span className="text-sm font-bold text-[var(--ink-primary)] tabular-nums">
                            ${totalPipelineValue.toLocaleString()}
                        </span>
                    </div>
                    <div>
                        <span className="text-[11px] text-[var(--ink-muted)] block uppercase tracking-wider font-semibold">Closed Won</span>
                        <span className="text-sm font-bold text-emerald-600 tabular-nums">
                            {wonCount} Deals Won
                        </span>
                    </div>
                </div>
            </div>

            {/* Kanban Columns */}
            <div className="kanban-board">
                {STAGES.map((stage) => {
                    const stageLeads = leads.filter(l => (l.pipeline_stage || 'lead') === stage.id);
                    const stageValue = stageLeads.reduce((acc, l) => acc + (l.value || 0), 0);

                    return (
                        <div 
                            key={stage.id} 
                            className="kanban-column"
                        >
                            {/* Column Header */}
                            <div className="kanban-column-header">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className={`w-2 h-2 rounded-full ${stage.dotColor} shrink-0`} />
                                    <span className="kanban-column-title truncate">
                                        {stage.label}
                                    </span>
                                    <span className="kanban-count tabular-nums">
                                        {stageLeads.length}
                                    </span>
                                </div>
                                <span className="text-[11px] font-semibold text-[var(--ink-muted)] tabular-nums shrink-0">
                                    ${stageValue.toLocaleString()}
                                </span>
                            </div>

                            {/* Column Cards */}
                            <div className="space-y-2.5 overflow-y-auto max-h-[680px] pr-0.5">
                                {stageLeads.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-[var(--ink-muted)] border border-dashed border-[var(--border)] rounded-[var(--r-md)] bg-[var(--surface)]">
                                        No deals in stage
                                    </div>
                                ) : (
                                    stageLeads.map((lead) => (
                                        <div 
                                            key={lead.id} 
                                            className="kanban-card space-y-2.5"
                                        >
                                            {/* Card Top: Name & Favorite */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="kanban-card-name truncate" title={lead.business_name}>
                                                        {lead.business_name}
                                                    </h4>
                                                    {lead.website_url && (
                                                        <a 
                                                            href={lead.website_url.startsWith('http') ? lead.website_url : `https://${lead.website_url}`} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            className="text-[11px] text-[var(--brand-600)] hover:underline truncate block"
                                                        >
                                                            {lead.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                                        </a>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => onToggleFavorite(lead.id)}
                                                    className="text-[var(--ink-muted)] hover:text-amber-500 transition-colors shrink-0 p-0.5"
                                                    aria-label={lead.is_favorite ? "Unstar deal" : "Star deal"}
                                                >
                                                    <Star 
                                                        className={`w-3.5 h-3.5 ${lead.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} 
                                                    />
                                                </button>
                                            </div>

                                            {/* Contact details if enriched */}
                                            {(lead.contact_name || lead.contact_email || lead.phone) && (
                                                <div className="bg-[var(--neutral-100)] rounded-[var(--r-sm)] p-2 text-[11px] text-[var(--ink-secondary)] space-y-1">
                                                    {lead.contact_name && (
                                                        <div className="flex items-center gap-1 font-medium text-[var(--ink-primary)]">
                                                            <User className="w-3 h-3 text-[var(--ink-muted)] shrink-0" />
                                                            <span className="truncate">{lead.contact_name} {lead.contact_role ? `(${lead.contact_role})` : ''}</span>
                                                        </div>
                                                    )}
                                                    {lead.contact_email && (
                                                        <div className="flex items-center gap-1 text-[var(--ink-tertiary)]">
                                                            <Mail className="w-3 h-3 text-[var(--ink-muted)] shrink-0" />
                                                            <span className="truncate">{lead.contact_email}</span>
                                                        </div>
                                                    )}
                                                    {lead.phone && !lead.contact_email && (
                                                        <div className="flex items-center gap-1 text-[var(--ink-tertiary)]">
                                                            <Phone className="w-3 h-3 text-[var(--ink-muted)] shrink-0" />
                                                            <span className="truncate">{lead.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Score & Deal Value */}
                                            <div className="flex items-center justify-between text-xs pt-0.5">
                                                <div className="flex items-center gap-0.5 font-semibold text-[var(--ink-primary)] tabular-nums">
                                                    <span className="text-emerald-600 font-bold">$</span>
                                                    <span>{(lead.value || 0).toLocaleString()}</span>
                                                </div>

                                                {lead.lead_score !== undefined && lead.lead_score !== null && (
                                                    <span className={`badge ${
                                                        lead.lead_score >= 80 ? 'badge-success' :
                                                        lead.lead_score >= 50 ? 'badge-warning' :
                                                        'badge-danger'
                                                    } tabular-nums text-[10px]`}>
                                                        Score: {lead.lead_score}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Stage Selector */}
                                            <div className="pt-2 border-t border-[var(--border)]">
                                                <select
                                                    value={lead.pipeline_stage || 'lead'}
                                                    onChange={(e) => handleStageChange(lead.id, e.target.value as PipelineStage)}
                                                    className="select text-[11px] py-1 px-2 h-7"
                                                >
                                                    {STAGES.map((s) => (
                                                        <option key={s.id} value={s.id}>
                                                            Move: {s.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="grid grid-cols-3 gap-1 pt-0.5">
                                                <button
                                                    onClick={() => handleShareReport(lead)}
                                                    disabled={sharingReportId === lead.id}
                                                    className="btn btn-secondary btn-sm text-[10px] h-7 px-1.5 justify-center"
                                                    title="Share interactive web pitch report"
                                                >
                                                    <Share2 className="w-3 h-3" />
                                                    <span>Web Link</span>
                                                </button>

                                                <button
                                                    onClick={() => onGenerateEmail(lead.id, lead.business_name)}
                                                    className="btn btn-secondary btn-sm text-[10px] h-7 px-1.5 justify-center"
                                                    title="Generate AI Cold Pitch Email"
                                                >
                                                    <Mail className="w-3 h-3" />
                                                    <span>Email</span>
                                                </button>

                                                {stage.id === 'closed_won' ? (
                                                    <button
                                                        onClick={() => setConvertModal(lead)}
                                                        className="btn btn-primary btn-sm text-[10px] h-7 px-1.5 justify-center bg-emerald-600 hover:bg-emerald-700"
                                                        title="Add to Active Clients Hub"
                                                    >
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>Client</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => onDeleteLead(lead.id)}
                                                        className="btn btn-ghost btn-sm text-[10px] h-7 px-1.5 justify-center text-[var(--ink-muted)] hover:text-rose-600"
                                                        title="Delete deal"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Shareable Web Report Modal */}
            {shareModal && (
                <div className="modal-backdrop">
                    <div className="modal-content max-w-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-[var(--brand-50)] text-[var(--brand-600)] rounded-[var(--r-md)]">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--ink-primary)] text-sm">Public Audit Web Link</h3>
                                    <p className="text-xs text-[var(--ink-tertiary)]">{shareModal.businessName}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShareModal(null)}
                                className="text-[var(--ink-muted)] hover:text-[var(--ink-primary)] p-1 rounded-[var(--r-sm)]"
                                aria-label="Close modal"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                            Send this interactive web link to your prospect. It renders a branded website diagnostic audit report with your agency name and an embedded strategy call booking button.
                        </p>

                        <div className="flex items-center gap-2 bg-[var(--canvas)] p-2 rounded-[var(--r-md)] border border-[var(--border)]">
                            <input
                                type="text"
                                readOnly
                                value={shareModal.url}
                                className="bg-transparent text-xs text-[var(--ink-primary)] w-full font-mono outline-none"
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(shareModal.url);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                    toast.success("Link copied to clipboard");
                                }}
                                className="btn btn-primary btn-sm shrink-0"
                            >
                                {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                                <span>{copied ? "Copied" : "Copy"}</span>
                            </button>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <a
                                href={shareModal.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand-600)] hover:underline"
                            >
                                <span>Preview Web Report</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>

                            <button
                                onClick={() => setShareModal(null)}
                                className="btn btn-secondary btn-sm"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Convert to Client Modal */}
            {convertModal && (
                <div className="modal-backdrop">
                    <div className="modal-content max-w-md space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-[var(--success-50)] text-emerald-600 rounded-[var(--r-md)]">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--ink-primary)] text-sm">Convert to Active Client</h3>
                                    <p className="text-xs text-[var(--ink-tertiary)]">{convertModal.business_name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setConvertModal(null)}
                                className="text-[var(--ink-muted)] hover:text-[var(--ink-primary)] p-1 rounded-[var(--r-sm)]"
                                aria-label="Close modal"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                    Billing Arrangement
                                </label>
                                <select
                                    value={billingType}
                                    onChange={(e: any) => setBillingType(e.target.value)}
                                    className="select"
                                >
                                    <option value="monthly_retainer">Monthly Retainer ($/mo)</option>
                                    <option value="one_time">One-Time Project Fee</option>
                                    <option value="milestone">Milestone Based</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                    Contract Value ($)
                                </label>
                                <input
                                    type="number"
                                    value={retainerValue}
                                    onChange={(e) => setRetainerValue(Number(e.target.value))}
                                    placeholder="1500"
                                    className="input"
                                />
                            </div>

                            <p className="text-[11px] text-[var(--ink-tertiary)]">
                                This deal will be marked as Closed Won and an account record will be created in your Clients Hub to track deliverables and monthly retainers.
                            </p>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setConvertModal(null)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConvertConfirm}
                                    disabled={convertingLeadId === convertModal.id}
                                    className="btn btn-primary bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {convertingLeadId === convertModal.id ? "Converting..." : "Confirm & Move to Clients"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
