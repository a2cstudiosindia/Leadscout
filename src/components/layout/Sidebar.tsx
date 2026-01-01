"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
// Note: Link import conflict with next/link, so we use full import for icon or rename.
// Actually, Sidebar uses lucide-react efficiently. Let's just add CreditCard to the list.
import { LayoutDashboard, Search, List, Settings, LogOut, Zap, CreditCard } from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/dashboard?tab=find", icon: LayoutDashboard }, // Default to Find
    { name: "Find Leads", href: "/dashboard?tab=find", icon: Search },
    { name: "My Leads", href: "/dashboard?tab=leads", icon: List },
    { name: "Direct Scan", href: "/dashboard?tab=scan", icon: Zap }, // Added Direct Scan explicitly to sidebar
    { name: "Plans & Pricing", href: "/pricing", icon: CreditCard },
];

export function Sidebar() {
    const pathname = usePathname();
    // Simple logic to detect active tab from URL query would be better in a real layout context, 
    // but for now we'll stick to basic highlight or let the page handle it.
    // Actually, since we are moving to a real layout, let's keep it simple.

    return (
        <div className="w-64 bg-white min-h-screen border-r flex flex-col fixed left-0 top-0 z-50">
            <div className="p-8 pb-4 flex items-center gap-2">
                <div className="p-2 bg-teal-400 rounded-lg text-white">
                    <Zap size={20} fill="currentColor" />
                </div>
                <span className="font-bold text-lg text-gray-800 tracking-tight">LeadScout</span>
            </div>

            <div className="h-px bg-gray-100 mx-6 mb-6" />

            <nav className="flex-1 px-4 space-y-2">
                {navigation.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                            "hover:shadow-md hover:translate-x-1",
                            // This active state logic is tricky with query params, so we'll just style loosely for now
                            // In a real app we'd parse searchParams or use specific routes for these.
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
                </div>
            </nav>

            <div className="p-4 border-t">
                {/* Logout could go here */}
            </div>

            {/* Decorative background element mimicking Purity UI curve if valuable, 
                but for now let's keep cleaner. */}
        </div>
    );
}
