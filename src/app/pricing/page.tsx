"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import toast, { Toaster } from "react-hot-toast";

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill?: { email?: string };
    theme?: { color?: string };
}

interface RazorpayInstance {
    open: () => void;
}

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null);

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    async function handleCheckout(plan: 'pro' | 'enterprise') {
        setLoading(plan);
        try {
            // Create order
            const res = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan }),
            });
            const data = await res.json();

            if (!data.orderId) {
                toast.error(data.error || 'Failed to create order');
                setLoading(null);
                return;
            }

            // Open Razorpay checkout
            const options: RazorpayOptions = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: 'LeadScout',
                description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Subscription`,
                order_id: data.orderId,
                handler: async (response: RazorpayResponse) => {
                    // Verify payment
                    const verifyRes = await fetch('/api/razorpay/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan,
                        }),
                    });
                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        toast.success('Payment successful! Your plan is now active.');
                        setTimeout(() => window.location.href = '/dashboard', 1500);
                    } else {
                        toast.error(verifyData.error || 'Payment verification failed');
                    }
                },
                theme: { color: '#38B2AC' },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
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
                    <p className="text-gray-500 text-lg">Choose the plan that best fits your agency's needs. Scale as you grow.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
                    {/* Free Plan */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group hover:border-teal-200 transition-all hover:shadow-lg">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wide">Free</h3>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-gray-800">₹0</span>
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
                                Basic Lead Management
                            </li>
                        </ul>

                        <button disabled className="w-full py-3 rounded-xl border border-gray-200 text-gray-400 font-bold cursor-not-allowed">
                            Current Plan
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-gray-900 p-8 rounded-2xl shadow-xl flex flex-col relative overflow-hidden transform scale-105 z-10">
                        <div className="absolute top-0 right-0 bg-teal-400 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-teal-400 uppercase tracking-wide">Pro</h3>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">₹2,499</span>
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
                                API Access
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0"><Check size={12} /></span>
                                White-label PDF Reports
                            </li>
                        </ul>

                        <button
                            onClick={() => handleCheckout('pro')}
                            disabled={loading === 'pro'}
                            className="w-full py-3 rounded-xl bg-teal-400 text-white font-bold hover:bg-teal-500 transition-colors shadow-lg shadow-teal-900/50 disabled:opacity-50"
                        >
                            {loading === 'pro' ? 'Processing...' : 'Upgrade to Pro'}
                        </button>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group hover:border-teal-200 transition-all hover:shadow-lg">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wide">Enterprise</h3>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-gray-800">₹7,999</span>
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
                                Priority API Access
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0"><Check size={12} /></span>
                                Priority Support
                            </li>
                        </ul>

                        <button
                            onClick={() => handleCheckout('enterprise')}
                            disabled={loading === 'enterprise'}
                            className="w-full py-3 rounded-xl border border-teal-400 text-teal-500 font-bold hover:bg-teal-50 transition-colors disabled:opacity-50"
                        >
                            {loading === 'enterprise' ? 'Processing...' : 'Upgrade to Enterprise'}
                        </button>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
