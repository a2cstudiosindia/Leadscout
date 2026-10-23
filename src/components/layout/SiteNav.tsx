"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Menu, X, ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#workflow", label: "How it works" },
  { href: "/#reviews", label: "Customers" },
  { href: "/pricing", label: "Pricing" },
  { href: "/api/docs", label: "API Docs" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-2.5" aria-label="LeadScout home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
            <Zap size={16} fill="currentColor" />
          </span>
          <span className="text-lg font-bold tracking-tight text-zinc-900">LeadScout</span>
        </Link>

        <div className="hidden items-center gap-8 text-[15px] font-medium text-zinc-600 md:flex">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="transition-colors hover:text-black">{l.label}</Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-full bg-black px-5 py-2 text-[15px] font-semibold text-white transition-transform hover:scale-[1.03] hover:bg-zinc-800">
              Dashboard <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-[15px] font-medium text-zinc-700 transition-colors hover:text-black">Sign in</Link>
              <Link href="/login" className="rounded-full bg-black px-5 py-2 text-[15px] font-semibold text-white transition-transform hover:scale-[1.03] hover:bg-zinc-800">Get started</Link>
            </>
          )}
        </div>

        <button className="rounded-lg p-2 text-zinc-700 md:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-black/5 bg-white px-5 pb-6 pt-2 md:hidden">
          {links.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="block border-b border-zinc-100 py-3.5 text-lg font-medium text-zinc-900">{l.label}</Link>
          ))}
          {isAuthenticated ? (
            <Link href="/dashboard" onClick={() => setOpen(false)} className="mt-5 inline-flex items-center justify-center gap-2 w-full rounded-full bg-black py-3.5 text-center text-base font-semibold text-white">
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="mt-5 block rounded-full bg-black py-3.5 text-center text-base font-semibold text-white">Get started</Link>
          )}
        </div>
      )}
    </header>
  );
}
