"use client";

import { useCached } from "@/lib/use-cached";
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
    const { data: info } = useCached("sub", () => getSubscriptionInfo());
    const plan = info && info.plan !== 'free' ? info.plan : null;

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
                "w-72 bg-[#0c0c0e] border-r border-zinc-800/80 min-h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300",
                // Mobile: slide in/out
                isOpen ? "translate-x-0" : "-translate-x-full",
                // Desktop: always visible
                "md:translate-x-0"
            )}>
                <div className="p-6 pb-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/70 text-white flex items-center justify-center group-hover:border-zinc-500 transition-colors shadow-sm">
                            <Zap size={20} className="fill-white text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-lg text-white tracking-tight">LeadScout</span>
                            {plan && (
                                <span className={cn(
                                    "text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 w-fit mt-0.5",
                                    plan === 'enterprise'
                                        ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                                        : "border-zinc-700 bg-zinc-800/70 text-zinc-300"
                                    )}>
                                    {plan === 'enterprise' ? <Crown size={10} /> : <Sparkles size={10} />}
                                    {plan}
                                </span>
                            )}
                        </div>
                    </Link>
                    {/* Mobile close button */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="h-px bg-zinc-800/80 mx-5 mb-5" />

                <nav className="flex-1 px-3 space-y-1.5">
                    {navigation.map((item) => {
                        const currentTab = tab || 'find';
                        const isMatch = (item.href.includes(`tab=${currentTab}`) && pathname === '/dashboard') || 
                                        (pathname === '/analytics' && item.href === '/analytics') || 
                                        (pathname === '/pricing' && item.href === '/pricing');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group",
                                    isMatch 
                                        ? "bg-zinc-800 text-white border border-zinc-700/60 shadow-xs" 
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                                )}
                            >
                                <div className={cn(
                                    "p-1 rounded-lg transition-colors",
                                    isMatch ? "text-white" : "text-zinc-400 group-hover:text-white"
                                )}>
                                    <item.icon size={19} />
                                </div>
                                {item.name}
                            </Link>
                        );
                    })}

                    <div className="pt-6 px-1">
                        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 mb-2 pl-3">Configuration</h3>
                        <Link
                            href="/settings"
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group",
                                pathname === "/settings" 
                                    ? "bg-zinc-800 text-white border border-zinc-700/60 shadow-xs" 
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                            )}
                        >
                            <div className="p-1 rounded-lg text-zinc-400 group-hover:text-white">
                                <Settings size={19} />
                            </div>
                            Agency Settings
                        </Link>
                        <Link
                            href="/settings/api-keys"
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group",
                                pathname.includes("/api-keys") 
                                    ? "bg-zinc-800 text-white border border-zinc-700/60 shadow-xs" 
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                            )}
                        >
                            <div className="p-1 rounded-lg text-zinc-400 group-hover:text-white">
                                <Key size={19} />
                            </div>
                            API Keys
                        </Link>
                        <Link
                            href="/api/docs"
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group",
                                pathname.startsWith("/api/docs") || pathname.startsWith("/docs/api")
                                    ? "bg-zinc-800 text-white border border-zinc-700/60 shadow-xs" 
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                            )}
                        >
                            <div className="p-1 rounded-lg text-zinc-400 group-hover:text-white">
                                <Zap size={19} />
                            </div>
                            API Docs
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-zinc-800/80 text-center">
                    <span className="text-xs text-zinc-500 font-mono tracking-widest">v1.2.0 • PRODUCTION</span>
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
            className="md:hidden fixed top-4 left-4 z-30 p-2 bg-zinc-900 rounded-xl shadow-md border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            aria-label="Open menu"
        >
            <Menu size={20} />
        </button>
    );
}
