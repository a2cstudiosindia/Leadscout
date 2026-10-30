"use client";

import { useCached } from "@/lib/use-cached";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getAnalytics } from "@/lib/analytics";
import { getSubscriptionInfo } from "@/lib/subscription";
import { TrendingUp, Users, Search, DollarSign, Activity, Download, ArrowUpRight } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";

export default function AnalyticsPage() {
    const { data: analyticsResult, loading: l1 } = useCached("analytics", getAnalytics);
    const { data: subscription } = useCached("sub", () => getSubscriptionInfo());
    const analytics = analyticsResult?.success ? analyticsResult.data ?? null : null;
    const loading = l1;

    if (loading) {
        return (
            <DashboardShell>
                <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
                    <div className="h-8 w-48 bg-zinc-100/60 rounded-md mb-2" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-28 bg-white border border-zinc-200 rounded-xl" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-72 bg-white border border-zinc-200 rounded-xl" />
                        <div className="h-72 bg-white border border-zinc-200 rounded-xl" />
                    </div>
                </div>
            </DashboardShell>
        );
    }

    if (!analytics) {
        return (
            <DashboardShell>
                <div className="text-center py-16 text-zinc-500 font-mono text-sm">
                    No analytics records found for this workspace.
                </div>
            </DashboardShell>
        );
    }

    const funnelData = [
        { stage: "New", count: analytics.leadsByStatus.new, fill: "#18181b" },
        { stage: "Auditing", count: analytics.leadsByStatus.auditing, fill: "#3f3f46" },
        { stage: "Audited", count: analytics.leadsByStatus.audited, fill: "#71717a" },
        { stage: "Contacted", count: analytics.leadsByStatus.contacted, fill: "#a1a1aa" },
    ];

    const exportCSV = () => {
        const headers = ["Metric", "Value"];
        const rows = [
            ["Total Leads", analytics.overview.totalLeads],
            ["Total Audits", analytics.overview.totalAudits],
            ["Conversion Rate", `${analytics.overview.conversionRate}%`],
            ["Potential Revenue", `$${analytics.overview.potentialRevenue.toLocaleString()}`],
        ];

        const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "leadscout-analytics.csv";
        a.click();
    };

    return (
        <DashboardShell>
            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
                    <div>
                        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Performance & Pipeline</h1>
                        <p className="text-sm text-zinc-500 mt-1">Real-time funnel conversion metrics and lead velocity</p>
                    </div>
                    <button
                        onClick={exportCSV}
                        className="inline-flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-xs w-fit"
                    >
                        <Download size={14} />
                        Export Pipeline CSV
                    </button>
                </div>

                {/* Usage Bar (if subscription info available) */}
                {subscription && (
                    <div className="bg-white border border-zinc-200 rounded-xl p-5" role="region" aria-label="Plan usage">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-zinc-900">{subscription.planName} Tier</span>
                                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-300">
                                    Current Billing Period
                                </span>
                            </div>
                            <span className="text-xs text-zinc-500 font-mono">Quota Utilization</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5 font-mono">
                                    <span>Leads Saved</span>
                                    <span className="text-zinc-800 font-medium">
                                        {subscription.usage.leads.current} / {subscription.usage.leads.limit === Infinity ? 'Unlimited' : subscription.usage.leads.limit}
                                    </span>
                                </div>
                                <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-zinc-900 h-1.5 rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(100, (subscription.usage.leads.current / (subscription.usage.leads.limit === Infinity ? 100 : subscription.usage.leads.limit)) * 100)}%`
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5 font-mono">
                                    <span>Audits Executed</span>
                                    <span className="text-zinc-800 font-medium">
                                        {subscription.usage.audits.current} / {subscription.usage.audits.limit === Infinity ? 'Unlimited' : subscription.usage.audits.limit}
                                    </span>
                                </div>
                                <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-zinc-900 h-1.5 rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(100, (subscription.usage.audits.current / (subscription.usage.audits.limit === Infinity ? 100 : subscription.usage.audits.limit)) * 100)}%`
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5 font-mono">
                                    <span>Discovery Searches</span>
                                    <span className="text-zinc-800 font-medium">
                                        {subscription.usage.searches.current} / {subscription.usage.searches.limit === Infinity ? 'Unlimited' : subscription.usage.searches.limit}
                                    </span>
                                </div>
                                <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-zinc-900 h-1.5 rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(100, (subscription.usage.searches.current / (subscription.usage.searches.limit === Infinity ? 100 : subscription.usage.searches.limit)) * 100)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" role="region" aria-label="Key performance indicators">
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between text-zinc-500 mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider">Pipeline Volume</span>
                            <div className="p-2 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-700">
                                <Users size={18} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-extrabold text-zinc-900 font-mono tracking-tight">{analytics.overview.totalLeads}</h3>
                        <p className="text-xs text-zinc-500 mt-1.5">Total qualified prospects</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between text-zinc-500 mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider">Audits Run</span>
                            <div className="p-2 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-700">
                                <Search size={18} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-extrabold text-zinc-900 font-mono tracking-tight">{analytics.overview.totalAudits}</h3>
                        <p className="text-xs text-zinc-500 mt-1.5">Automated technical scans</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between text-zinc-500 mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider">Conversion Rate</span>
                            <div className="p-2 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-700">
                                <TrendingUp size={18} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-extrabold text-zinc-900 font-mono tracking-tight">{analytics.overview.conversionRate}%</h3>
                        <p className="text-xs text-zinc-500 mt-1.5">Lead to contacted ratio</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between text-zinc-500 mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider">Pipeline Value</span>
                            <div className="p-2 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-700">
                                <DollarSign size={18} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-extrabold text-zinc-900 font-mono tracking-tight">${analytics.overview.potentialRevenue.toLocaleString()}</h3>
                        <p className="text-xs text-zinc-500 mt-1.5">Estimated contract sum</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Leads Over Time */}
                    <div className="bg-white p-6 rounded-xl border border-zinc-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-base text-zinc-900">Discovery Trend (30 Days)</h3>
                            <span className="text-xs text-zinc-500 font-mono">Daily volume</span>
                        </div>
                        <div className="h-64">
                            {analytics.leadsOverTime.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analytics.leadsOverTime}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                                        <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                                        <YAxis stroke="#71717a" fontSize={11} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", color: "#fafafa", borderRadius: "8px", fontSize: "12px" }}
                                            labelStyle={{ color: "#a1a1aa" }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#18181b"
                                            strokeWidth={2}
                                            dot={{ fill: "#18181b", r: 3 }}
                                            activeDot={{ r: 5, fill: "#ffffff" }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-zinc-500 text-xs font-mono">
                                    No historical lead timeline yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lead Funnel */}
                    <div className="bg-white p-6 rounded-xl border border-zinc-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-base text-zinc-900">Stage Breakdown</h3>
                            <span className="text-xs text-zinc-500 font-mono">Funnel stages</span>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnelData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
                                    <XAxis type="number" stroke="#71717a" fontSize={11} />
                                    <YAxis type="category" dataKey="stage" stroke="#71717a" fontSize={11} width={80} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", color: "#fafafa", borderRadius: "8px", fontSize: "12px" }}
                                    />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-xl border border-zinc-200">
                    <h3 className="font-semibold text-base text-zinc-900 mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-zinc-500" />
                        Audit & Event Trail
                    </h3>
                    {analytics.recentEvents.length > 0 ? (
                        <div className="divide-y divide-zinc-200 max-h-72 overflow-y-auto pr-2">
                            {analytics.recentEvents.map((event, i) => (
                                <div key={i} className="flex items-center justify-between py-2.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full" />
                                        <span className="text-xs font-medium text-zinc-700 font-mono">{event.event.replace(/_/g, ' ')}</span>
                                    </div>
                                    <span className="text-[11px] text-zinc-500 font-mono">
                                        {new Date(event.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-xs font-mono">No recent activity logged in event stream.</p>
                    )}
                </div>
            </div>
        </DashboardShell>
    );
}
