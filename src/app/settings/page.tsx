"use client";

import { useState, useEffect } from "react";
import { getProfile, updateProfile, uploadLogo } from "../actions";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Save, Building, Upload, CreditCard, LogOut, User, CheckCircle2 } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import { signOut, customerPortal } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useCached } from "@/lib/use-cached";

export default function SettingsPage() {
    const [agencyName, setAgencyName] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const { data: profileData, loading } = useCached("profile", getProfile);
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        if (profileData?.profile && !hydrated) {
            setAgencyName(profileData.profile.agency_name || "");
            setLogoUrl(profileData.profile.agency_logo_url || "");
            setHydrated(true);
        }
    }, [profileData, hydrated]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('logo', file);

        const result = await uploadLogo(formData);
        if (result.success && result.logoUrl) {
            setLogoUrl(result.logoUrl);
            toast.success('Agency branding logo uploaded');
        } else {
            toast.error('Logo upload error: ' + (result.error || 'Unknown'));
        }
        setUploading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        await updateProfile({
            agency_name: agencyName,
            agency_logo_url: logoUrl
        });
        setSaving(false);
        toast.success('Agency settings saved');
    };

    const handleLogout = async () => {
        try { sessionStorage.clear(); } catch {}
        await signOut();
        router.push("/login");
    };

    const handleManageBilling = async () => {
        try {
            const result = await customerPortal();
            if (result.data?.url) {
                window.location.href = result.data.url;
            } else {
                toast.error("Failed to open billing portal");
            }
        } catch {
            toast.error("Billing portal unavailable");
        }
    };

    if (loading) return (
        <DashboardShell>
            <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
                <div className="h-8 w-44 bg-zinc-100/60 rounded-md mb-2" />
                <div className="h-64 bg-white border border-zinc-200 rounded-xl" />
                <div className="h-40 bg-white border border-zinc-200 rounded-xl" />
            </div>
        </DashboardShell>
    );

    return (
        <DashboardShell>
            <Toaster position="top-right" toastOptions={{ style: { background: "#18181b", color: "#fafafa", border: "1px solid #3f3f46" } }} />
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Agency Settings</h1>
                    <p className="text-sm text-zinc-500 mt-1">Configure white-label branding details for exports and audit reports</p>
                </div>

                {/* General Agency Information */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
                    <div className="p-5 border-b border-zinc-200 bg-zinc-50">
                        <h2 className="font-semibold text-base text-zinc-900 flex items-center gap-2.5">
                            <Building size={18} className="text-zinc-500" />
                            General Information
                        </h2>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Agency Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Agency Name</label>
                            <input
                                type="text"
                                value={agencyName}
                                onChange={(e) => setAgencyName(e.target.value)}
                                placeholder="e.g. Apex Strategic Growth"
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-none transition-all font-medium"
                            />
                            <p className="text-xs text-zinc-500">Rendered on client-facing PDF audit summaries and cold emails.</p>
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Agency Logo</label>
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <div className="flex-1 w-full">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-zinc-300 file:text-xs file:font-medium file:bg-zinc-100 file:text-zinc-800 hover:file:bg-zinc-700 cursor-pointer"
                                    />
                                    <p className="text-[11px] text-zinc-500 mt-1.5">PNG or SVG with transparent background recommended (Max 2MB).</p>
                                </div>
                                <div className="w-20 h-20 bg-zinc-50 rounded-lg border border-dashed border-zinc-300 flex items-center justify-center shrink-0 overflow-hidden">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain p-2" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    ) : (
                                        <span className="text-[10px] text-zinc-500 font-mono">No Logo</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm active:scale-[0.99]"
                        >
                            <Save size={16} />
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                {/* Billing Settings */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
                    <div className="p-5 border-b border-zinc-200 bg-zinc-50">
                        <h2 className="font-semibold text-base text-zinc-900 flex items-center gap-2.5">
                            <CreditCard size={18} className="text-zinc-500" />
                            Billing & Invoicing
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-zinc-500 leading-relaxed">
                            Access customer checkout portal to update credit cards, download tax receipts, or modify tier tiers.
                        </p>
                        <button 
                            onClick={handleManageBilling}
                            className="inline-flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-xs"
                        >
                            Manage Polar Subscription
                        </button>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
                    <div className="p-5 border-b border-zinc-200 bg-zinc-50">
                        <h2 className="font-semibold text-base text-zinc-900 flex items-center gap-2.5">
                            <User size={18} className="text-zinc-500" />
                            Session & Security
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-zinc-500 leading-relaxed">Terminate active credentials and invalidate session on this browser.</p>
                        <button 
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                        >
                            <LogOut size={16} />
                            Sign Out of LeadScout
                        </button>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
