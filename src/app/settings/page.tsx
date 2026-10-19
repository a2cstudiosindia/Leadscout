"use client";

import { useState, useEffect } from "react";
import { getProfile, updateProfile, uploadLogo } from "../actions";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Save, Building, Upload, CreditCard, LogOut, User, Calendar, ExternalLink } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import { signOut, customerPortal } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const [agencyName, setAgencyName] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [calendarLink, setCalendarLink] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        getProfile().then((data) => {
            if (data && data.profile) {
                setAgencyName(data.profile.agency_name || "");
                setLogoUrl(data.profile.agency_logo_url || "");
                setCalendarLink(data.profile.calendar_link || "");
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
            agency_logo_url: logoUrl,
            calendar_link: calendarLink,
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
            if (result.data?.url) {
                window.location.href = result.data.url;
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
                <div className="text-xs font-semibold text-[var(--ink-muted)]">Loading settings...</div>
            </div>
        </DashboardShell>
    );

    return (
        <DashboardShell>
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto space-y-6 py-2 animate-fade-in">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink-primary)]">Agency Settings</h1>
                    <p className="text-xs sm:text-sm text-[var(--ink-tertiary)] mt-1">Configure your agency branding, client report white-labeling, and calendar integration.</p>
                </div>

                {/* General Information Card */}
                <div className="card overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--canvas)] flex items-center gap-2">
                        <Building size={18} className="text-[var(--brand-500)]" />
                        <h2 className="font-semibold text-sm text-[var(--ink-primary)]">
                            Brand & White-Label Information
                        </h2>
                    </div>

                    <div className="p-5 sm:p-6 space-y-5">
                        {/* Agency Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[var(--ink-primary)]">Agency Name</label>
                            <input
                                type="text"
                                value={agencyName}
                                onChange={(e) => setAgencyName(e.target.value)}
                                placeholder="e.g. Apex Digital Marketing"
                                className="input"
                            />
                            <p className="text-[11px] text-[var(--ink-tertiary)]">This name will appear on all client-facing audit reports and AI pitch emails.</p>
                        </div>

                        {/* Calendar / Strategy Call Link */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[var(--ink-primary)]">Strategy Call Booking Link (Cal.com / Calendly)</label>
                            <input
                                type="url"
                                value={calendarLink}
                                onChange={(e) => setCalendarLink(e.target.value)}
                                placeholder="https://cal.com/your-agency/15min or https://calendly.com/your-agency"
                                className="input"
                            />
                            <p className="text-[11px] text-[var(--ink-tertiary)]">Embedded directly into your shareable web audit pitch links so leads can instantly schedule calls.</p>
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[var(--ink-primary)]">Agency Logo</label>
                            <div className="flex gap-4 items-start pt-1">
                                <div className="flex-1 space-y-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="input text-xs file:mr-3 file:py-1 file:px-3 file:rounded-[var(--r-sm)] file:border-0 file:text-xs file:font-semibold file:bg-[var(--brand-50)] file:text-[var(--brand-600)] hover:file:bg-[var(--brand-100)]"
                                    />
                                    <p className="text-[11px] text-[var(--ink-tertiary)]">PNG or JPG recommended (max 2MB). Shown in header of public audit reports.</p>
                                </div>
                                <div className="w-20 h-20 bg-[var(--canvas)] rounded-[var(--r-md)] border border-dashed border-[var(--border-strong)] flex items-center justify-center shrink-0 overflow-hidden">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Preview" className="w-full h-full object-contain p-1" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    ) : (
                                        <span className="text-[10px] text-[var(--ink-muted)] font-medium">No Logo</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-[var(--canvas)] border-t border-[var(--border)] flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn btn-primary"
                        >
                            {saving ? "Saving..." : <><Save size={14} /><span>Save Brand Settings</span></>}
                        </button>
                    </div>
                </div>

                {/* Billing Settings */}
                <div className="card overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--canvas)] flex items-center gap-2">
                        <CreditCard size={18} className="text-[var(--brand-500)]" />
                        <h2 className="font-semibold text-sm text-[var(--ink-primary)]">
                            Subscription & Invoicing
                        </h2>
                    </div>
                    <div className="p-5 sm:p-6 space-y-3">
                        <p className="text-xs text-[var(--ink-secondary)]">Manage your billing details, download VAT invoices, or modify your subscription tier.</p>
                        <button 
                            onClick={handleManageBilling}
                            className="btn btn-secondary"
                        >
                            Open Billing Portal
                        </button>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="card overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--canvas)] flex items-center gap-2">
                        <User size={18} className="text-rose-500" />
                        <h2 className="font-semibold text-sm text-[var(--ink-primary)]">
                            Session & Security
                        </h2>
                    </div>
                    <div className="p-5 sm:p-6 space-y-3">
                        <p className="text-xs text-[var(--ink-secondary)]">Sign out of your active agency workspace on this browser.</p>
                        <button 
                            onClick={handleLogout}
                            className="btn btn-secondary text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                            <LogOut size={14} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
