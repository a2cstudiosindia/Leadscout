"use client";

import { useEffect, useState } from "react";
import { customerPortal } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function PortalPage() {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        customerPortal()
            .then((result) => {
                // The result is wrapped in a data object
                if (result && 'data' in result && result.data?.url) {
                    window.location.href = result.data.url;
                } else if (result && 'url' in result) {
                    // Fallback if direct url property exists
                    window.location.href = (result as { url: string }).url;
                } else {
                    setError("Unable to open billing portal");
                    setTimeout(() => {
                        window.location.href = "/dashboard";
                    }, 2000);
                }
            })
            .catch(() => {
                setError("Unable to open billing portal");
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 2000);
            });
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                {error ? (
                    <div className="text-red-500">
                        <p className="text-lg font-medium">{error}</p>
                        <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                        <p className="text-gray-600">Redirecting to billing portal...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

