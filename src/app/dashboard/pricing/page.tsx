"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { PricingContent } from "@/components/pricing/PricingContent";

export default function DashboardPricingPage() {
  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto pb-12">
        <PricingContent inDashboard={true} />
      </div>
    </DashboardShell>
  );
}
