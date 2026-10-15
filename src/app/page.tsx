import Link from "next/link";
import {
  Search, Gauge, FileText, Layers, Mail, Cpu, ArrowRight, Zap,
} from "lucide-react";
import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";
import { CircuitHero } from "@/components/ui/circuit-hero";
import { SiteNav } from "@/components/layout/SiteNav";

const SHOWCASE_IMAGES = [
  "photo-1551288049-bebda4e38f71", "photo-1460925895917-afdab827c52f",
  "photo-1507238691740-187a5b1d37b8", "photo-1558494949-ef010cbdcc31",
  "photo-1531403009284-440f080d1e12", "photo-1526374965328-7f61d4dc18c5",
  "photo-1551836022-d5d88e9218df", "photo-1486406146926-c627a92ad1ab",
].map((id) => ({ src: `https://images.unsplash.com/${id}?q=80&w=1200&auto=format&fit=crop`, alt: "Website audit preview" }));

const features = [
  { icon: Search, title: "Discover", text: "Search any niche in any city through Google Places and surface businesses with weak websites." },
  { icon: Gauge, title: "Audit", text: "Headless browser scans for SSL, speed, mobile viewport, analytics and content freshness." },
  { icon: FileText, title: "Report", text: "White-label PDF reports carrying your agency name and logo, ready for the first call." },
  { icon: Layers, title: "Pipeline", text: "A built-in CRM with list and kanban views, notes, and deal values on every lead." },
  { icon: Mail, title: "Outreach", text: "Cold emails written from real audit findings, so every message is specific." },
  { icon: Cpu, title: "API", text: "Trigger scans and sync leads into your own tools with a clean REST API." },
];

const steps = [
  ["01", "Find the prospects", "Pick a niche and a city. Get names, phones and URLs in seconds."],
  ["02", "Run the audit", "One click scans the site and scores it against seven benchmarks."],
  ["03", "Close the deal", "Send a branded report and a tailored email that proves the problem."],
];

const reviews = [
  ["We stopped sending generic pitches. An audit PDF took our reply rate from 4% to 22%.", "James Davis", "CEO, GrowthScale"],
  ["Clients see their own broken mobile tags before we even book a call. Closing feels natural.", "Sarah Mitchell", "Founder, WebPro"],
  ["The API put leads straight into our dashboards and saved reps fifteen hours a week.", "Raj Kumar", "Director, TechScale"],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#1d1d1f]">
      <SiteNav />

      {/* Hero: copy left, original circuit animation right */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 md:px-8 md:pt-24 lg:grid-cols-2">
        <div>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Lead intelligence for agencies</p>
          <h1 className="text-5xl font-extrabold leading-[1.02] text-zinc-900 sm:text-6xl lg:text-7xl">
            Find clients who need you.
            <span className="mt-2 block bg-gradient-to-b from-zinc-700 to-zinc-400 bg-clip-text text-transparent">Close faster.</span>
          </h1>
          <p className="mt-7 max-w-xl text-xl leading-relaxed text-zinc-600">
            LeadScout finds local businesses with underperforming websites, audits them in seconds, and hands you a report that wins the meeting.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-8 py-4 text-base font-semibold text-white transition-transform hover:scale-[1.03] hover:bg-zinc-800">
              Start free trial <ArrowRight size={18} />
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-8 py-4 text-base font-semibold text-zinc-900 transition-colors hover:border-black">
              View pricing
            </Link>
          </div>
          <p className="mt-5 text-sm text-zinc-500">No credit card required. 14-day full access.</p>
        </div>
        <div className="mx-auto w-full max-w-lg">
          <CircuitHero />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#f5f5f7] py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-5 text-center md:grid-cols-4 md:px-8">
          {[["10K+", "Leads discovered"], ["500+", "Agencies onboarded"], ["<3.5s", "Average audit time"], ["99.8%", "API uptime"]].map(([n, l]) => (
            <div key={l}>
              <div className="text-5xl font-extrabold tracking-tight text-zinc-900 md:text-6xl">{n}</div>
              <div className="mt-2 text-base font-medium text-zinc-600">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tilted grid showcase on black */}
      <section className="bg-black px-5 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mx-auto max-w-3xl text-center text-4xl font-extrabold leading-tight text-white md:text-6xl">Every site, scored at a glance.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-zinc-400">A live feed of audits flowing through your pipeline, from first scan to finished report.</p>
          <TiltedGridHero images={SHOWCASE_IMAGES} speed={4.5} curve={75} tileHeight={30} className="mx-auto mt-12 h-[420px] w-full max-w-6xl md:h-[520px]" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-28 md:px-8">
        <h2 className="max-w-3xl text-4xl font-extrabold leading-tight text-zinc-900 md:text-6xl">One platform from first search to signed retainer.</h2>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="group card-lift rounded-3xl border border-zinc-200 bg-[#fafafa] p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white"><Icon size={22} /></span>
              <h3 className="hover-title mt-6 text-2xl font-bold text-zinc-800">{title}</h3>
              <p className="mt-3 text-base leading-relaxed text-zinc-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="bg-[#f5f5f7] py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="max-w-3xl text-4xl font-extrabold leading-tight text-zinc-900 md:text-6xl">Three steps. No busywork.</h2>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {steps.map(([n, t, d]) => (
              <div key={n} className="group card-lift rounded-3xl bg-white p-8 ring-1 ring-zinc-200">
                <span className="font-mono text-sm font-semibold text-zinc-400">{n}</span>
                <h3 className="hover-title mt-3 text-2xl font-bold text-zinc-800">{t}</h3>
                <p className="mt-3 text-base leading-relaxed text-zinc-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="mx-auto max-w-7xl px-5 py-28 md:px-8">
        <h2 className="max-w-3xl text-4xl font-extrabold leading-tight text-zinc-900 md:text-6xl">Trusted by growing agencies.</h2>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {reviews.map(([q, n, r]) => (
            <figure key={n} className="card-lift flex flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-8">
              <blockquote className="text-xl font-medium leading-snug text-zinc-900">&ldquo;{q}&rdquo;</blockquote>
              <figcaption className="mt-8 flex items-center gap-3 border-t border-zinc-100 pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white">{n.split(" ").map((w) => w[0]).join("")}</span>
                <span>
                  <span className="block text-base font-semibold text-zinc-900">{n}</span>
                  <span className="block text-sm text-zinc-500">{r}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-24 md:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-black px-8 py-20 text-center">
          <h2 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-6xl">Ready to fill your pipeline?</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">Start your free trial and run your first audit in under a minute.</p>
          <Link href="/login" className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-9 py-4 text-base font-semibold text-black transition-transform hover:scale-[1.04]">
            Get started free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-sm text-zinc-500 md:flex-row md:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-black text-white"><Zap size={14} fill="currentColor" /></span>
            <span className="font-bold text-zinc-900">LeadScout</span>
          </div>
          <p>&copy; {new Date().getFullYear()} LeadScout Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
