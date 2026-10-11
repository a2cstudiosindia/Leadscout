"use client";

import { useState, Suspense } from "react";
import { Sidebar, MobileMenuButton } from "./Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex">
            <Suspense fallback={<div className="w-64 bg-gradient-to-b from-[#39C0B3] to-[#4E81EC] min-h-screen hidden md:block" />}>
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            </Suspense>

            {/* Main content area - responsive margin */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Mobile menu button */}
                <MobileMenuButton onClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
                    {children}
                </main>

                <footer className="p-4 md:p-8 text-center text-xs text-gray-400">
                    &copy; 2026 LeadScout. SaaS product powered by A2C.Studios.India Company.
                </footer>
            </div>
        </div>
    );
}
