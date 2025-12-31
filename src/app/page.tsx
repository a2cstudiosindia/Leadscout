"use client";

import { useState } from "react";
import { runAudit, findLeads } from "./actions";
import { cn } from "@/lib/utils";
import { DiscoveredBusiness } from "@/lib/discovery/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'scan' | 'find'>('find');

  // Scan State
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  // Discovery State
  const [query, setQuery] = useState("");
  const [finding, setFinding] = useState(false);
  const [leads, setLeads] = useState<DiscoveredBusiness[]>([]);
  const [scanningLead, setScanningLead] = useState<string | null>(null);

  async function handleScan(targetUrl: string = url) {
    if (!targetUrl) return;
    setLoading(true);
    setReport(null);
    setActiveTab('scan');
    setUrl(targetUrl);

    try {
      const result = await runAudit(targetUrl);
      if (result.success) {
        setReport(result.report);
      } else {
        alert("Scan failed!");
      }
    } catch (e) {
      console.error(e);
      alert("Error running scan");
    } finally {
      setLoading(false);
    }
  }

  async function handleFind() {
    if (!query) return;
    setFinding(true);
    setLeads([]);

    try {
      const result = await findLeads(query);
      if (result.success) {
        setLeads(result.results);
      } else {
        alert("Failed to find leads");
      }
    } catch (e) {
      alert("Error searching");
    } finally {
      setFinding(false);
    }
  }

  async function quickAudit(lead: DiscoveredBusiness) {
    if (!lead.website) return alert("No website to scan!");
    setScanningLead(lead.place_id);
    await handleScan(lead.website);
    setScanningLead(null);
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="z-10 max-w-5xl w-full flex flex-col items-center mb-12">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          LeadScout <span className="text-black text-lg font-normal ml-2">Agency Lead Auditor</span>
        </h1>

        <div className="flex gap-4 mt-8 bg-white p-1 rounded-lg border shadow-sm">
          <button
            onClick={() => setActiveTab('find')}
            className={cn("px-6 py-2 rounded-md font-medium transition-all", activeTab === 'find' ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50")}
          >
            Find Leads
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={cn("px-6 py-2 rounded-md font-medium transition-all", activeTab === 'scan' ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50")}
          >
            Direct Audit
          </button>
        </div>
      </div>

      <div className="w-full max-w-4xl">
        {activeTab === 'find' && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Dentists in New York"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFind()}
                className="flex-1 p-4 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-lg"
              />
              <button
                onClick={handleFind}
                disabled={finding}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {finding ? "Searching..." : "Find Leads"}
              </button>
            </div>

            <div className="grid gap-4">
              {leads.map((lead) => (
                <div key={lead.place_id} className="bg-white p-6 rounded-xl border hover:shadow-md transition-shadow flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{lead.name}</h3>
                    <p className="text-gray-500">{lead.formatted_address}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-yellow-500">★ {lead.rating}</span>
                      <span className="text-gray-300">|</span>
                      {lead.website ? (
                        <a href={lead.website} target="_blank" className="text-blue-500 hover:underline text-sm truncate max-w-[200px]">{lead.website}</a>
                      ) : (
                        <span className="text-red-400 text-sm">No Website</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => quickAudit(lead)}
                    disabled={!lead.website || scanningLead === lead.place_id}
                    className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium disabled:opacity-30 disabled:border-gray-200 disabled:text-gray-400"
                  >
                    {scanningLead === lead.place_id ? "Scanning..." : "Audit"}
                  </button>
                </div>
              ))}
              {leads.length === 0 && !finding && query && (
                <div className="text-center text-gray-400 py-12">No leads found. Try a different search.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'scan' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={() => handleScan()}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Scanning..." : "Audit Site"}
              </button>
            </div>

            {report && (
              <div className="mt-8 bg-white p-6 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{report.url}</h2>
                    <p className="text-gray-500 text-xs mt-1">Scanned at: {new Date(report.scannedAt).toLocaleString()}</p>
                  </div>
                  <div className={cn(
                    "text-3xl font-bold px-4 py-2 rounded-lg",
                    report.overallScore >= 80 ? "bg-green-100 text-green-700" :
                      report.overallScore >= 50 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                  )}>
                    {report.overallScore}
                  </div>
                </div>

                <div className="grid gap-4">
                  {Object.entries(report.checks).filter(([k]) => k !== 'seo').map(([key, result]: [string, any]) => (
                    <div key={key} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-blue-100 transition-colors">
                      <div className={cn(
                        "w-3 h-3 rounded-full mt-2 shrink-0",
                        result.status === 'pass' ? "bg-green-500" :
                          result.status === 'warning' ? "bg-yellow-500" : "bg-red-500"
                      )} />
                      <div>
                        <h3 className="font-semibold capitalize text-gray-800">{result.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{result.description}</p>
                      </div>
                      {result.score > 0 && (
                        <div className="ml-auto font-mono text-sm text-gray-400">
                          {result.score}/100
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
