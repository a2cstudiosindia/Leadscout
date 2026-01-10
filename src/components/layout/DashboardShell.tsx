"use client";

import { useState } from "react";
import { Sidebar, MobileMenuButton } from "./Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content area - responsive margin */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Mobile menu button */}
                <MobileMenuButton onClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
                    {children}
                </main>

                <footer className="p-4 md:p-8 text-center text-xs text-gray-400">
                    &copy; 2026 LeadScout. Inspired by Purity UI.
                </footer>
            </div>
        </div>
    );
}
