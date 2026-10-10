"use client";

import { useState, useEffect } from "react";
import { getProfile, updateProfile, uploadLogo } from "../actions";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Save, Building, Upload, CreditCard, LogOut, User } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import { signOut, customerPortal } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const [agencyName, setAgencyName] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        getProfile().then((data) => {
            if (data && data.profile) {
                setAgencyName(data.profile.agency_name || "");
                setLogoUrl(data.profile.agency_logo_url || "");
            }
            setLoading(false);
        });
    }, []);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('logo', file);

        const result = await uploadLogo(formData);
        if (result.success && result.logoUrl) {
            setLogoUrl(result.logoUrl);
            toast.success('Logo uploaded successfully!');
        } else {
            toast.error('Failed to upload logo: ' + result.error);
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
        toast.success('Settings saved successfully!');
    };

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
    };

    const handleManageBilling = async () => {
        try {
            const result = await customerPortal();
            if (result.data) {
                window.location.href = result.data;
            } else {
                toast.error("Failed to open billing portal");
            }
        } catch (error) {
            toast.error("Billing portal error");
        }
    };

    if (loading) return (
        <DashboardShell>
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-pulse text-teal-500 font-bold">Loading settings...</div>
            </div>
        </DashboardShell>
    );

    return (
        <DashboardShell>
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Agency Settings</h1>
                    <p className="text-gray-500 mt-2">Manage your agency branding for white-label reports.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <Building size={20} className="text-teal-500" />
                            General Information
                        </h2>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Agency Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Agency Name</label>
                            <input
                                type="text"
                                value={agencyName}
                                onChange={(e) => setAgencyName(e.target.value)}
                                placeholder="e.g. Apex Digital Marketing"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all"
                            />
                            <p className="text-xs text-gray-400">This name will appear on all your audit reports.</p>
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Agency Logo</label>
                            <div className="flex gap-4 items-start">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                    />
                                    <p className="text-xs text-gray-400 mt-2">Upload your agency logo (PNG or JPG recommended, max 2MB).</p>
                                </div>
                                <div className="w-24 h-24 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center shrink-0 overflow-hidden">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    ) : (
                                        <span className="text-xs text-gray-400 font-medium">No Logo</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-teal-400 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-500 disabled:opacity-50 transition-all shadow-md active:scale-95"
                        >
                            {saving ? "Saving..." : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </div>

                {/* Billing Settings */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <CreditCard size={20} className="text-teal-500" />
                            Billing & Subscription
                        </h2>
                    </div>
                    <div className="p-8 space-y-4">
                        <p className="text-gray-500 text-sm">Manage your billing details, view past invoices, or upgrade/cancel your plan.</p>
                        <button 
                            onClick={handleManageBilling}
                            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors flex items-center gap-2 shadow-sm"
                        >
                            Manage Subscription
                        </button>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <User size={20} className="text-red-500" />
                            Account Settings
                        </h2>
                    </div>
                    <div className="p-8 space-y-4">
                        <p className="text-gray-500 text-sm">Sign out of your account on this device.</p>
                        <button 
                            onClick={handleLogout}
                            className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <LogOut size={18} />
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
