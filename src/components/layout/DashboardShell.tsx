"use client";

import { useState, Suspense } from "react";
import { Sidebar, MobileMenuButton } from "./Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div style={{ minHeight: "100vh", background: "var(--canvas)", color: "var(--ink-primary)", display: "flex", fontFamily: "inherit" }}>
            <Suspense fallback={<div style={{ width: 240, background: "var(--neutral-950)", minHeight: "100vh", display: "none" }} className="md:block" />}>
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            </Suspense>

            {/* Main content area */}
            <div className="flex-1 md:ml-[240px] flex flex-col min-h-screen">
                <MobileMenuButton onClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
                    {children}
                </main>

                <footer style={{ padding: "16px 32px", textAlign: "center", fontSize: 11, color: "var(--ink-muted)", borderTop: "1px solid var(--border)" }}>
                    &copy; 2026 LeadScout — All rights reserved.
                </footer>
            </div>
        </div>
    );
}
