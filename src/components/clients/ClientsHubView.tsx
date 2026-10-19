"use client";

import { useState, useEffect } from "react";
import { getClients, createClientAccount, updateClientAccount, deleteClientAccount } from "@/app/hub-actions";
import { ClientStatus, BillingType } from "@/lib/database.types";
import { 
    Briefcase, 
    Plus, 
    DollarSign, 
    Calendar, 
    Mail, 
    Phone, 
    ExternalLink, 
    Trash2, 
    CheckCircle2, 
    TrendingUp, 
    Users,
    Search,
    X,
    Clock
} from "lucide-react";
import toast from "react-hot-toast";

interface Client {
    id: string;
    company_name: string;
    website_url?: string | null;
    primary_contact_name?: string | null;
    primary_contact_email?: string | null;
    primary_contact_phone?: string | null;
    status: ClientStatus;
    billing_type: BillingType;
    monthly_value: number;
    contract_start_date?: string | null;
    contract_renewal_date?: string | null;
    notes?: string | null;
    created_at: string;
}

export default function ClientsHubView() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        company_name: "",
        website_url: "",
        primary_contact_name: "",
        primary_contact_email: "",
        primary_contact_phone: "",
        status: "active" as ClientStatus,
        billing_type: "monthly_retainer" as BillingType,
        monthly_value: 1500,
        contract_start_date: new Date().toISOString().split('T')[0],
        contract_renewal_date: "",
        notes: "",
    });

    const fetchClientsList = async () => {
        setLoading(true);
        try {
            const res = await getClients();
            if (res.success && res.clients) {
                setClients(res.clients as any);
            }
        } catch (e) {
            console.error("Fetch clients error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientsList();
    }, []);

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.company_name.trim()) {
            toast.error("Company name is required");
            return;
        }

        try {
            const res = await createClientAccount({
                ...formData,
                monthly_value: Number(formData.monthly_value) || 0,
            });

            if (res.success) {
                toast.success("Client account added!");
                setShowAddModal(false);
                setFormData({
                    company_name: "",
                    website_url: "",
                    primary_contact_name: "",
                    primary_contact_email: "",
                    primary_contact_phone: "",
                    status: "active",
                    billing_type: "monthly_retainer",
                    monthly_value: 1500,
                    contract_start_date: new Date().toISOString().split('T')[0],
                    contract_renewal_date: "",
                    notes: "",
                });
                fetchClientsList();
            } else {
                toast.error(res.error || "Failed to create client");
            }
        } catch (err: any) {
            toast.error(err.message || "Error creating client");
        }
    };

    const handleStatusChange = async (clientId: string, newStatus: ClientStatus) => {
        try {
            const res = await updateClientAccount(clientId, { status: newStatus });
            if (res.success) {
                toast.success(`Client marked as ${newStatus}`);
                fetchClientsList();
            } else {
                toast.error("Failed to update status");
            }
        } catch (e) {
            toast.error("Error updating client");
        }
    };

    const handleDeleteClient = async (clientId: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            const res = await deleteClientAccount(clientId);
            if (res.success) {
                toast.success("Client account removed");
                fetchClientsList();
            } else {
                toast.error("Failed to delete client");
            }
        } catch (e) {
            toast.error("Error deleting client");
        }
    };

    // Metrics calculations
    const activeClients = clients.filter(c => c.status === 'active' || c.status === 'onboarding');
    const totalMRR = activeClients.reduce((sum, c) => sum + Number(c.monthly_value || 0), 0);
    const avgRetainer = activeClients.length > 0 ? Math.round(totalMRR / activeClients.length) : 0;
    const retainerCount = clients.filter(c => c.billing_type === 'monthly_retainer').length;

    const filteredClients = clients.filter(c => {
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        const matchesQuery = 
            c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.primary_contact_name && c.primary_contact_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (c.primary_contact_email && c.primary_contact_email.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesQuery;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink-primary)] flex items-center gap-2.5">
                        <Briefcase className="w-6 h-6 text-[var(--brand-500)]" />
                        Active Clients Hub
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--ink-tertiary)] mt-1">
                        Track contracted accounts, monthly recurring retainers, deliverables, and renewal schedules.
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Client Account</span>
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="card p-4">
                    <span className="text-[11px] font-semibold text-[var(--ink-tertiary)] uppercase tracking-wider block">Active Accounts</span>
                    <span className="text-xl sm:text-2xl font-bold text-[var(--ink-primary)] tabular-nums mt-1 block">{activeClients.length}</span>
                </div>

                <div className="card p-4">
                    <span className="text-[11px] font-semibold text-[var(--ink-tertiary)] uppercase tracking-wider block">Contracted MRR</span>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-600 tabular-nums mt-1 block">
                        ${totalMRR.toLocaleString()}<span className="text-xs font-normal text-[var(--ink-tertiary)]">/mo</span>
                    </span>
                </div>

                <div className="card p-4">
                    <span className="text-[11px] font-semibold text-[var(--ink-tertiary)] uppercase tracking-wider block">Avg Retainer</span>
                    <span className="text-xl sm:text-2xl font-bold text-[var(--ink-primary)] tabular-nums mt-1 block">
                        ${avgRetainer.toLocaleString()}<span className="text-xs font-normal text-[var(--ink-tertiary)]">/mo</span>
                    </span>
                </div>

                <div className="card p-4">
                    <span className="text-[11px] font-semibold text-[var(--ink-tertiary)] uppercase tracking-wider block">Recurring Retainers</span>
                    <span className="text-xl sm:text-2xl font-bold text-[var(--brand-600)] tabular-nums mt-1 block">
                        {retainerCount}
                    </span>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="card p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[var(--ink-muted)]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search company or contact..."
                        className="input pl-8"
                    />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
                    {['all', 'active', 'onboarding', 'paused', 'churned'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-[var(--r-md)] capitalize transition-all shrink-0 ${
                                statusFilter === status
                                    ? 'bg-[var(--neutral-900)] text-white font-semibold'
                                    : 'text-[var(--ink-secondary)] hover:bg-[var(--neutral-100)]'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Clients Table */}
            {loading ? (
                <div className="py-20 text-center text-xs font-medium text-[var(--ink-muted)]">
                    Loading Client Accounts...
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="card p-12 text-center border-dashed border-[var(--border-strong)] space-y-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--brand-50)] text-[var(--brand-500)] mx-auto flex items-center justify-center">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                        <h3 className="font-semibold text-[var(--ink-primary)] text-sm">No Client Accounts Found</h3>
                        <p className="text-xs text-[var(--ink-tertiary)]">
                            {searchQuery || statusFilter !== 'all' 
                                ? "No client matches your active filters. Try clearing your search." 
                                : "Convert deals directly from your Pipeline Kanban or add accounts manually to manage ongoing retainers."}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-primary"
                    >
                        Add First Client
                    </button>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Client / Company</th>
                                    <th>Contact Details</th>
                                    <th>Retainer / Billing</th>
                                    <th>Contract Dates</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map((client) => (
                                    <tr key={client.id}>
                                        <td>
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5 font-semibold text-[var(--ink-primary)]">
                                                    <span>{client.company_name}</span>
                                                    {client.website_url && (
                                                        <a
                                                            href={client.website_url.startsWith('http') ? client.website_url : `https://${client.website_url}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[var(--brand-600)] hover:text-[var(--brand-700)]"
                                                        >
                                                            <ExternalLink className="w-3 h-3 inline" />
                                                        </a>
                                                    )}
                                                </div>
                                                {client.notes && (
                                                    <p className="text-[11px] text-[var(--ink-tertiary)] truncate max-w-xs font-normal">
                                                        {client.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                            {client.primary_contact_name || client.primary_contact_email ? (
                                                <div className="space-y-0.5">
                                                    <span className="font-medium text-[var(--ink-primary)] block">
                                                        {client.primary_contact_name || "—"}
                                                    </span>
                                                    {client.primary_contact_email && (
                                                        <a 
                                                            href={`mailto:${client.primary_contact_email}`} 
                                                            className="text-[11px] text-[var(--brand-600)] hover:underline block"
                                                        >
                                                            {client.primary_contact_email}
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[var(--ink-muted)] italic text-[11px]">No contact logged</span>
                                            )}
                                        </td>

                                        <td>
                                            <div className="space-y-0.5">
                                                <span className="font-bold text-xs text-[var(--ink-primary)] tabular-nums block">
                                                    ${Number(client.monthly_value || 0).toLocaleString()}
                                                    <span className="text-[10px] text-[var(--ink-tertiary)] font-normal">
                                                        {client.billing_type === 'monthly_retainer' ? '/mo' : ''}
                                                    </span>
                                                </span>
                                                <span className="text-[10px] font-medium text-[var(--ink-muted)] uppercase tracking-wide">
                                                    {client.billing_type.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="text-[11px] text-[var(--ink-secondary)]">
                                            <div className="space-y-0.5">
                                                <span>Start: {client.contract_start_date || 'N/A'}</span>
                                                {client.contract_renewal_date && (
                                                    <span className="block font-medium text-[var(--brand-600)]">
                                                        Renewal: {client.contract_renewal_date}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                            <select
                                                value={client.status}
                                                onChange={(e) => handleStatusChange(client.id, e.target.value as ClientStatus)}
                                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-[var(--r-sm)] border outline-none cursor-pointer ${
                                                    client.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    client.status === 'onboarding' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    client.status === 'paused' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-gray-100 text-gray-600 border-gray-200'
                                                }`}
                                            >
                                                <option value="active">Active</option>
                                                <option value="onboarding">Onboarding</option>
                                                <option value="paused">Paused</option>
                                                <option value="churned">Churned</option>
                                            </select>
                                        </td>

                                        <td className="text-right">
                                            <button
                                                onClick={() => handleDeleteClient(client.id, client.company_name)}
                                                className="btn btn-ghost btn-sm text-[var(--ink-muted)] hover:text-rose-600"
                                                title="Delete client"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Client Modal */}
            {showAddModal && (
                <div className="modal-backdrop">
                    <div className="modal-content max-w-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-[var(--brand-50)] text-[var(--brand-600)] rounded-[var(--r-md)]">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-[var(--ink-primary)] text-sm">New Client Account</h3>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-[var(--ink-muted)] hover:text-[var(--ink-primary)] p-1 rounded-[var(--r-sm)]"
                                aria-label="Close modal"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateClient} className="space-y-3.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                        Company Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        placeholder="e.g. Austin Dental Care"
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                        Website URL
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.website_url}
                                        onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                        placeholder="austindental.com"
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                        Contact Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.primary_contact_name}
                                        onChange={(e) => setFormData({ ...formData, primary_contact_name: e.target.value })}
                                        placeholder="Dr. John Doe"
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.primary_contact_email}
                                        onChange={(e) => setFormData({ ...formData, primary_contact_email: e.target.value })}
                                        placeholder="john@austindental.com"
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.primary_contact_phone}
                                        onChange={(e) => setFormData({ ...formData, primary_contact_phone: e.target.value })}
                                        placeholder="(512) 555-0199"
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                        Billing Structure
                                    </label>
                                    <select
                                        value={formData.billing_type}
                                        onChange={(e: any) => setFormData({ ...formData, billing_type: e.target.value })}
                                        className="select"
                                    >
                                        <option value="monthly_retainer">Monthly Retainer</option>
                                        <option value="one_time">One-Time Project</option>
                                        <option value="milestone">Milestone</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                        Value ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.monthly_value}
                                        onChange={(e) => setFormData({ ...formData, monthly_value: Number(e.target.value) })}
                                        placeholder="1500"
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                        Contract Renewal
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.contract_renewal_date}
                                        onChange={(e) => setFormData({ ...formData, contract_renewal_date: e.target.value })}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                    Notes & Deliverables
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Scope: Monthly website maintenance, SEO monitoring, speed optimization..."
                                    className="input"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Save Client Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
