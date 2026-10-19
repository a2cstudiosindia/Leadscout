"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Search, BarChart3, FileText, Users, ArrowRight, Star, Shield, Menu, X, Briefcase, Globe2, Layers, CheckCircle2, DollarSign } from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--ink-primary)] relative overflow-hidden">
      {/* Subtle landing gradient glow */}
      <div className="landing-gradient z-0" />

      {/* Navbar */}
      <nav className="p-4 max-w-7xl mx-auto flex justify-between items-center relative z-10 border-b border-[var(--border)]" role="navigation" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-2.5" aria-label="LeadScout Home">
          <div className="w-8 h-8 bg-[var(--brand-500)] rounded-[var(--r-md)] text-white flex items-center justify-center shadow-xs">
            <Zap size={16} fill="currentColor" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-[var(--ink-primary)] tracking-tight leading-none">LeadScout</span>
            <span className="text-[10px] font-semibold text-[var(--brand-600)] uppercase tracking-wider mt-0.5">Central Hub</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-[var(--ink-secondary)]">
          <a href="#features" className="hover:text-[var(--brand-600)] transition-colors">Features</a>
          <a href="#workflow" className="hover:text-[var(--brand-600)] transition-colors">Workflow</a>
          <a href="#testimonials" className="hover:text-[var(--brand-600)] transition-colors">Testimonials</a>
          <Link href="/pricing" className="hover:text-[var(--brand-600)] transition-colors">Pricing</Link>
          <Link href="/api/docs" className="hover:text-[var(--brand-600)] transition-colors">API Docs</Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link href="/login" className="btn btn-secondary btn-sm">Log in</Link>
          <Link href="/login" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-[var(--r-sm)] hover:bg-[var(--neutral-100)] text-[var(--ink-secondary)]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-[var(--surface)] z-50 pt-20 px-6 animate-fade-in flex flex-col justify-between pb-8"
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute top-4 right-4 p-2 text-[var(--ink-secondary)]"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
          <nav className="flex flex-col gap-4 text-sm font-semibold">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[var(--border)]">Features</a>
            <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[var(--border)]">Workflow</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[var(--border)]">Testimonials</a>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[var(--border)]">Pricing</Link>
          </nav>
          <div className="flex flex-col gap-2">
            <Link href="/login" className="btn btn-secondary w-full justify-center">Log in</Link>
            <Link href="/login" className="btn btn-primary w-full justify-center">Get Started Free</Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[var(--brand-50)] text-[var(--brand-600)] px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border border-[var(--border)]">
              <Zap size={13} />
              <span>The Central Growth Platform for Digital Agencies</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 leading-[1.12] text-[var(--ink-primary)]">
              Find Qualified Leads. <br />
              <span className="text-[var(--brand-500)]">Manage Client Retainers.</span>
            </h1>

            <p className="text-sm md:text-base text-[var(--ink-secondary)] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed font-normal">
              LeadScout automates the end-to-end client acquisition lifecycle for agencies: uncover local businesses with broken websites, share instant interactive audit pitch links, track deals in Kanban, and monetize referrals in the B2B Exchange.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
              <Link href="/login" className="btn btn-primary btn-lg">
                <span>Start Free Trial</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/pricing" className="btn btn-secondary btn-lg">
                View Agency Plans
              </Link>
            </div>
            
            <p className="text-[11px] text-[var(--ink-muted)] mt-3">No credit card required • Instant workspace setup in 30 seconds</p>
          </div>

          {/* Right Column - Tech Circuit Animation */}
          <div className="flex justify-center">
            <div className="circuit-board w-full max-w-md aspect-square relative bg-[var(--neutral-950)] border border-[var(--border-strong)] shadow-lg rounded-[var(--r-xl)]">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" fill="none">
                {/* Circuit Grid Lines */}
                <line x1="200" y1="200" x2="50" y2="200" stroke="#6366f1" strokeWidth="2" opacity="0.25" />
                <line x1="200" y1="200" x2="350" y2="200" stroke="#6366f1" strokeWidth="2" opacity="0.25" />
                <path d="M 200 200 L 120 200 L 80 160 L 30 160" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.2" />
                <path d="M 200 200 L 280 200 L 320 160 L 370 160" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.2" />
                <path d="M 200 200 L 120 200 L 80 240 L 30 240" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.2" />
                <path d="M 200 200 L 280 200 L 320 240 L 370 240" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.2" />
                <line x1="200" y1="200" x2="200" y2="60" stroke="#6366f1" strokeWidth="2" opacity="0.2" />
                <line x1="200" y1="200" x2="200" y2="340" stroke="#6366f1" strokeWidth="2" opacity="0.2" />

                {/* Animated Waves */}
                <line x1="200" y1="200" x2="50" y2="200" stroke="url(#indigoGradH)" strokeWidth="3" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" values="0 150;150 0;0 150" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" />
                </line>
                <line x1="200" y1="200" x2="350" y2="200" stroke="url(#indigoGradH)" strokeWidth="3" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" values="0 150;150 0;0 150" dur="2s" repeatCount="indefinite" begin="0.5s" />
                  <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
                </line>

                <defs>
                  <linearGradient id="indigoGradH" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                    <stop offset="50%" stopColor="#818cf8" stopOpacity="1" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Node Pulses */}
              <div className="circuit-node" style={{ top: '38%', left: '7%', animationDelay: '0s' }} />
              <div className="circuit-node" style={{ top: '38%', right: '7%', animationDelay: '0.5s' }} />
              <div className="circuit-node" style={{ bottom: '38%', left: '7%', animationDelay: '1s' }} />
              <div className="circuit-node" style={{ bottom: '38%', right: '7%', animationDelay: '1.5s' }} />

              {/* Center Brand Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="circuit-icon-container">
                  <Zap size={48} className="text-white drop-shadow-[0_0_20px_rgba(99,102,241,0.8)]" fill="white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Proof Numbers */}
      <section className="bg-[var(--neutral-50)] py-10 border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[var(--ink-primary)] tabular-nums">50,000+</div>
              <div className="text-xs text-[var(--ink-tertiary)] mt-1 font-medium">Local Businesses Scored</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[var(--ink-primary)] tabular-nums">500+</div>
              <div className="text-xs text-[var(--ink-tertiary)] mt-1 font-medium">Digital Agencies Scaled</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-emerald-600 tabular-nums">40%</div>
              <div className="text-xs text-[var(--ink-tertiary)] mt-1 font-medium">Average Close Rate Lift</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[var(--brand-600)] tabular-nums">10%</div>
              <div className="text-xs text-[var(--ink-tertiary)] mt-1 font-medium">Referral Fee on Deal Close</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Agency Workflow Section */}
      <section id="workflow" className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="text-[11px] font-semibold text-[var(--brand-600)] uppercase tracking-wider block mb-1">
            End-To-End Architecture
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--ink-primary)]">
            How Top Agencies Move From Cold Lead to Retainer
          </h2>
          <p className="text-xs md:text-sm text-[var(--ink-tertiary)] mt-1.5 leading-relaxed">
            Five synchronized tools in one single workspace. No messy spreadsheets or disconnected software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: "01",
              title: "Discover",
              icon: Search,
              desc: "Target local niches & cities via Google Places. Detect missing SSL, slow speed, and zero mobile responsiveness."
            },
            {
              step: "02",
              title: "Audit & Link",
              icon: Zap,
              desc: "Generate interactive public web pitch links branded with your agency name and embedded Cal.com scheduling."
            },
            {
              step: "03",
              title: "Pipeline",
              icon: Layers,
              desc: "Track prospect stages in Kanban from Outreached to Call Booked to Proposal to Closed Won."
            },
            {
              step: "04",
              title: "Clients Hub",
              icon: Briefcase,
              desc: "Manage monthly retainers ($/mo), contract deliverables, renewal schedules, and recurring MRR."
            },
            {
              step: "05",
              title: "B2B Exchange",
              icon: Globe2,
              desc: "Post leads outside your service specialty to peer agencies for a 10% commission, and claim hot inbound deals."
            },
          ].map((item) => (
            <div key={item.step} className="card p-5 space-y-3 relative hover:border-[var(--border-strong)] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--brand-600)] tabular-nums">{item.step}</span>
                <div className="p-1.5 bg-[var(--brand-50)] text-[var(--brand-600)] rounded-[var(--r-sm)]">
                  <item.icon size={14} />
                </div>
              </div>
              <h3 className="font-semibold text-sm text-[var(--ink-primary)]">{item.title}</h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed font-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-[var(--neutral-50)] py-16 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--ink-primary)]">Built for Professional Agency Operators</h2>
            <p className="text-xs sm:text-sm text-[var(--ink-tertiary)] mt-1">See how boutique agencies convert cold audits into recurring clients.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-6 space-y-4">
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                &quot;The interactive web audit links have completely replaced our manual PDF audits. Prospects open the link, see their score, and book directly onto our calendar.&quot;
              </p>
              <div className="pt-2 border-t border-[var(--border)]">
                <div className="font-semibold text-xs text-[var(--ink-primary)]">James Davis</div>
                <div className="text-[11px] text-[var(--ink-muted)]">CEO, Apex Growth Media</div>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                &quot;The B2B Exchange let us monetize 12 leads last month that asked for Shopify custom development, which we don&apos;t do. We earned referral fees without writing code.&quot;
              </p>
              <div className="pt-2 border-t border-[var(--border)]">
                <div className="font-semibold text-xs text-[var(--ink-primary)]">Sarah Mitchell</div>
                <div className="text-[11px] text-[var(--ink-muted)]">Founder, WebCraft Studio</div>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                &quot;Managing our pipeline from audit to active retainer in one clean dashboard has doubled our agency efficiency. Extremely fast, clean, and reliable software.&quot;
              </p>
              <div className="pt-2 border-t border-[var(--border)]">
                <div className="font-semibold text-xs text-[var(--ink-primary)]">Raj Kumar</div>
                <div className="text-[11px] text-[var(--ink-muted)]">Director, Pulse Digital</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-[var(--neutral-950)] text-white py-16 border-t border-[var(--sidebar-border)]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Ready to Accelerate Your Agency&apos;s Client Acquisition?
          </h2>
          <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto leading-relaxed">
            Join hundreds of digital marketing and web agencies uncovering leads and managing client retainers with LeadScout.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link href="/login" className="btn btn-primary btn-lg">
              <span>Start Free Agency Trial</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/pricing" className="btn btn-secondary btn-lg bg-white/10 hover:bg-white/15 text-white border-white/20">
              Explore Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--neutral-950)] text-white py-12 border-t border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-white/50">
          <div className="flex items-center gap-2 text-white">
            <Zap size={14} className="fill-[var(--brand-400)] text-[var(--brand-400)]" />
            <span className="font-bold">LeadScout Central Hub</span>
          </div>
          <div>&copy; {new Date().getFullYear()} LeadScout Inc. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
