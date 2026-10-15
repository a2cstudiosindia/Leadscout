"use client";

import { useState, Suspense } from "react";
import { Sidebar, MobileMenuButton } from "./Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f5f5f7] text-zinc-900 font-sans flex">
            <Suspense fallback={<div className="w-72 bg-[#0c0c0e] border-r border-zinc-800/80 min-h-screen hidden md:block" />}>
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            </Suspense>

            {/* Main content area - responsive margin */}
            <div className="flex-1 md:ml-72 flex flex-col min-h-screen bg-[#f5f5f7]">
                {/* Mobile menu button */}
                <MobileMenuButton onClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
                    {children}
                </main>

                <footer className="p-4 md:p-8 text-center text-xs text-zinc-500 border-t border-zinc-200">
                    &copy; 2026 LeadScout. Intelligent Lead Discovery & Audit Engine.
                </footer>
            </div>
        </div>
    );
}
