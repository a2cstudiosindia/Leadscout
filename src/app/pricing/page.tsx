"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { getSubscriptionInfo } from "@/lib/subscription";
import { useCached } from "@/lib/use-cached";
import { checkout } from "@/lib/auth-client";
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

  const { data: info } = useCached("sub", () => getSubscriptionInfo());
  useEffect(() => { if (info) setCurrentPlan(info.plan); }, [info]);

  async function handleCheckout(plan: "pro" | "enterprise") {
    if (currentPlan === plan) { window.location.href = "/portal"; return; }
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

  return (
    <div className="min-h-screen bg-white font-sans text-[#1d1d1f]">
      <Toaster position="top-right" />
      <SiteNav />

      <section className="mx-auto max-w-7xl px-5 pb-10 pt-20 text-center md:px-8">
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.04] text-zinc-900 md:text-7xl">Simple pricing. Serious results.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-zinc-600">Start free. Upgrade when your pipeline needs more room.</p>
        <div className="mt-9 inline-flex rounded-full bg-[#f5f5f7] p-1.5 ring-1 ring-zinc-200">
          {[false, true].map((y) => (
            <button key={String(y)} onClick={() => setYearly(y)}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${yearly === y ? "bg-black text-white shadow" : "text-zinc-600 hover:text-black"}`}>
              {y ? "Yearly" : "Monthly"}{y && <span className="ml-2 text-xs font-bold opacity-80">Save 20%</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-24 md:grid-cols-3 md:px-8">
        {tiers.map((t) => {
          const featured = "featured" in t && t.featured;
          const price = t.price[yearly ? 1 : 0];
          const isCurrent = currentPlan === t.id;
          return (
            <div key={t.id} className={`card-lift relative flex flex-col rounded-[2rem] p-9 ${featured ? "bg-black text-white shadow-2xl md:-translate-y-3" : "border border-zinc-200 bg-[#fafafa] text-zinc-900"}`}>
              {featured && <span className="absolute right-7 top-7 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-black">Recommended</span>}
              <h2 className="text-xl font-bold">{t.name}</h2>
              <p className={`mt-2 text-base ${featured ? "text-zinc-300" : "text-zinc-600"}`}>{t.blurb}</p>
              <div className="mt-8 flex items-baseline gap-1.5">
                <span className="text-6xl font-extrabold tracking-tight">${price}</span>
                <span className={`text-base font-medium ${featured ? "text-zinc-400" : "text-zinc-500"}`}>/ month</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3.5">
                {t.features.map((f) => (
                  <li key={f} className={`flex items-start gap-3 text-base font-medium ${featured ? "text-zinc-100" : "text-zinc-700"}`}>
                    <Check size={18} strokeWidth={3} className={`mt-0.5 shrink-0 ${featured ? "text-white" : "text-black"}`} />{f}
                  </li>
                ))}
              </ul>
              {t.id === "free" ? (
                <Link href="/login" className="mt-10 rounded-full border border-zinc-300 bg-white py-3.5 text-center text-base font-semibold text-zinc-900 transition-colors hover:border-black">
                  {isCurrent ? "Current plan" : "Get started"}
                </Link>
              ) : (
                <button onClick={() => handleCheckout(t.id as "pro" | "enterprise")} disabled={loading === t.id}
                  className={`mt-10 rounded-full py-3.5 text-base font-semibold transition-transform hover:scale-[1.02] disabled:opacity-60 ${featured ? "bg-white text-black" : "bg-black text-white hover:bg-zinc-800"}`}>
                  {loading === t.id ? "Redirecting..." : isCurrent ? "Manage subscription" : `Choose ${t.name}`}
                </button>
              )}
            </div>
          );
        })}
      </section>

      <section className="bg-[#f5f5f7] py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <h2 className="text-center text-4xl font-extrabold text-zinc-900 md:text-5xl">Need a little extra?</h2>
          <p className="mt-3 text-center text-lg text-zinc-600">One-time credit packs, no plan change required.</p>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {CREDIT_PACKS.map((p) => (
              <div key={p.id} className="card-lift rounded-3xl border border-zinc-200 bg-white p-8 text-center">
                <h3 className="text-lg font-bold text-zinc-900">{p.label}</h3>
                <p className="mt-3 text-5xl font-extrabold tracking-tight text-zinc-900">${p.price}</p>
                <p className="mt-1 text-sm text-zinc-500">One-time purchase</p>
                <button onClick={() => toast("Credit packs are coming soon")} className="mt-6 w-full rounded-full border border-zinc-300 py-3 text-base font-semibold text-zinc-900 transition-colors hover:border-black hover:bg-black hover:text-white">Buy credits</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl overflow-x-auto px-5 py-24 md:px-8">
        <h2 className="mb-10 text-center text-4xl font-extrabold text-zinc-900 md:text-5xl">Compare plans</h2>
        <table className="w-full border-collapse text-base">
          <thead>
            <tr className="border-b-2 border-zinc-900 text-left text-sm font-bold uppercase tracking-wider text-zinc-900">
              <th className="py-4 pr-4">Feature</th><th className="px-4 py-4 text-center">Starter</th><th className="px-4 py-4 text-center">Pro</th><th className="px-4 py-4 text-center">Enterprise</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-zinc-700">
            {[
              ["Lead scoring", "Yes", "Yes", "Yes"],
              ["Website audits", "5 / mo", "50 / mo", "Unlimited"],
              ["Lead discovery", "10 / mo", "500 / mo", "Unlimited"],
              ["CSV export", "-", "Yes", "Yes"],
              ["Excel with audit data", "-", "-", "Yes"],
              ["API access", "-", "Yes", "Yes"],
              ["AI outreach emails", "-", "Yes", "Yes"],
              ["White-label PDF", "-", "Yes", "Yes"],
              ["Favorites and bulk actions", "-", "-", "Yes"],
            ].map(([f, a, b, c]) => (
              <tr key={f} className="transition-colors hover:bg-zinc-50">
                <td className="py-4 pr-4 font-semibold text-zinc-900">{f}</td>
                <td className="px-4 py-4 text-center">{a}</td><td className="px-4 py-4 text-center font-semibold text-zinc-900">{b}</td><td className="px-4 py-4 text-center">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
