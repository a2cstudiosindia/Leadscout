"use client";

import { useState, useEffect } from "react";
import { Check, Crown } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getSubscriptionInfo } from "@/lib/subscription";
import { checkout } from "@/lib/auth-client";
import toast, { Toaster } from "react-hot-toast";

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [currentPlan, setCurrentPlan] = useState<string>('free');

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
            toast.error('You are already on this plan');
            return;
        }
        setLoading(plan);
        try {
            await checkout(plan);
        } catch {
            toast.error('Something went wrong');
        }
        setLoading(null);
    }

    return (
        <DashboardShell>
            <Toaster position="top-right" />
            <div className="flex flex-col items-center justify-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center max-w-2xl mb-16">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-gray-500 text-lg">Choose the plan that best fits your agency&apos;s needs. Scale as you grow.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4" role="list" aria-label="Pricing plans">
                    {/* Free Plan */}
                    <article className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group hover:border-teal-200 transition-all hover:shadow-lg" role="listitem" aria-labelledby="free-plan-title">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wide">Free</h3>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-gray-800">$0</span>
                                <span className="text-gray-400">/mo</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">Perfect for trying out LeadScout.</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0"><Check size={12} /></span>
                                10 Leads per month
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0"><Check size={12} /></span>
                                5 Audits per month
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0"><Check size={12} /></span>
                                20 Searches per month
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0"><Check size={12} /></span>
                                Basic Lead Management
                            </li>
                        </ul>

                        {currentPlan === 'free' ? (
                            <button disabled className="w-full py-3 rounded-xl border border-gray-200 text-gray-400 font-bold cursor-not-allowed flex items-center justify-center gap-2">
                                <Crown size={16} />
                                Current Plan
                            </button>
                        ) : (
                            <button disabled className="w-full py-3 rounded-xl border border-gray-200 text-gray-400 font-bold cursor-not-allowed">
                                Free Plan
                            </button>
                        )}
                    </article>

                    {/* Pro Plan */}
                    <div className="bg-gray-900 p-8 rounded-2xl shadow-xl flex flex-col relative overflow-hidden transform scale-105 z-10">
                        <div className="absolute top-0 right-0 bg-teal-400 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-teal-400 uppercase tracking-wide">Pro</h3>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">$29</span>
                                <span className="text-gray-400">/mo</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">For growing agencies running outreach.</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0"><Check size={12} /></span>
                                100 Leads per month
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0"><Check size={12} /></span>
                                50 Audits per month
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0"><Check size={12} /></span>
                                500 Searches per month
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0"><Check size={12} /></span>
                                API Access
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0"><Check size={12} /></span>
                                White-label PDF Reports
                            </li>
                        </ul>

                        {currentPlan === 'pro' ? (
                            <button disabled className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold cursor-not-allowed flex items-center justify-center gap-2">
                                <Crown size={16} />
                                Current Plan
                            </button>
                        ) : (
                            <button
                                onClick={() => handleCheckout('pro')}
                                disabled={loading === 'pro'}
                                className="w-full py-3 rounded-xl bg-teal-400 text-white font-bold hover:bg-teal-500 transition-colors shadow-lg shadow-teal-900/50 disabled:opacity-50"
                            >
                                {loading === 'pro' ? 'Processing...' : 'Upgrade to Pro'}
                            </button>
                        )}
                    </div>

                    {/* Enterprise Plan */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group hover:border-teal-200 transition-all hover:shadow-lg">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wide">Enterprise</h3>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-gray-800">$79</span>
                                <span className="text-gray-400">/mo</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">Unlimited power for large teams.</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0"><Check size={12} /></span>
                                Unlimited Leads
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0"><Check size={12} /></span>
                                Unlimited Audits
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0"><Check size={12} /></span>
                                Unlimited Searches
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0"><Check size={12} /></span>
                                Priority API Access
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0"><Check size={12} /></span>
                                Priority Support
                            </li>
                            {/* Coming Soon Feature */}
                            <li className="flex items-center gap-3 text-sm">
                                <span className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-500 flex items-center justify-center shrink-0">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72" />
                                    </svg>
                                </span>
                                <span className="text-gray-500">AI Auto-Call Handling</span>
                                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
                                    COMING SOON
                                </span>
                            </li>
                        </ul>

                        {currentPlan === 'enterprise' ? (
                            <button disabled className="w-full py-3 rounded-xl bg-teal-400 text-white font-bold cursor-not-allowed flex items-center justify-center gap-2">
                                <Crown size={16} />
                                Current Plan
                            </button>
                        ) : (
                            <button
                                onClick={() => handleCheckout('enterprise')}
                                disabled={loading === 'enterprise'}
                                className="w-full py-3 rounded-xl border border-teal-400 text-teal-500 font-bold hover:bg-teal-50 transition-colors disabled:opacity-50"
                            >
                                {loading === 'enterprise' ? 'Processing...' : 'Upgrade to Enterprise'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </DashboardShell >
    );
}

