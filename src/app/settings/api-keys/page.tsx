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
                    <div className="font-bold text-teal-500 animate-pulse">Loading...</div>
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell>
            <Toaster position="top-right" />
            <div className="slide-in-from-bottom-4 space-y-8 mx-auto max-w-4xl animate-in duration-500 fade-in">
                {/* Header */}
                <div>
                    <h1 className="font-bold text-gray-800 text-3xl">API Keys</h1>
                    <p className="mt-1 text-gray-500">Manage your API keys for programmatic access</p>
                </div>

                {/* Upgrade Prompt for Free Users */}
                {!hasApiAccess && (
                    <div className="bg-gradient-to-r from-teal-400 to-teal-500 p-8 rounded-2xl text-white">
                        <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertCircle size={24} />
                                    <h3 className="font-bold text-xl">Upgrade to Unlock API Access</h3>
                                </div>
                                <p className="max-w-lg text-teal-50">
                                    API access is available on Pro and Enterprise plans. Generate API keys to integrate LeadScout with your existing tools and automate your workflow.
                                </p>
                            </div>
                            <a
                                href="/pricing"
                                className="bg-white hover:bg-gray-50 shadow-lg px-6 py-3 rounded-xl font-bold text-teal-600 whitespace-nowrap transition-all"
                            >
                                View Pricing Plans
                            </a>
                        </div>
                    </div>
                )}

                {/* New Key Display (shown once after generation) */}
                {newKey && (
                    <div className="bg-teal-50 p-6 border border-teal-200 rounded-2xl">
                        <h3 className="mb-2 font-bold text-teal-800">Your New API Key</h3>
                        <p className="mb-4 text-teal-700 text-sm">
                            Copy this key now. You won't be able to see it again!
                        </p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white px-4 py-3 border border-teal-200 rounded-xl overflow-x-auto font-mono text-sm">
                                {newKey}
                            </code>
                            <button
                                onClick={copyKey}
                                className="bg-teal-400 hover:bg-teal-500 p-3 rounded-xl text-white transition-colors"
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                        <button
                            onClick={() => setNewKey(null)}
                            className="mt-4 text-teal-600 hover:text-teal-700 text-sm"
                        >
                            I've saved my key, dismiss this
                        </button>
                    </div>
                )}

                {/* Generate New Key */}
                {hasApiAccess && (
                    <div className="bg-white shadow-sm p-6 border border-gray-100 rounded-2xl">
                        <h3 className="flex items-center gap-2 mb-4 font-bold text-gray-800">
                            <Plus size={18} className="text-teal-500" />
                            Generate New Key
                        </h3>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="Key name (e.g., Production, Testing)"
                                className="flex-1 bg-gray-50 p-4 border border-gray-200 focus:border-transparent rounded-xl outline-none focus:ring-2 focus:ring-teal-400"
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={generating || !hasApiAccess}
                                className="bg-teal-400 hover:bg-teal-500 disabled:opacity-50 px-6 py-4 rounded-xl font-bold text-white transition-all"
                            >
                                {generating ? "Generating..." : "Generate"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Existing Keys */}
                <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="p-6 border-gray-100 border-b">
                        <h3 className="flex items-center gap-2 font-bold text-gray-800">
                            <Key size={18} className="text-teal-500" />
                            Your API Keys
                        </h3>
                    </div>

                    {keys.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {keys.map((key) => (
                                <div key={key.id} className="flex justify-between items-center p-6">
                                    <div>
                                        <h4 className="font-medium text-gray-800">{key.name}</h4>
                                        <div className="mt-1 text-gray-500 text-sm">
                                            Created: {new Date(key.created_at).toLocaleDateString()}
                                            {key.last_used && ` • Last used: ${new Date(key.last_used).toLocaleDateString()}`}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRevoke(key.id)}
                                        className="hover:bg-red-50 p-2 rounded-lg text-red-500 transition-colors"
                                        title="Revoke key"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-gray-400 text-center">
                            No API keys yet. Generate one above to get started.
                        </div>
                    )}
                </div>

                {/* API Documentation */}
                <div className="bg-white shadow-sm p-6 border border-gray-100 rounded-2xl">
                    <h3 className="mb-4 font-bold text-gray-800">Quick Start</h3>
                    <pre className="bg-gray-900 p-4 rounded-xl overflow-x-auto text-gray-100 text-sm">
                        {`curl -X GET \\
  https://your-domain.com/api/v1/leads \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                    <p className="text-sm text-gray-500 mt-4">
                        See the full API documentation at <Link href="/api/docs" className="text-teal-500 hover:underline">/api/docs</Link>
                    </p>
                </div>
            </div>
        </DashboardShell>
    );
}
