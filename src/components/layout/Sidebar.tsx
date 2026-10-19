"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, Settings, Zap, CreditCard, BarChart3, Key, Menu, X, Crown, Sparkles, Briefcase, Globe2, Layers } from "lucide-react";
import { getSubscriptionInfo } from "@/lib/subscription";

const navigation = [
    { name: "Find Leads",       href: "/dashboard?tab=find",     icon: Search,   tab: "find"     },
    { name: "Pipeline & Deals", href: "/dashboard?tab=leads",    icon: Layers,   tab: "leads"    },
    { name: "Clients Hub",      href: "/dashboard?tab=clients",  icon: Briefcase, tab: "clients" },
    { name: "B2B Exchange",     href: "/dashboard?tab=exchange", icon: Globe2,   tab: "exchange" },
    { name: "Direct Scan",      href: "/dashboard?tab=scan",     icon: Zap,      tab: "scan"     },
];

const account = [
    { name: "Analytics",       href: "/analytics",        icon: BarChart3 },
    { name: "Plans & Pricing", href: "/pricing",          icon: CreditCard },
    { name: "Settings",        href: "/settings",         icon: Settings   },
    { name: "API Keys",        href: "/settings/api-keys", icon: Key       },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab");
    const [plan, setPlan] = useState<string | null>(null);

    useEffect(() => {
        getSubscriptionInfo().then((info) => {
            if (info && info.plan !== "free") setPlan(info.plan);
        });
    }, []);

    function isNavActive(item: typeof navigation[0]) {
        return pathname === "/dashboard" && tab === item.tab;
    }

    function isAccountActive(item: typeof account[0]) {
        if (item.href === "/settings/api-keys") return pathname.includes("/api-keys");
        if (item.href === "/settings") return pathname.startsWith("/settings") && !pathname.includes("/api-keys");
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

            {/* Sidebar */}
            <div
                className={`sidebar${isOpen ? "" : " -translate-x-full"} md:translate-x-0`}
                style={{ transform: isOpen ? "translateX(0)" : undefined }}
            >
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <Zap size={16} fill="currentColor" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div className="sidebar-logo-name">LeadScout</div>
                        {plan && (
                            <span className={`plan-badge ${plan === "enterprise" ? "plan-badge-enterprise" : "plan-badge-pro"}`} style={{ marginTop: 2, display: "inline-flex" }}>
                                {plan === "enterprise" ? <Crown size={9} /> : <Sparkles size={9} />}
                                {plan}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="md:hidden"
                        style={{ padding: 6, borderRadius: 6, background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                        aria-label="Close menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Main nav */}
                <nav className="sidebar-nav" style={{ paddingTop: 12 }}>
                    <div className="sidebar-section-label">Workspace</div>
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={`sidebar-item${isNavActive(item) ? " active" : ""}`}
                        >
                            <item.icon size={16} style={{ flexShrink: 0, opacity: isNavActive(item) ? 1 : 0.65 }} />
                            {item.name}
                        </Link>
                    ))}

                    <div className="sidebar-section-label" style={{ marginTop: 8 }}>Account</div>
                    {account.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={`sidebar-item${isAccountActive(item) ? " active" : ""}`}
                        >
                            <item.icon size={16} style={{ flexShrink: 0, opacity: isAccountActive(item) ? 1 : 0.65 }} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        v1.0.0
                    </span>
                </div>
            </div>
        </>
    );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="md:hidden fixed top-4 left-4 z-30"
            style={{ padding: "8px", background: "white", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", cursor: "pointer" }}
            aria-label="Open menu"
        >
            <Menu size={20} style={{ color: "#3b3b52" }} />
        </button>
    );
}
