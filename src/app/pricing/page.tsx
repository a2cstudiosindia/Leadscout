"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function PricingPage() {
    return (
        <DashboardShell>
            <div className="flex flex-col items-center justify-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center max-w-2xl mb-16">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-gray-500 text-lg">Choose the plan that best fits your agency's needs. Scale as you grow.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
                    {/* Starter Plan */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group hover:border-teal-200 transition-all hover:shadow-lg">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wide">Starter</h3>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-gray-800">$0</span>
                                <span className="text-gray-400">/mo</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">Perfect for trying out LeadScout.</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0"><Check size={12} /></span>
                                5 Audits per month
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0"><Check size={12} /></span>
                                Basic PDF Reports
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0"><Check size={12} /></span>
                                Lead Discovery (10 leads)
                            </li>
                        </ul>

                        <button className="w-full py-3 rounded-xl border border-teal-400 text-teal-500 font-bold hover:bg-teal-50 transition-colors">
                            Current Plan
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-gray-900 p-8 rounded-2xl shadow-xl flex flex-col relative overflow-hidden transform scale-105 z-10">
                        <div className="absolute top-0 right-0 bg-teal-400 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-teal-400 uppercase tracking-wide">Agency Pro</h3>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">$49</span>
                                <span className="text-gray-400">/mo</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">For growing agencies running outreach.</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0"><Check size={12} /></span>
                                Unlimited Audits
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0"><Check size={12} /></span>
                                White-label PDF Reports
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0"><Check size={12} /></span>
                                Unlimited Lead Discovery
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0"><Check size={12} /></span>
                                Priority Support
                            </li>
                        </ul>

                        <button className="w-full py-3 rounded-xl bg-teal-400 text-white font-bold hover:bg-teal-500 transition-colors shadow-lg shadow-teal-900/50">
                            Upgrade Now
                        </button>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group hover:border-teal-200 transition-all hover:shadow-lg">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wide">Enterprise</h3>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-gray-800">$199</span>
                                <span className="text-gray-400">/mo</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">Custom solutions for large teams.</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0"><Check size={12} /></span>
                                Everything in Pro
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0"><Check size={12} /></span>
                                API Access
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0"><Check size={12} /></span>
                                Dedicated Account Manager
                            </li>
                        </ul>

                        <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
