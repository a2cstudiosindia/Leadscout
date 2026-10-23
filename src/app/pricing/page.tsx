"use client";

import { SiteNav } from "@/components/layout/SiteNav";
import { PricingContent } from "@/components/pricing/PricingContent";
import { CreditCard } from "lucide-react";

export default function PublicPricingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#1d1d1f]">
      <SiteNav />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-5 pt-16 pb-24 md:px-8">
        <PricingContent inDashboard={false} />
      </main>

      {/* Public Footer */}
      <footer className="border-t border-zinc-200 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-sm text-zinc-500 md:flex-row md:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-black text-white">
              <CreditCard size={14} />
            </span>
            <span className="font-bold text-zinc-900">LeadScout Pricing</span>
          </div>
          <p>&copy; {new Date().getFullYear()} LeadScout Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
