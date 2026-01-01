import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b p-4 max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          LeadScout
        </h1>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Log in</Link>
          <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl mb-6">
          Find Clients Who Need You.<br />
          <span className="text-blue-600">Automate Your Agency Sales.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto mb-10">
          LeadScout scans thousands of local businesses to find websites that are losing money.
          Generate professional audit reports in seconds and close more deals.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all">
            Start Finding Leads
          </Link>
          <Link href="/login" className="px-8 py-4 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all">
            View Sample Report
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 text-left">
          <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-2xl mb-4">🔍</div>
            <h3 className="font-bold text-xl mb-2">Automated Discovery</h3>
            <p className="text-gray-600">Find "Dentists in New York" or "Gyms in Austin" instantly. We integrate with Google Places to find real businesses.</p>
          </div>
          <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-2xl mb-4">⚡</div>
            <h3 className="font-bold text-xl mb-2">Smart Audits</h3>
            <p className="text-gray-600">We check for "Money Losing" problems: Slow load speeds, broken social links, and outdated copyright years.</p>
          </div>
          <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-2xl mb-4">📄</div>
            <h3 className="font-bold text-xl mb-2">White-Label Reports</h3>
            <p className="text-gray-600">Download a professional PDF report with one click. Send it to the client to prove their need for your services.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
