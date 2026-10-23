"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Sparkles, CreditCard, ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getSubscriptionInfo } from "@/lib/subscription";
import { useCached } from "@/lib/use-cached";
import { checkout, customerPortal, useSession } from "@/lib/auth-client";
import { CREDIT_PACKS } from "@/lib/plans";
import toast, { Toaster } from "react-hot-toast";

const tiers = [
  {
    id: "free", name: "Starter", price: [0, 0], blurb: "For freelancers testing the workflow.",
    features: ["10 saved leads / month", "5 audits / month", "20 discovery searches", "Standard CRM pipeline"],
  },
  {
    id: "pro", name: "Professional", price: [29, 24], blurb: "For agencies running weekly outreach.", featured: true,
    features: ["500 saved leads / month", "50 audits / month", "500 discovery searches", "CSV export", "API access", "AI outreach emails"],
  },
  {
    id: "enterprise", name: "Enterprise", price: [79, 65], blurb: "Unlimited volume and white-labeling.",
    features: ["Unlimited leads and audits", "Unlimited discovery", "White-label PDF reports", "Excel export with audit data", "Priority API limits", "Favorites and bulk actions"],
  },
] as const;

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [yearly, setYearly] = useState(false);

  const { data: session } = useSession();
  const { data: info } = useCached("sub", () => getSubscriptionInfo());

  // Determine if user is signed in
  const isAuthenticated = Boolean(session?.user || info?.plan);

  useEffect(() => { 
    if (info?.plan) {
      setCurrentPlan(info.plan); 
    }
  }, [info]);

  async function handleCheckout(plan: "pro" | "enterprise") {
    if (currentPlan === plan) { 
      await handlePortal();
      return; 
    }
    setLoading(plan);
    try {
      const res = await checkout(plan);
      if (res && "error" in res && res.error) {
        if (res.error.status === 401 || res.error.message?.toLowerCase().includes("logged in")) {
          toast.error("Please sign in to choose a plan");
          window.location.href = "/login?redirect=/pricing";
          return;
        }
        toast.error(res.error.message || "Checkout failed");
      } else if (res && "data" in res && res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      const result = await customerPortal();
      if (result.data?.url) {
        window.location.href = result.data.url;
      } else {
        window.location.href = "/portal";
      }
    } catch {
      window.location.href = "/portal";
    } finally {
      setLoading(null);
    }
  }

  // --- Content Components ---

  const PricingCards = ({ inDashboard }: { inDashboard: boolean }) => (
    <div className="grid gap-6 md:grid-cols-3">
      {tiers.map((t) => {
        const featured = "featured" in t && t.featured;
        const price = t.price[yearly ? 1 : 0];
        const isCurrent = currentPlan === t.id;

        return (
          <div 
            key={t.id} 
            className={`card-lift relative flex flex-col rounded-3xl p-8 transition-all ${
              featured 
                ? "bg-black text-white shadow-2xl md:-translate-y-2 ring-1 ring-black" 
                : "border border-zinc-200/90 bg-white text-zinc-900 shadow-xs"
            }`}
          >
            {featured && (
              <span className="absolute right-6 top-6 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-black shadow-xs flex items-center gap-1">
                <Sparkles size={12} className="fill-black" /> Recommended
              </span>
            )}
            
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight">{t.name}</h2>
              {isCurrent && (
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  featured ? "bg-zinc-800 text-zinc-300 border border-zinc-700" : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                }`}>
                  Active
                </span>
              )}
            </div>

            <p className={`mt-2 text-sm leading-relaxed ${featured ? "text-zinc-300" : "text-zinc-600"}`}>
              {t.blurb}
            </p>

            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="text-5xl font-extrabold tracking-tight">${price}</span>
              <span className={`text-sm font-medium ${featured ? "text-zinc-400" : "text-zinc-500"}`}>
                / month
              </span>
            </div>

            <ul className="mt-8 flex-1 space-y-3.5">
              {t.features.map((f) => (
                <li key={f} className={`flex items-start gap-3 text-sm font-medium leading-relaxed ${featured ? "text-zinc-100" : "text-zinc-700"}`}>
                  <Check size={17} strokeWidth={3} className={`mt-0.5 shrink-0 ${featured ? "text-white" : "text-black"}`} />
                  {f}
                </li>
              ))}
            </ul>

            {/* Action Buttons */}
            {inDashboard ? (
              // Authenticated Dashboard Button
              t.id === "free" ? (
                isCurrent ? (
                  <button 
                    disabled 
                    className="mt-8 w-full rounded-xl border border-zinc-200 bg-zinc-100 py-3 text-center text-sm font-semibold text-zinc-400 cursor-default"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button 
                    onClick={handlePortal} 
                    disabled={loading === "portal"}
                    className="mt-8 w-full rounded-xl border border-zinc-300 bg-white py-3 text-center text-sm font-semibold text-zinc-900 transition-colors hover:border-black hover:bg-zinc-50"
                  >
                    Downgrade in Portal
                  </button>
                )
              ) : isCurrent ? (
                <button 
                  onClick={handlePortal} 
                  disabled={loading === "portal"}
                  className={`mt-8 w-full rounded-xl py-3 text-sm font-semibold transition-transform hover:scale-[1.01] ${
                    featured ? "bg-white text-black hover:bg-zinc-100" : "bg-black text-white hover:bg-zinc-800"
                  }`}
                >
                  {loading === "portal" ? "Redirecting..." : "Manage Subscription"}
                </button>
              ) : (
                <button 
                  onClick={() => handleCheckout(t.id as "pro" | "enterprise")} 
                  disabled={loading === t.id}
                  className={`mt-8 w-full rounded-xl py-3 text-sm font-semibold transition-transform hover:scale-[1.01] disabled:opacity-60 ${
                    featured ? "bg-white text-black hover:bg-zinc-100" : "bg-black text-white hover:bg-zinc-800"
                  }`}
                >
                  {loading === t.id ? "Redirecting..." : `Upgrade to ${t.name}`}
                </button>
              )
            ) : (
              // Public Landing Page Button
              t.id === "free" ? (
                <Link 
                  href="/login" 
                  className="mt-8 rounded-full border border-zinc-300 bg-white py-3.5 text-center text-sm font-semibold text-zinc-900 transition-colors hover:border-black"
                >
                  Get started free
                </Link>
              ) : (
                <button 
                  onClick={() => handleCheckout(t.id as "pro" | "enterprise")} 
                  disabled={loading === t.id}
                  className={`mt-8 rounded-full py-3.5 text-sm font-semibold transition-transform hover:scale-[1.02] disabled:opacity-60 ${
                    featured ? "bg-white text-black hover:bg-zinc-100" : "bg-black text-white hover:bg-zinc-800"
                  }`}
                >
                  {loading === t.id ? "Redirecting..." : `Choose ${t.name}`}
                </button>
              )
            )}
          </div>
        );
      })}
    </div>
  );

  const CreditPacksSection = () => (
    <div className="rounded-3xl border border-zinc-200/90 bg-white p-8 md:p-12 shadow-xs">
      <div className="text-center max-w-xl mx-auto">
        <h3 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Need Extra Power?</h3>
        <p className="mt-2 text-sm text-zinc-600">One-time credit packs for surges without changing your monthly subscription.</p>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {CREDIT_PACKS.map((p) => (
          <div key={p.id} className="rounded-2xl border border-zinc-200 bg-[#fafafa] p-6 text-center hover:border-zinc-400 transition-colors">
            <h4 className="text-base font-bold text-zinc-900">{p.label}</h4>
            <p className="mt-3 text-4xl font-extrabold tracking-tight text-zinc-900">${p.price}</p>
            <p className="mt-1 text-xs text-zinc-500">One-time payment</p>
            <button 
              onClick={() => toast("Credit packs checkout is opening soon")} 
              className="mt-6 w-full rounded-xl border border-zinc-300 bg-white py-2.5 text-xs font-semibold text-zinc-900 transition-all hover:bg-black hover:text-white hover:border-black shadow-xs"
            >
              Purchase Pack
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const ComparisonTable = () => (
    <div className="rounded-3xl border border-zinc-200/90 bg-white p-8 md:p-10 shadow-xs overflow-x-auto">
      <h3 className="mb-6 text-xl md:text-2xl font-extrabold text-zinc-900 tracking-tight">Detailed Feature Breakdown</h3>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-zinc-900 text-left text-xs font-bold uppercase tracking-wider text-zinc-900">
            <th className="py-3.5 pr-4">Feature</th>
            <th className="px-4 py-3.5 text-center">Starter</th>
            <th className="px-4 py-3.5 text-center">Pro</th>
            <th className="px-4 py-3.5 text-center">Enterprise</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 text-zinc-700">
          {[
            ["Lead scoring algorithm", "Yes", "Yes", "Yes"],
            ["Website technical audits", "5 / mo", "50 / mo", "Unlimited"],
            ["Google Places discovery", "10 / mo", "500 / mo", "Unlimited"],
            ["CSV Export capability", "—", "Yes", "Yes"],
            ["Excel with audit data", "—", "—", "Yes"],
            ["REST API Access", "—", "Yes", "Yes"],
            ["AI outreach emails", "—", "Yes", "Yes"],
            ["White-label PDF reports", "—", "Yes", "Yes"],
            ["Favorites & Bulk Actions", "—", "—", "Yes"],
          ].map(([f, a, b, c]) => (
            <tr key={f} className="transition-colors hover:bg-zinc-50">
              <td className="py-3.5 pr-4 font-semibold text-zinc-900">{f}</td>
              <td className="px-4 py-3.5 text-center text-zinc-600">{a}</td>
              <td className="px-4 py-3.5 text-center font-bold text-zinc-900">{b}</td>
              <td className="px-4 py-3.5 text-center font-bold text-zinc-900">{c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // --- Authenticated Dashboard View ---
  if (isAuthenticated) {
    return (
      <DashboardShell>
        <Toaster position="top-right" toastOptions={{ style: { background: "#18181b", color: "#fafafa", border: "1px solid #3f3f46" } }} />
        
        <div className="max-w-6xl mx-auto space-y-10 pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Plans &amp; Pricing</h1>
              <p className="text-sm text-zinc-500 mt-1">Manage your agency workspace subscription, quotas, or purchase extra credits</p>
            </div>

            {/* Toggle */}
            <div className="inline-flex rounded-full bg-white p-1 border border-zinc-200 shadow-xs self-start sm:self-auto">
              {[false, true].map((y) => (
                <button
                  key={String(y)}
                  onClick={() => setYearly(y)}
                  className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                    yearly === y ? "bg-black text-white shadow-xs" : "text-zinc-600 hover:text-black"
                  }`}
                >
                  {y ? "Yearly" : "Monthly"}
                  {y && <span className="ml-1.5 text-[10px] font-bold text-emerald-400 bg-zinc-900 px-1.5 py-0.5 rounded-full">Save 20%</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Cards */}
          <PricingCards inDashboard={true} />

          {/* Credit Packs */}
          <CreditPacksSection />

          {/* Comparison */}
          <ComparisonTable />
        </div>
      </DashboardShell>
    );
  }

  // --- Public Unauthenticated View ---
  return (
    <div className="min-h-screen bg-white font-sans text-[#1d1d1f]">
      <Toaster position="top-right" />
      <SiteNav />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-20 text-center md:px-8">
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.04] text-zinc-900 md:text-7xl tracking-tight">
          Simple pricing. Serious results.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-zinc-600 font-normal">
          Start free. Upgrade when your agency outreach pipeline needs more capacity.
        </p>
        
        <div className="mt-9 inline-flex rounded-full bg-[#f5f5f7] p-1.5 ring-1 ring-zinc-200">
          {[false, true].map((y) => (
            <button 
              key={String(y)} 
              onClick={() => setYearly(y)}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                yearly === y ? "bg-black text-white shadow-xs" : "text-zinc-600 hover:text-black"
              }`}
            >
              {y ? "Yearly" : "Monthly"}
              {y && <span className="ml-2 text-xs font-bold opacity-80">Save 20%</span>}
            </button>
          ))}
        </div>
      </section>

      {/* Cards */}
      <section className="mx-auto max-w-6xl px-5 pb-24 md:px-8">
        <PricingCards inDashboard={false} />
      </section>

      {/* Credit Packs */}
      <section className="bg-[#f5f5f7] py-20 px-5 md:px-8">
        <div className="mx-auto max-w-5xl">
          <CreditPacksSection />
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mx-auto max-w-5xl px-5 py-24 md:px-8">
        <ComparisonTable />
      </section>

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
