"use client";

import { useState, useEffect } from "react";
import { runAudit, findLeads, saveLead, getLeads, saveReport } from "../actions";
import { cn } from "@/lib/utils";
import { DiscoveredBusiness } from "@/lib/discovery/types";
import { generatePDF } from "@/lib/pdf-generator";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<'scan' | 'find' | 'leads'>('find');

    // Scan State
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<any>(null);

    // Discovery State
    const [query, setQuery] = useState("");
    const [finding, setFinding] = useState(false);
    const [leads, setLeads] = useState<DiscoveredBusiness[]>([]);
    const [scanningLead, setScanningLead] = useState<string | null>(null);
    const [savingLead, setSavingLead] = useState<string | null>(null);

    // My Leads State
    const [myLeads, setMyLeads] = useState<any[]>([]);
    const [loadingLeads, setLoadingLeads] = useState(false);
    const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);

    async function handleSaveReport() {
        if (!currentLeadId || !report) return;
        const result = await saveReport(currentLeadId, report);
        if (result.success) {
            alert("Report saved to database!");
            // Refresh leads to show updated status
            fetchLeads();
        } else {
            alert("Failed to save report");
        }
    }

    useEffect(() => {
        if (activeTab === 'leads') {
            fetchLeads();
        }
    }, [activeTab]);

    async function fetchLeads() {
        setLoadingLeads(true);
        const result = await getLeads();
        if (result.success) {
            setMyLeads(result.leads || []);
        }
        setLoadingLeads(false);
    }

    async function handleScan(targetUrl: string = url) {
        if (!targetUrl) return;
        setLoading(true);
        setReport(null);
        // Only clear ID if we are NOT coming from the leads tab (which sets it before calling this)
        // Actually, simpler: if called via manual input, we might want to clear it. 
        // But for safety, let's just let the caller handle it or keep it if it's the same URL?
        // Let's safe-guard: if the URL changes manually, we should probably clear the ID.
        // For now, let's assume if the user types a new URL, they are auditing something else.
        if (targetUrl !== url) setCurrentLeadId(null);

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

    async function handleSave(lead: DiscoveredBusiness) {
        setSavingLead(lead.place_id);
        const result = await saveLead(lead);
        if (result.success) {
            alert("Lead Saved!");
        } else {
            alert("Failed to save: " + result.error);
        }
        setSavingLead(null);
    }

    return (
        <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
            <div className="z-10 max-w-5xl w-full flex flex-col items-center mb-12">
                <div className="flex justify-between w-full items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        LeadScout <span className="text-blue-600">Dashboard</span>
                    </h1>
                    <div className="text-sm text-gray-500">
                        Welcome back
                    </div>
                </div>

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
                    <button
                        onClick={() => setActiveTab('leads')}
                        className={cn("px-6 py-2 rounded-md font-medium transition-all", activeTab === 'leads' ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50")}
                    >
                        My Leads
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
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSave(lead)}
                                            disabled={savingLead === lead.place_id}
                                            className="bg-white border text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                                        >
                                            {savingLead === lead.place_id ? "Saving..." : "Save Lead"}
                                        </button>
                                        <button
                                            onClick={() => quickAudit(lead)}
                                            disabled={!lead.website || scanningLead === lead.place_id}
                                            className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg font-medium disabled:opacity-30 disabled:border-gray-200"
                                        >
                                            {scanningLead === lead.place_id ? "Scanning..." : "Audit"}
                                        </button>
                                    </div>
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

                                <div className="flex justify-end mb-4 gap-2">
                                    {currentLeadId && (
                                        <button
                                            onClick={handleSaveReport}
                                            className="flex items-center gap-2 text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors"
                                        >
                                            Save Report to DB
                                        </button>
                                    )}
                                    <button
                                        onClick={() => generatePDF(report)}
                                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        Download Report PDF
                                    </button>
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


                {activeTab === 'leads' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800">Saved Leads</h2>
                        {loadingLeads ? (
                            <div className="text-center py-10 text-gray-500">Loading your leads...</div>
                        ) : (
                            <div className="grid gap-4">
                                {myLeads.map((lead) => (
                                    <div key={lead.id} className="bg-white p-6 rounded-xl border hover:shadow-md transition-shadow flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{lead.business_name}</h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={cn(
                                                    "text-xs font-semibold px-2 py-1 rounded-full uppercase",
                                                    lead.status === 'new' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                                                )}>
                                                    {lead.status}
                                                </span>
                                                <span className="text-gray-300">|</span>
                                                <a href={lead.website_url} target="_blank" className="text-blue-500 hover:underline text-sm truncate max-w-[200px]">
                                                    {lead.website_url}
                                                </a>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">Saved: {new Date(lead.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setActiveTab('scan');
                                                    setCurrentLeadId(lead.id);
                                                    setUrl(lead.website_url);
                                                    handleScan(lead.website_url);
                                                }}
                                                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg font-medium"
                                            >
                                                Audit Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {myLeads.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                                        <p className="text-gray-500">You haven't saved any leads yet.</p>
                                        <button
                                            onClick={() => setActiveTab('find')}
                                            className="mt-4 text-blue-600 font-medium hover:underline"
                                        >
                                            Find some leads now &rarr;
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
