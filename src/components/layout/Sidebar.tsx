"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Search, List, Settings, Zap, CreditCard, BarChart3, Key, Menu, X } from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/dashboard?tab=find", icon: LayoutDashboard },
    { name: "Find Leads", href: "/dashboard?tab=find", icon: Search },
    { name: "My Leads", href: "/dashboard?tab=leads", icon: List },
    { name: "Direct Scan", href: "/dashboard?tab=scan", icon: Zap },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Plans & Pricing", href: "/pricing", icon: CreditCard },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname();

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
                "w-64 bg-white min-h-screen border-r flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300",
                // Mobile: slide in/out
                isOpen ? "translate-x-0" : "-translate-x-full",
                // Desktop: always visible
                "md:translate-x-0"
            )}>
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-teal-400 rounded-lg text-white">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <span className="font-bold text-lg text-gray-800 tracking-tight">LeadScout</span>
                    </div>
                    {/* Mobile close button */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="h-px bg-gray-100 mx-6 mb-6" />

                <nav className="flex-1 px-4 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                "hover:shadow-md hover:translate-x-1",
                                "text-gray-500 hover:bg-white hover:text-gray-900"
                            )}
                        >
                            <div className="p-2 bg-teal-50 text-teal-500 rounded-lg group-hover:bg-teal-400 group-hover:text-white transition-colors shadow-sm">
                                <item.icon size={16} />
                            </div>
                            {item.name}
                        </Link>
                    ))}

                    <div className="mt-8 px-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Account</h3>
                        <Link
                            href="/settings"
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                "text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-md"
                            )}
                        >
                            <div className="p-2 bg-gray-50 text-gray-500 rounded-lg group-hover:bg-gray-800 group-hover:text-white transition-colors shadow-sm">
                                <Settings size={16} />
                            </div>
                            Settings
                        </Link>
                        <Link
                            href="/settings/api-keys"
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                "text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-md"
                            )}
                        >
                            <div className="p-2 bg-gray-50 text-gray-500 rounded-lg group-hover:bg-gray-800 group-hover:text-white transition-colors shadow-sm">
                                <Key size={16} />
                            </div>
                            API Keys
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t">
                    {/* Logout could go here */}
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
