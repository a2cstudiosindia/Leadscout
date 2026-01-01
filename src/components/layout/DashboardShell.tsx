import { Sidebar } from "./Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* We removed the top header placeholder to let the page be full control, but we need the margin */}

                <main className="flex-1 p-8">
                    {children}
                </main>

                <footer className="p-8 text-center text-xs text-gray-400">
                    &copy; 2024 LeadScout. Inspired by Purity UI.
                </footer>
            </div>
        </div>
    );
}
