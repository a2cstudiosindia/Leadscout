import { Suspense } from "react";
import DashboardContent from "./DashboardContent";

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-teal-500 font-bold">Loading dashboard...</div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
