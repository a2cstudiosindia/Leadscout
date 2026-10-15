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
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">API Access Keys</h1>
                    <p className="text-xs text-zinc-500 mt-1">Authenticate server-to-server requests against the LeadScout v1 API</p>
                </div>

                {/* Upgrade Prompt for Free Users */}
                {!hasApiAccess && (
                    <div className="bg-white border border-zinc-200 p-6 rounded-xl text-zinc-900">
                        <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <AlertCircle size={18} className="text-zinc-500" />
                                    <h3 className="font-semibold text-sm text-zinc-900">API Access Restricted</h3>
                                </div>
                                <p className="max-w-xl text-xs text-zinc-500 leading-relaxed">
                                    Automated programmatic access requires a Pro or Enterprise workspace. Unlock high-throughput endpoints to sync leads directly into your internal databases or custom webhooks.
                                </p>
                            </div>
                            <Link
                                href="/pricing"
                                className="bg-zinc-100 hover:bg-black text-white px-4 py-2 rounded-lg font-semibold text-xs whitespace-nowrap transition-colors"
                            >
                                Upgrade Plan
                            </Link>
                        </div>
                    </div>
                )}

                {/* New Key Display */}
                {newKey && (
                    <div className="bg-zinc-100 border border-zinc-300 p-5 rounded-xl">
                        <h3 className="font-semibold text-xs text-zinc-800 mb-1">Generated Secret API Key</h3>
                        <p className="text-[11px] text-zinc-500 mb-3">
                            Make sure to save this secret key now. It will not be shown again.
                        </p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-zinc-100 px-3.5 py-2.5 border border-zinc-200 rounded-lg overflow-x-auto font-mono text-xs text-zinc-900">
                                {newKey}
                            </code>
                            <button
                                onClick={copyKey}
                                className="bg-zinc-100 hover:bg-zinc-200 p-2.5 rounded-lg text-zinc-800 border border-zinc-300 transition-colors"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                        <button
                            onClick={() => setNewKey(null)}
                            className="mt-3 text-[11px] text-zinc-500 hover:text-zinc-700 font-mono transition-colors"
                        >
                            Dismiss secret notice
                        </button>
                    </div>
                )}

                {/* Generate New Key */}
                {hasApiAccess && (
                    <div className="bg-white p-5 border border-zinc-200 rounded-xl">
                        <h3 className="flex items-center gap-2 mb-3 font-semibold text-xs text-zinc-800 uppercase tracking-wider font-mono">
                            <Plus size={14} className="text-zinc-500" />
                            Provision New Token
                        </h3>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="Token identifier (e.g., CI Runner, Production Webhook)"
                                className="flex-1 bg-zinc-50 px-3.5 py-2.5 border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-500 outline-none"
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={generating || !hasApiAccess}
                                className="bg-zinc-100 hover:bg-black disabled:opacity-50 px-4 py-2.5 rounded-lg text-xs font-semibold text-white transition-colors"
                            >
                                {generating ? "Generating..." : "Generate Token"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Existing Keys */}
                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-zinc-200 bg-zinc-50">
                        <h3 className="font-semibold text-xs text-zinc-800 uppercase tracking-wider font-mono flex items-center gap-2">
                            <Key size={14} className="text-zinc-500" />
                            Active API Tokens
                        </h3>
                    </div>

                    {keys.length > 0 ? (
                        <div className="divide-y divide-zinc-200">
                            {keys.map((key) => (
                                <div key={key.id} className="flex justify-between items-center p-4">
                                    <div>
                                        <h4 className="font-medium text-xs text-zinc-800">{key.name}</h4>
                                        <div className="mt-0.5 text-zinc-500 text-[11px] font-mono">
                                            Created: {new Date(key.created_at).toLocaleDateString()}
                                            {key.last_used && ` • Active: ${new Date(key.last_used).toLocaleDateString()}`}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleRevoke(key.id)}
                                            className="hover:bg-red-50 border border-transparent hover:border-red-200 p-1.5 rounded-md text-zinc-500 hover:text-red-600 transition-colors"
                                            title="Revoke key"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-zinc-500 text-xs text-center font-mono">
                            No API tokens active. Provision a key above to initiate programmatic access.
                        </div>
                    )}
                </div>

                {/* API Documentation */}
                <div className="bg-white p-5 border border-zinc-200 rounded-xl">
                    <h3 className="mb-2 font-semibold text-xs text-zinc-800 uppercase tracking-wider font-mono">Quick Request Example</h3>
                    <pre className="bg-zinc-100 p-3.5 rounded-lg overflow-x-auto text-zinc-700 font-mono text-[11px] border border-zinc-200">
{`curl -X GET \\
  https://leadscout.app/api/v1/leads \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                    <p className="text-[11px] text-zinc-500 mt-3 font-mono">
                        View comprehensive endpoint schema: <Link href="/docs/api" className="text-zinc-700 underline hover:text-white">/docs/api</Link>
                    </p>
                </div>
            </div>
        </DashboardShell>
    );
}
