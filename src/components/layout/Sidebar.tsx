"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, List, Settings, Zap, CreditCard, BarChart3, Key, Menu, X, Crown, Sparkles } from "lucide-react";
import { getSubscriptionInfo } from "@/lib/subscription";

const navigation = [
    { name: "Find Leads", href: "/dashboard?tab=find", icon: Search },
    { name: "My Leads", href: "/dashboard?tab=leads", icon: List },
    { name: "Direct Scan", href: "/dashboard?tab=scan", icon: Zap },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Plans & Pricing", href: "/pricing", icon: CreditCard },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab');
    const [plan, setPlan] = useState<string | null>(null);

    useEffect(() => {
        getSubscriptionInfo().then((info) => {
            if (info && info.plan !== 'free') {
                setPlan(info.plan);
            }
        });
    }, []);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "w-64 bg-gradient-to-b from-[#39C0B3] to-[#4E81EC] min-h-screen border-none flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 shadow-xl",
                // Mobile: slide in/out
                isOpen ? "translate-x-0" : "-translate-x-full",
                // Desktop: always visible
                "md:translate-x-0"
            )}>
                <div className="p-8 pb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-white">
                            <Zap size={28} fill="currentColor" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-xl text-white tracking-tight">LeadScout</span>
                            {plan && (
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 w-fit mt-1",
                                    plan === 'enterprise'
                                        ? "bg-amber-400 text-white"
                                        : "bg-purple-500 text-white"
                                )}>
                                    {plan === 'enterprise' ? <Crown size={10} /> : <Sparkles size={10} />}
                                    {plan}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Mobile close button */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </div>

                <div className="h-px bg-white/20 mx-6 mb-6" />

                <nav className="flex-1 px-4 space-y-2">
                    {navigation.map((item) => {
                        const isMatch = (item.href.includes(`tab=${tab}`) && pathname === '/dashboard') || 
                                        (pathname === '/analytics' && item.href === '/analytics') || 
                                        (pathname === '/pricing' && item.href === '/pricing');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3.5 rounded-full text-sm font-medium transition-all duration-200 group",
                                    "hover:bg-white/10 hover:translate-x-1",
                                    isMatch ? "bg-white/20 text-white shadow-sm" : "text-white/80"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-lg transition-colors",
                                    isMatch ? "text-white" : "text-white/80 group-hover:text-white"
                                )}>
                                    <item.icon size={18} />
                                </div>
                                {item.name}
                            </Link>
                        );
                    })}

                    <div className="mt-8 px-4">
                        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4 pl-4">Account</h3>
                        <Link
                            href="/settings"
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3.5 rounded-full text-sm font-medium transition-all duration-200 group",
                                "hover:bg-white/10 hover:translate-x-1",
                                pathname.startsWith("/settings") && !pathname.includes("/api-keys") ? "bg-white/20 text-white shadow-sm" : "text-white/80"
                            )}
                        >
                            <div className={cn("p-1.5 rounded-lg transition-colors", pathname.startsWith("/settings") && !pathname.includes("/api-keys") ? "text-white" : "text-white/80 group-hover:text-white")}>
                                <Settings size={18} />
                            </div>
                            Settings
                        </Link>
                        <Link
                            href="/settings/api-keys"
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3.5 rounded-full text-sm font-medium transition-all duration-200 group",
                                "hover:bg-white/10 hover:translate-x-1",
                                pathname.includes("/api-keys") ? "bg-white/20 text-white shadow-sm" : "text-white/80"
                            )}
                        >
                            <div className={cn("p-1.5 rounded-lg transition-colors", pathname.includes("/api-keys") ? "text-white" : "text-white/80 group-hover:text-white")}>
                                <Key size={18} />
                            </div>
                            API Keys
                        </Link>
                    </div>
                </nav>

                <div className="p-6 text-center">
                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">v1.0.0</span>
                </div>
            </div>
        </>
    );
}

// Mobile menu button component for use in DashboardShell
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded-xl shadow-md border border-gray-100 hover:bg-gray-50 transition-colors"
            aria-label="Open menu"
        >
            <Menu size={24} className="text-gray-600" />
        </button>
    );
}
