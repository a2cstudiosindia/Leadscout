"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { generateApiKey, listApiKeys, revokeApiKey } from "@/lib/api-keys";
import { getSubscriptionInfo } from "@/lib/subscription";
import { Key, Plus, Trash2, Copy, Check, AlertCircle } from "lucide-react";
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
        let mounted = true;
        async function fetchData() {
            try {
                const [keysResult, subInfo] = await Promise.all([
                    listApiKeys(),
                    getSubscriptionInfo(),
                ]);

                if (mounted) {
                    if (keysResult.success) {
                        setKeys(keysResult.keys);
                    }
                    setHasApiAccess(subInfo?.features?.apiAccess ?? false);
                    setLoading(false);
                }
            } catch {
                if (mounted) setLoading(false);
            }
        }
        fetchData();
        return () => { mounted = false; };
    }, []);

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
            toast.success("API key generated");
            const keysResult = await listApiKeys();
            if (keysResult.success) setKeys(keysResult.keys);
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
            toast.success("Copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        }
    }

    if (loading) {
        return (
            <DashboardShell>
                <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
                    <div className="h-8 w-36 bg-zinc-100/60 rounded-md" />
                    <div className="h-44 bg-white border border-zinc-200 rounded-xl" />
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell>
            <Toaster position="top-right" toastOptions={{ style: { background: "#18181b", color: "#fafafa", border: "1px solid #3f3f46" } }} />
            <div className="space-y-8 max-w-4xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">API Access Keys</h1>
                    <p className="text-sm text-zinc-500 mt-1">Authenticate server-to-server requests against the LeadScout v1 API</p>
                </div>

                {/* Subnav Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-4">
                    <Link
                        href="/settings"
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                    >
                        General Branding
                    </Link>
                    <Link
                        href="/settings/api-keys"
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-zinc-900 text-white shadow-xs"
                    >
                        API Keys
                    </Link>
                    <Link
                        href="/api/docs"
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                    >
                        API Documentation
                    </Link>
                </div>

                {/* Upgrade Prompt for Free Users */}
                {!hasApiAccess && (
                    <div className="bg-white border border-zinc-200 p-7 rounded-2xl text-zinc-900 shadow-xs">
                        <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-2.5 mb-2">
                                    <AlertCircle size={20} className="text-zinc-700" />
                                    <h3 className="font-extrabold text-base text-zinc-900">API Access Restricted</h3>
                                </div>
                                <p className="max-w-xl text-sm text-zinc-600 leading-relaxed">
                                    Automated programmatic access requires a Pro or Enterprise workspace. Unlock high-throughput endpoints to sync leads directly into your internal databases or custom webhooks.
                                </p>
                            </div>
                            <Link
                                href="/dashboard/pricing"
                                className="bg-zinc-900 hover:bg-black text-white px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-transform hover:scale-[1.02] shadow-xs"
                            >
                                Upgrade Plan
                            </Link>
                        </div>
                    </div>
                )}

                {/* New Key Display */}
                {newKey && (
                    <div className="bg-zinc-900 text-white border border-zinc-800 p-6 rounded-2xl shadow-lg">
                        <h3 className="font-extrabold text-base text-white mb-1">Generated Secret API Key</h3>
                        <p className="text-xs text-zinc-400 mb-4">
                            Make sure to save this secret key now. For security purposes, it will not be shown again.
                        </p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-black px-4 py-3 border border-zinc-700 rounded-xl overflow-x-auto font-mono text-sm text-emerald-400">
                                {newKey}
                            </code>
                            <button
                                onClick={copyKey}
                                className="bg-white hover:bg-zinc-100 p-3 rounded-xl text-zinc-900 font-semibold transition-colors flex items-center justify-center shrink-0"
                                title="Copy to clipboard"
                            >
                                {copied ? <Check size={18} className="text-zinc-900" /> : <Copy size={18} />}
                            </button>
                        </div>
                        <button
                            onClick={() => setNewKey(null)}
                            className="mt-4 text-xs text-zinc-400 hover:text-white font-medium transition-colors"
                        >
                            Dismiss secret notice
                        </button>
                    </div>
                )}

                {/* Generate New Key */}
                {hasApiAccess && (
                    <div className="bg-white p-6 border border-zinc-200 rounded-2xl shadow-xs">
                        <h3 className="flex items-center gap-2 mb-4 font-extrabold text-sm text-zinc-900 uppercase tracking-wider font-mono">
                            <Plus size={16} className="text-zinc-700" />
                            Provision New Token
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="Token identifier (e.g., CI Runner, Production Webhook)"
                                className="flex-1 bg-zinc-50 px-4 py-3 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-none font-medium"
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={generating || !hasApiAccess}
                                className="bg-zinc-900 hover:bg-black disabled:opacity-50 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-xs"
                            >
                                {generating ? "Generating..." : "Generate Token"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Existing Keys */}
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="p-5 border-b border-zinc-200 bg-zinc-50">
                        <h3 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider font-mono flex items-center gap-2">
                            <Key size={16} className="text-zinc-600" />
                            Active API Tokens
                        </h3>
                    </div>

                    {keys.length > 0 ? (
                        <div className="divide-y divide-zinc-200">
                            {keys.map((key) => (
                                <div key={key.id} className="flex justify-between items-center p-5 hover:bg-zinc-50/50 transition-colors">
                                    <div>
                                        <h4 className="font-bold text-sm text-zinc-900">{key.name}</h4>
                                        <div className="mt-1 text-zinc-500 text-xs font-mono">
                                            Created: {new Date(key.created_at).toLocaleDateString()}
                                            {key.last_used && ` • Active: ${new Date(key.last_used).toLocaleDateString()}`}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleRevoke(key.id)}
                                            className="hover:bg-red-50 border border-transparent hover:border-red-200 p-2 rounded-xl text-zinc-400 hover:text-red-600 transition-colors"
                                            title="Revoke key"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-zinc-500 text-sm text-center font-mono">
                            No API tokens active. Provision a key above to initiate programmatic access.
                        </div>
                    )}
                </div>

                {/* API Documentation Quick Example */}
                <div className="bg-white p-6 border border-zinc-200 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider font-mono">Quick Request Example</h3>
                        <Link href="/api/docs" className="text-xs font-semibold text-zinc-900 hover:underline">
                            View API Docs &rarr;
                        </Link>
                    </div>
                    <pre className="bg-[#0c0c0e] text-zinc-200 p-4 rounded-xl overflow-x-auto font-mono text-xs border border-zinc-800">
{`curl -X GET \\
  https://api.leadscout.app/api/v1/leads \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                    <p className="text-xs text-zinc-500 mt-3 font-mono">
                        View comprehensive endpoint schema: <Link href="/api/docs" className="text-zinc-900 font-bold underline hover:text-zinc-600">/api/docs</Link>
                    </p>
                </div>
            </div>
        </DashboardShell>
    );
}
