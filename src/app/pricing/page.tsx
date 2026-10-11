"use client";

import { useState, useEffect } from "react";
import { Check, Crown } from "lucide-react";
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
        // Fetch current plan
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
            {/* Background gradient matching the image vibe */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#f3eff5] via-[#f8eaef] to-[#dbe0f2] opacity-70 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
                
                <div className="w-full max-w-5xl mx-auto px-4 mb-16">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                        <div className="max-w-xl text-left">
                            <h1 className="text-[2.75rem] font-medium text-[#2d2f45] mb-3 tracking-tight">Plans & Pricing</h1>
                            <p className="text-[#6c728a] text-base leading-relaxed">Whether your time-saving automation needs are large or small, we&apos;re here to help you scale.</p>
                        </div>
                        
                        <div className="flex bg-white/70 backdrop-blur-md p-1.5 rounded-full shadow-sm border border-white/80">
                            <button 
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                                    billingCycle === 'monthly'
                                        ? 'bg-teal-500 text-white shadow-md'
                                        : 'text-[#6c728a] hover:text-gray-800'
                                }`}
                            >
                                MONTHLY
                            </button>
                            <button 
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-6 py-2 rounded-full text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 ${
                                    billingCycle === 'yearly'
                                        ? 'bg-teal-500 text-white shadow-md'
                                        : 'text-[#6c728a] hover:text-gray-800'
                                }`}
                            >
                                YEARLY
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold ${
                                    billingCycle === 'yearly' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700'
                                }`}>-20%</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/80 relative">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 items-center">
                            {/* Free Plan */}
                            <div className="p-4 md:pr-8 flex flex-col h-full">
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-[2.5rem] font-bold text-[#1a1c29]">$0</span>
                                    <span className="text-[#8c92a4] font-medium text-sm">/month</span>
                                </div>
                                <h3 className="text-xl font-medium text-[#1a1c29] mb-2">Starter</h3>
                                <p className="text-sm text-[#8c92a4] mb-8 h-10">Unleash the power of automation.</p>

                                <ul className="space-y-4 mb-10 flex-1">
                                    <li className="flex items-center gap-3 text-sm text-[#6c728a] font-medium">
                                        <span className="w-[18px] h-[18px] rounded-full bg-teal-100 text-teal-500 flex items-center justify-center shrink-0"><Check size={10} strokeWidth={4} /></span>
                                        10 Leads per month
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-[#6c728a] font-medium">
                                        <span className="w-[18px] h-[18px] rounded-full bg-teal-100 text-teal-500 flex items-center justify-center shrink-0"><Check size={10} strokeWidth={4} /></span>
                                        5 Audits per month
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-[#6c728a] font-medium">
                                        <span className="w-[18px] h-[18px] rounded-full bg-teal-100 text-teal-500 flex items-center justify-center shrink-0"><Check size={10} strokeWidth={4} /></span>
                                        20 Searches per month
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-[#6c728a] font-medium">
                                        <span className="w-[18px] h-[18px] rounded-full bg-teal-100 text-teal-500 flex items-center justify-center shrink-0"><Check size={10} strokeWidth={4} /></span>
                                        Basic Lead Management
                                    </li>
                                </ul>

                                <button disabled className="w-full py-3 rounded-2xl bg-[#8c92a4]/10 text-[#6c728a] font-semibold text-sm transition-colors cursor-default">
                                    {currentPlan === 'free' ? 'Current plan' : 'Free tier'}
                                </button>
                            </div>

                            {/* Pro Plan */}
                            <div className="p-4 md:px-8 border-t md:border-t-0 md:border-l border-[#8c92a4]/20 flex flex-col h-full">
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-[2.5rem] font-bold text-[#1a1c29]">
                                        {billingCycle === 'monthly' ? '$29' : '$24'}
                                    </span>
                                    <span className="text-[#8c92a4] font-medium text-sm">/month</span>
                                </div>
                                <h3 className="text-xl font-medium text-[#1a1c29] mb-2">Professional</h3>
                                <p className="text-sm text-[#8c92a4] mb-8 h-10">Advanced tools to take your work to the next level.</p>

                                <ul className="space-y-4 mb-10 flex-1">
                                    <li className="flex items-center gap-3 text-sm text-[#6c728a] font-medium">
                                        <span className="w-[18px] h-[18px] rounded-full bg-teal-100 text-teal-500 flex items-center justify-center shrink-0"><Check size={10} strokeWidth={4} /></span>
                                        500 Leads per month
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-[#6c728a] font-medium">
                                        <span className="w-[18px] h-[18px] rounded-full bg-teal-100 text-teal-500 flex items-center justify-center shrink-0"><Check size={10} strokeWidth={4} /></span>
                                        50 Audits per month
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-[#6c728a] font-medium">
                                        <span className="w-[18px] h-[18px] rounded-full bg-teal-100 text-teal-500 flex items-center justify-center shrink-0"><Check size={10} strokeWidth={4} /></span>
                                        500 Searches per month
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-[#6c728a] font-medium">
                                        <span className="w-[18px] h-[18px] rounded-full bg-teal-100 text-teal-500 flex items-center justify-center shrink-0"><Check size={10} strokeWidth={4} /></span>
                                        CSV Export & API Access
                                    </li>
                                </ul>

                                <button 
                                    onClick={() => handleCheckout('pro')}
                                    disabled={loading === 'pro'}
                                    className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all ${
                                        currentPlan === 'pro'
                                            ? 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                                            : 'bg-[#8c92a4]/10 text-[#6c728a] hover:bg-[#8c92a4]/20 hover:text-gray-900'
                                    }`}
                                >
                                    {loading === 'pro' 
                                        ? 'Processing...' 
                                        : currentPlan === 'pro' 
                                            ? 'Manage subscription' 
                                            : 'Choose plan'}
                                </button>
                            </div>

                            {/* Agency Plan */}
                            <div className="bg-[#272545] p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.4)] flex flex-col relative transform md:scale-[1.12] z-10 text-white md:-ml-2 mt-4 md:mt-0">
                                <div className="absolute top-6 right-6 bg-[#3b3861] text-teal-400 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                                    Most Popular
                                </div>
                                
                                <div className="flex items-baseline gap-1 mb-2 mt-2">
                                    <span className="text-[2.5rem] font-bold text-white">
                                        {billingCycle === 'monthly' ? '$79' : '$65'}
                                    </span>
                                    <span className="text-gray-300 font-medium text-sm">/month</span>
                                </div>
                                <h3 className="text-xl font-medium text-white mb-2">Company</h3>
                                <p className="text-sm text-gray-300 mb-8 h-10">Automation plus enterprise-grade features.</p>

                                <ul className="space-y-4 mb-10 flex-1">
                                    <li className="flex items-center gap-3 text-sm text-gray-200 font-medium">
                                        <span className="w-[18px] h-[18px] rounded-full bg-white/20 text-white flex items-center justify-center shrink-0"><Check size={10} strokeWidth={4} /></span>
                                        Unlimited Leads & Audits
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-200 font-medium">
                                        <span className="w-[18px] h-[18px] rounded-full bg-white/20 text-white flex items-center justify-center shrink-0"><Check size={10} strokeWidth={4} /></span>
                                        Unlimited Searches
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-200 font-medium">
                                        <span className="w-[18px] h-[18px] rounded-full bg-white/20 text-white flex items-center justify-center shrink-0"><Check size={10} strokeWidth={4} /></span>
                                        Priority API Access
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-200 font-medium">
                                        <span className="w-[18px] h-[18px] rounded-full bg-white/20 text-white flex items-center justify-center shrink-0"><Check size={10} strokeWidth={4} /></span>
                                        Excel Export with Audit
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-200 font-medium">
                                        <span className="w-[18px] h-[18px] rounded-full bg-white/20 text-white flex items-center justify-center shrink-0"><Check size={10} strokeWidth={4} /></span>
                                        Favorites & Bulk Actions
                                    </li>
                                </ul>

                                <button 
                                    onClick={() => handleCheckout('enterprise')}
                                    disabled={loading === 'enterprise'}
                                    className="w-full py-3 rounded-2xl bg-teal-500 text-white font-semibold text-sm hover:bg-teal-400 transition-all mt-auto shadow-lg shadow-teal-500/20 active:scale-[0.98]"
                                >
                                    {loading === 'enterprise' 
                                        ? 'Processing...' 
                                        : currentPlan === 'enterprise' 
                                            ? 'Manage subscription' 
                                            : 'Choose plan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Credit Packs */}
                <div className="w-full max-w-4xl mt-16 px-4">
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Pay-As-You-Go Credit Packs</h2>
                    <p className="text-gray-500 text-center mb-8">Need extra capacity? Buy credits without changing your plan.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {CREDIT_PACKS.map((pack) => (
                            <div key={pack.id} className="bg-white p-6 rounded-2xl border border-gray-100 text-center hover:border-teal-200 transition-all">
                                <h3 className="font-bold text-gray-800">{pack.label}</h3>
                                <p className="text-3xl font-bold text-teal-500 mt-2">${pack.price}</p>
                                <p className="text-sm text-gray-400 mt-1">One-time purchase</p>
                                <button
                                    onClick={() => toast('Credit packs coming soon!', { icon: '💳' })}
                                    className="mt-4 w-full py-2 rounded-lg border border-teal-400 text-teal-600 font-bold text-sm hover:bg-teal-50 transition-colors"
                                >
                                    Buy Credits
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feature Comparison */}
                <div className="w-full max-w-4xl mt-16 px-4 overflow-x-auto">
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Feature Comparison</h2>
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-bold text-gray-600">Feature</th>
                                <th className="text-center py-3 px-4 font-bold text-gray-600">Free</th>
                                <th className="text-center py-3 px-4 font-bold text-teal-600">Pro</th>
                                <th className="text-center py-3 px-4 font-bold text-gray-600">Agency</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600">
                            {[
                                ['Lead Scoring', '✓', '✓', '✓'],
                                ['Website Audits', '5/mo', '50/mo', 'Unlimited'],
                                ['Lead Discovery', '10/mo', '500/mo', 'Unlimited'],
                                ['CSV Export', '—', '✓', '✓'],
                                ['Excel + Audit Data', '—', '—', '✓'],
                                ['API Access', '—', '✓', '✓'],
                                ['AI Outreach Emails', '—', '✓', '✓'],
                                ['White-label PDF', '—', '✓', '✓'],
                                ['Favorites & Bulk', '—', '—', '✓'],
                            ].map(([feature, free, pro, agency]) => (
                                <tr key={feature} className="border-b border-gray-100">
                                    <td className="py-3 px-4 font-medium">{feature}</td>
                                    <td className="text-center py-3 px-4">{free}</td>
                                    <td className="text-center py-3 px-4">{pro}</td>
                                    <td className="text-center py-3 px-4">{agency}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardShell >
    );
}

