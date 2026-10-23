"use client";

import { useCached } from "@/lib/use-cached";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
    Search, 
    Settings, 
    Zap, 
    CreditCard, 
    BarChart3, 
    Key, 
    Menu, 
    X, 
    Crown, 
    Sparkles, 
    Briefcase, 
    Globe2, 
    Layers,
    FileText
} from "lucide-react";
import { getSubscriptionInfo } from "@/lib/subscription";
import { cn } from "@/lib/utils";

const workspaceNav = [
    { name: "Find Leads", href: "/dashboard?tab=find", tab: "find", icon: Search },
    { name: "Pipeline & Deals", href: "/dashboard?tab=leads", tab: "leads", icon: Layers },
    { name: "Clients Hub", href: "/dashboard?tab=clients", tab: "clients", icon: Briefcase },
    { name: "B2B Exchange", href: "/dashboard?tab=exchange", tab: "exchange", icon: Globe2 },
    { name: "Direct Scan", href: "/dashboard?tab=scan", tab: "scan", icon: Zap },
    { name: "Analytics", href: "/analytics", tab: null, icon: BarChart3 },
    { name: "Plans & Pricing", href: "/dashboard/pricing", tab: null, icon: CreditCard },
];

const configNav = [
    { name: "Agency Settings", href: "/settings", icon: Settings },
    { name: "API Keys", href: "/settings/api-keys", icon: Key },
    { name: "API Docs", href: "/api/docs", icon: FileText },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab');
    const { data: info } = useCached("sub", () => getSubscriptionInfo());
    const plan = info && info.plan !== 'free' ? info.plan : null;

    function isNavActive(item: typeof workspaceNav[0]) {
        if (item.tab) {
            return pathname === "/dashboard" && (tab === item.tab || (!tab && item.tab === "find"));
        }
        if (item.href === "/dashboard/pricing") {
            return pathname === "/dashboard/pricing";
        }
        return pathname === item.href;
    }

    function isConfigActive(item: typeof configNav[0]) {
        if (item.href === "/settings/api-keys") return pathname.includes("/api-keys");
        if (item.href === "/settings") return pathname === "/settings";
        if (item.href === "/api/docs") return pathname.startsWith("/api/docs") || pathname.startsWith("/docs");
        return pathname === item.href;
    }

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar container */}
            <div className={cn(
                "w-72 bg-[#0c0c0e] border-r border-zinc-800/80 min-h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300",
                // Mobile: slide in/out
                isOpen ? "translate-x-0" : "-translate-x-full",
                // Desktop: always visible
                "md:translate-x-0"
            )}>
                {/* Header / Logo */}
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

                <div className="h-px bg-zinc-800/80 mx-5 mb-4" />

                {/* Navigation items */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                    <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500 mb-2 px-3 pt-1">
                        Workspace
                    </div>

                    {workspaceNav.map((item) => {
                        const active = isNavActive(item);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group",
                                    active 
                                        ? "bg-zinc-800 text-white border border-zinc-700/60 shadow-xs" 
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                                )}
                            >
                                <div className={cn(
                                    "p-1 rounded-lg transition-colors",
                                    active ? "text-white" : "text-zinc-400 group-hover:text-white"
                                )}>
                                    <item.icon size={18} />
                                </div>
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-6 px-1">
                        <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500 mb-2 px-2">
                            Configuration
                        </div>
                        {configNav.map((item) => {
                            const active = isConfigActive(item);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 group",
                                        active 
                                            ? "bg-zinc-800 text-white border border-zinc-700/60 shadow-xs" 
                                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                                    )}
                                >
                                    <div className={cn(
                                        "p-1 rounded-lg transition-colors",
                                        active ? "text-white" : "text-zinc-400 group-hover:text-white"
                                    )}>
                                        <item.icon size={18} />
                                    </div>
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="p-4 border-t border-zinc-800/80 text-center">
                    <span className="text-[11px] text-zinc-500 font-mono tracking-widest uppercase">v2.0 • PRODUCTION</span>
                </div>
            </div>
        </>
    );
}

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
