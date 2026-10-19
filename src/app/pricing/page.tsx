"use client";

import { useState, useEffect } from "react";
import { Check, Crown, Sparkles, CreditCard, Layers } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getSubscriptionInfo } from "@/lib/subscription";
import { checkout } from "@/lib/auth-client";
import { CREDIT_PACKS } from "@/lib/plans";
import toast, { Toaster } from "react-hot-toast";

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [currentPlan, setCurrentPlan] = useState<string>('free');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    // Load subscription info
    useEffect(() => {
        getSubscriptionInfo().then((info) => {
            if (info) {
                setCurrentPlan(info.plan);
            }
        });
    }, []);

    async function handleCheckout(plan: 'pro' | 'enterprise') {
        if (currentPlan === plan) {
            window.location.href = '/portal';
            return;
        }
        setLoading(plan);
        try {
            const res = await checkout(plan);
            if (res && 'error' in res && res.error) {
                if (res.error.status === 401 || res.error.message?.toLowerCase().includes('logged in')) {
                    toast.error('Please sign in to choose a subscription plan');
                    window.location.href = `/login?redirect=/pricing`;
                    return;
                }
                toast.error(res.error.message || 'Checkout failed');
            } else if (res && 'data' in res && res.data?.url) {
                window.location.href = res.data.url;
            }
        } catch (err: any) {
            toast.error(err?.message || 'Something went wrong');
        } finally {
            setLoading(null);
        }
    }

    return (
        <DashboardShell>
            <Toaster position="top-right" />

            <div className="space-y-12 py-4 animate-fade-in max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-[var(--border)]">
                    <div>
                        <span className="text-[11px] font-semibold text-[var(--brand-600)] uppercase tracking-wider block mb-1">
                            Flexible Agency Plans
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink-primary)]">
                            Predictable Pricing for Growing Agencies
                        </h1>
                        <p className="text-xs sm:text-sm text-[var(--ink-tertiary)] mt-1 max-w-xl">
                            Scale lead discovery, automated website audits, deal pipelines, and client retainers with transparent pricing.
                        </p>
                    </div>

                    {/* Billing Cycle Toggle */}
                    <div className="flex items-center p-1 rounded-[var(--r-lg)] bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                        <button 
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-3.5 py-1.5 rounded-[var(--r-md)] text-xs font-semibold tracking-wide transition-all ${
                                billingCycle === 'monthly'
                                    ? 'bg-[var(--neutral-900)] text-white shadow-xs'
                                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                            }`}
                        >
                            Monthly
                        </button>
                        <button 
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-3.5 py-1.5 rounded-[var(--r-md)] text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                                billingCycle === 'yearly'
                                    ? 'bg-[var(--neutral-900)] text-white shadow-xs'
                                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                            }`}
                        >
                            <span>Annual</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800">
                                -20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {/* Free Plan */}
                    <div className="card p-6 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            <div>
                                <span className="badge badge-default uppercase tracking-wider text-[10px]">Starter</span>
                                <div className="flex items-baseline gap-1 mt-3">
                                    <span className="text-3xl font-bold text-[var(--ink-primary)] tabular-nums">$0</span>
                                    <span className="text-xs text-[var(--ink-tertiary)]">/month</span>
                                </div>
                                <p className="text-xs text-[var(--ink-secondary)] mt-1.5">Free for individuals testing local lead discovery.</p>
                            </div>

                            <ul className="space-y-3 pt-2 text-xs text-[var(--ink-secondary)]">
                                <li className="flex items-center gap-2.5">
                                    <Check size={14} className="text-emerald-600 shrink-0" />
                                    <span><strong>10 Leads</strong> per month</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check size={14} className="text-emerald-600 shrink-0" />
                                    <span><strong>5 Audits</strong> per month</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check size={14} className="text-emerald-600 shrink-0" />
                                    <span>20 Discovery Searches</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check size={14} className="text-emerald-600 shrink-0" />
                                    <span>Pipeline & Deals Board</span>
                                </li>
                            </ul>
                        </div>

                        <button 
                            disabled 
                            className="btn btn-secondary w-full opacity-60 cursor-default"
                        >
                            {currentPlan === 'free' ? 'Current Plan' : 'Free Tier'}
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="card p-6 flex flex-col justify-between space-y-6 border-2 border-[var(--brand-500)] shadow-sm relative">
                        <div className="absolute -top-3 left-6">
                            <span className="bg-[var(--brand-500)] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                Recommended
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="badge badge-brand uppercase tracking-wider text-[10px]">Professional</span>
                                <div className="flex items-baseline gap-1 mt-3">
                                    <span className="text-3xl font-bold text-[var(--ink-primary)] tabular-nums">
                                        {billingCycle === 'monthly' ? '$29' : '$24'}
                                    </span>
                                    <span className="text-xs text-[var(--ink-tertiary)]">/month</span>
                                </div>
                                <p className="text-xs text-[var(--ink-secondary)] mt-1.5">For active freelancers and boutique agencies.</p>
                            </div>

                            <ul className="space-y-3 pt-2 text-xs text-[var(--ink-secondary)]">
                                <li className="flex items-center gap-2.5 font-medium text-[var(--ink-primary)]">
                                    <Check size={14} className="text-[var(--brand-500)] shrink-0" />
                                    <span><strong>500 Leads</strong> per month</span>
                                </li>
                                <li className="flex items-center gap-2.5 font-medium text-[var(--ink-primary)]">
                                    <Check size={14} className="text-[var(--brand-500)] shrink-0" />
                                    <span><strong>50 Deep Audits</strong> per month</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check size={14} className="text-[var(--brand-500)] shrink-0" />
                                    <span>Interactive Shareable Web Reports</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check size={14} className="text-[var(--brand-500)] shrink-0" />
                                    <span>AI Cold Pitch Email Generator</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check size={14} className="text-[var(--brand-500)] shrink-0" />
                                    <span>CSV Data Exports</span>
                                </li>
                            </ul>
                        </div>

                        <button 
                            onClick={() => handleCheckout('pro')}
                            disabled={loading === 'pro'}
                            className="btn btn-primary w-full"
                        >
                            {loading === 'pro' 
                                ? 'Processing...' 
                                : currentPlan === 'pro' 
                                    ? 'Manage Subscription' 
                                    : 'Upgrade to Pro'}
                        </button>
                    </div>

                    {/* Agency Plan */}
                    <div className="card p-6 flex flex-col justify-between space-y-6 bg-[var(--neutral-950)] text-white border-[var(--sidebar-border)] shadow-md">
                        <div className="space-y-4">
                            <div>
                                <span className="plan-badge plan-badge-enterprise">Agency Scale</span>
                                <div className="flex items-baseline gap-1 mt-3">
                                    <span className="text-3xl font-bold text-white tabular-nums">
                                        {billingCycle === 'monthly' ? '$79' : '$65'}
                                    </span>
                                    <span className="text-xs text-white/50">/month</span>
                                </div>
                                <p className="text-xs text-white/70 mt-1.5">For scaling digital agencies with sales teams.</p>
                            </div>

                            <ul className="space-y-3 pt-2 text-xs text-white/80">
                                <li className="flex items-center gap-2.5 font-medium text-white">
                                    <Check size={14} className="text-amber-400 shrink-0" />
                                    <span><strong>Unlimited Leads & Audits</strong></span>
                                </li>
                                <li className="flex items-center gap-2.5 font-medium text-white">
                                    <Check size={14} className="text-amber-400 shrink-0" />
                                    <span><strong>Clients Hub & MRR Tracking</strong></span>
                                </li>
                                <li className="flex items-center gap-2.5 text-white">
                                    <Check size={14} className="text-amber-400 shrink-0" />
                                    <span>B2B Deal Exchange Network</span>
                                </li>
                                <li className="flex items-center gap-2.5 text-white">
                                    <Check size={14} className="text-amber-400 shrink-0" />
                                    <span>White-Label Client Reports & Branding</span>
                                </li>
                                <li className="flex items-center gap-2.5 text-white">
                                    <Check size={14} className="text-amber-400 shrink-0" />
                                    <span>REST API Keys & Priority Queues</span>
                                </li>
                            </ul>
                        </div>

                        <button 
                            onClick={() => handleCheckout('enterprise')}
                            disabled={loading === 'enterprise'}
                            className="btn w-full bg-white text-[var(--neutral-950)] hover:bg-neutral-100 font-semibold"
                        >
                            {loading === 'enterprise' 
                                ? 'Processing...' 
                                : currentPlan === 'enterprise' 
                                    ? 'Manage Subscription' 
                                    : 'Upgrade to Agency'}
                        </button>
                    </div>
                </div>

                {/* Credit Packs */}
                <div className="card p-6 space-y-4">
                    <div>
                        <h2 className="text-base font-bold text-[var(--ink-primary)]">Pay-As-You-Go Credit Packs</h2>
                        <p className="text-xs text-[var(--ink-tertiary)] mt-0.5">Need a quick burst of searches or audits without altering your base plan?</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {CREDIT_PACKS.map((pack) => (
                            <div key={pack.id} className="card p-4 text-center space-y-2 border border-[var(--border)] bg-[var(--canvas)]">
                                <h3 className="font-semibold text-xs text-[var(--ink-primary)]">{pack.label}</h3>
                                <p className="text-xl font-bold text-[var(--ink-primary)] tabular-nums">${pack.price}</p>
                                <p className="text-[11px] text-[var(--ink-muted)]">One-time purchase</p>
                                <button
                                    onClick={() => toast('Credit packs coming soon!')}
                                    className="btn btn-secondary btn-sm w-full"
                                >
                                    Buy Credits
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feature Comparison */}
                <div className="card p-6 overflow-x-auto space-y-4">
                    <h2 className="text-base font-bold text-[var(--ink-primary)]">Detailed Feature Matrix</h2>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Capability</th>
                                <th style={{ textAlign: 'center' }}>Free</th>
                                <th style={{ textAlign: 'center' }}>Pro ($29)</th>
                                <th style={{ textAlign: 'center' }}>Agency ($79)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ['Local Business Discovery', '20 / mo', '500 / mo', 'Unlimited'],
                                ['Website Audit Engine', '5 / mo', '50 / mo', 'Unlimited'],
                                ['Pipeline & Deals Kanban', 'Included', 'Included', 'Included'],
                                ['Interactive Shareable Web Reports', '—', 'Included', 'White-Labeled'],
                                ['AI Cold Pitch Emails', '—', 'Included', 'Included'],
                                ['Active Clients Hub & MRR', '—', '—', 'Included'],
                                ['B2B Deal Exchange Network', '—', '—', 'Included'],
                                ['CSV & Excel Data Export', '—', 'CSV', 'Excel + Audits'],
                                ['REST API Access', '—', '—', 'Included'],
                            ].map(([feature, free, pro, agency]) => (
                                <tr key={feature}>
                                    <td className="font-medium">{feature}</td>
                                    <td style={{ textAlign: 'center' }} className="text-[var(--ink-tertiary)]">{free}</td>
                                    <td style={{ textAlign: 'center' }} className="font-semibold text-[var(--brand-600)]">{pro}</td>
                                    <td style={{ textAlign: 'center' }} className="font-bold text-[var(--ink-primary)]">{agency}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardShell>
    );
}
