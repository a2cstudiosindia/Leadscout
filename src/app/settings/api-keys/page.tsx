"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { generateApiKey, listApiKeys, revokeApiKey } from "@/lib/api-keys";
import { getSubscriptionInfo } from "@/lib/subscription";
import { Key, Plus, Trash2, Copy, Check, AlertCircle, Shield } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface ApiKey {
    id: string;
    name: string;
    last_used: string | null;
    created_at: string;
    key_hash?: string;
}

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [newKey, setNewKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [hasApiAccess, setHasApiAccess] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const [keysResult, subInfo] = await Promise.all([
            listApiKeys(),
            getSubscriptionInfo(),
        ]);

        if (keysResult.success) {
            setKeys(keysResult.keys);
        }

        setHasApiAccess(subInfo?.features?.apiAccess ?? false);
        setLoading(false);
    }

    async function handleGenerate() {
        if (!newKeyName.trim()) {
            toast.error("Please enter a name for the key");
            return;
        }

        setGenerating(true);
        const result = await generateApiKey(newKeyName.trim());

        if (result.success && result.apiKey) {
            setNewKey(result.apiKey);
            setNewKeyName("");
            toast.success("API key generated!");
            fetchData();
        } else {
            toast.error(result.error || "Failed to generate key");
        }

        setGenerating(false);
    }

    async function handleRevoke(keyId: string) {
        if (!confirm("Are you sure? This cannot be undone.")) return;

        const result = await revokeApiKey(keyId);
        if (result.success) {
            toast.success("API key revoked");
            setKeys(keys.filter(k => k.id !== keyId));
        } else {
            toast.error(result.error || "Failed to revoke key");
        }
    }

    function copyKey() {
        if (newKey) {
            navigator.clipboard.writeText(newKey);
            setCopied(true);
            toast.success("Copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        }
    }

    if (loading) {
        return (
            <DashboardShell>
                <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="text-xs font-semibold text-[var(--ink-muted)]">Loading API keys...</div>
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell>
            <Toaster position="top-right" />
            <div className="space-y-6 mx-auto max-w-4xl py-2 animate-fade-in">
                {/* Header */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink-primary)]">Developer API Keys</h1>
                    <p className="text-xs sm:text-sm text-[var(--ink-tertiary)] mt-1">Manage secret keys for programmatic lead discovery and website audits.</p>
                </div>

                {/* Upgrade Prompt for Free Users */}
                {!hasApiAccess && (
                    <div className="card p-6 bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Shield size={18} className="text-[var(--brand-500)]" />
                                    <h3 className="font-semibold text-sm text-[var(--ink-primary)]">Unlock Developer REST API Access</h3>
                                </div>
                                <p className="text-xs text-[var(--ink-secondary)] max-w-lg leading-relaxed">
                                    Automate your client prospecting pipeline by integrating LeadScout audits into your CRM and internal workflows. Available on Professional and Agency plans.
                                </p>
                            </div>
                            <Link
                                href="/pricing"
                                className="btn btn-primary btn-sm shrink-0"
                            >
                                View Plans & Upgrade
                            </Link>
                        </div>
                    </div>
                )}

                {/* New Key Display (shown once after generation) */}
                {newKey && (
                    <div className="card p-5 bg-[var(--surface)] border-2 border-[var(--brand-500)] space-y-3">
                        <div className="space-y-1">
                            <h3 className="font-semibold text-xs text-[var(--ink-primary)]">Your New Secret API Key</h3>
                            <p className="text-xs text-amber-600 font-medium">
                                Copy this key immediately. For security, it will not be displayed again.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-[var(--canvas)] px-3 py-2 border border-[var(--border)] rounded-[var(--r-md)] font-mono text-xs text-[var(--ink-primary)] overflow-x-auto">
                                {newKey}
                            </code>
                            <button
                                onClick={copyKey}
                                className="btn btn-primary btn-sm shrink-0"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copied ? "Copied" : "Copy"}</span>
                            </button>
                        </div>
                        <button
                            onClick={() => setNewKey(null)}
                            className="text-xs text-[var(--ink-tertiary)] hover:text-[var(--ink-primary)] underline"
                        >
                            I have securely saved this key, dismiss alert
                        </button>
                    </div>
                )}

                {/* Generate New Key */}
                {hasApiAccess && (
                    <div className="card p-5 space-y-3">
                        <h3 className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-[var(--ink-primary)]">
                            <Plus size={14} className="text-[var(--brand-500)]" />
                            <span>Create New API Key</span>
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="Key identifier (e.g. Production Webhook, Zapier Sync)"
                                className="input flex-1"
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={generating || !hasApiAccess}
                                className="btn btn-primary sm:w-auto"
                            >
                                {generating ? "Generating..." : "Generate Key"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Existing Keys */}
                <div className="card overflow-hidden">
                    <div className="p-4 border-b border-[var(--border)] bg-[var(--canvas)] flex items-center gap-2">
                        <Key size={16} className="text-[var(--brand-500)]" />
                        <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--ink-primary)]">
                            Active Secret Keys
                        </h3>
                    </div>

                    {keys.length > 0 ? (
                        <div className="divide-y divide-[var(--border)]">
                            {keys.map((key) => (
                                <div key={key.id} className="flex justify-between items-center p-4 text-xs">
                                    <div className="space-y-0.5">
                                        <h4 className="font-semibold text-[var(--ink-primary)]">{key.name}</h4>
                                        <div className="text-[11px] text-[var(--ink-tertiary)] flex items-center gap-3">
                                            <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                                            {key.last_used && (
                                                <span>Last used: {new Date(key.last_used).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRevoke(key.id)}
                                        className="btn btn-ghost btn-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                        title="Revoke key"
                                    >
                                        <Trash2 size={14} />
                                        <span>Revoke</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-xs text-[var(--ink-muted)]">
                            No API keys generated yet.
                        </div>
                    )}
                </div>
            </div>
        </DashboardShell>
    );
}
