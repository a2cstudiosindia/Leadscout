"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getAnalytics, AnalyticsData } from "@/lib/analytics";
import { getSubscriptionInfo } from "@/lib/subscription";
import { TrendingUp, Users, Search, DollarSign, Activity, Download } from "lucide-react";
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
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [subscription, setSubscription] = useState<Awaited<ReturnType<typeof getSubscriptionInfo>> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const [analyticsResult, subInfo] = await Promise.all([
                getAnalytics(),
                getSubscriptionInfo(),
            ]);
            if (analyticsResult.success && analyticsResult.data) {
                setAnalytics(analyticsResult.data);
            }
            setSubscription(subInfo);
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <DashboardShell>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-xs font-semibold text-[var(--ink-muted)]">Loading analytics...</div>
                </div>
            </DashboardShell>
        );
    }

    if (!analytics) {
        return (
            <DashboardShell>
                <div className="text-center py-12 text-xs text-[var(--ink-muted)]">
                    Unable to load analytics data.
                </div>
            </DashboardShell>
        );
    }

    const funnelData = [
        { stage: "Discovered", count: analytics.leadsByStatus.new, fill: "#6366f1" },
        { stage: "Audited", count: analytics.leadsByStatus.audited, fill: "#818cf8" },
        { stage: "Outreached", count: analytics.leadsByStatus.contacted, fill: "#a5b4fc" },
        { stage: "Won Deals", count: analytics.leadsByStatus.auditing, fill: "#10b981" },
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
            <div className="space-y-6 animate-fade-in max-w-6xl mx-auto py-2">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
                            Performance & Growth Analytics
                        </h1>
                        <p className="text-xs sm:text-sm text-[var(--ink-tertiary)] mt-1">
                            Track lead discovery velocity, website audit activity, and sales pipeline conversion rates.
                        </p>
                    </div>
                    <button
                        onClick={exportCSV}
                        className="btn btn-secondary btn-sm"
                    >
                        <Download size={14} />
                        <span>Export CSV</span>
                    </button>
                </div>

                {/* Plan Usage Card */}
                {subscription && (
                    <div className="card p-5 border border-[var(--border)] bg-[var(--surface)] shadow-xs">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-[var(--ink-primary)]">{subscription.planName} Tier</span>
                                <span className="badge badge-brand text-[10px] uppercase">Active Plan</span>
                            </div>
                            <span className="text-[11px] text-[var(--ink-tertiary)] font-medium">Monthly Quota</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-[var(--ink-secondary)]">Leads Used</span>
                                    <span className="font-semibold tabular-nums text-[var(--ink-primary)]">
                                        {subscription.usage.leads.current} / {subscription.usage.leads.limit === Infinity ? '∞' : subscription.usage.leads.limit}
                                    </span>
                                </div>
                                <div className="bg-[var(--neutral-100)] rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-[var(--brand-500)] h-1.5 rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(100, (subscription.usage.leads.current / (subscription.usage.leads.limit === Infinity ? 100 : subscription.usage.leads.limit)) * 100)}%`
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-[var(--ink-secondary)]">Audits Run</span>
                                    <span className="font-semibold tabular-nums text-[var(--ink-primary)]">
                                        {subscription.usage.audits.current} / {subscription.usage.audits.limit === Infinity ? '∞' : subscription.usage.audits.limit}
                                    </span>
                                </div>
                                <div className="bg-[var(--neutral-100)] rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-[var(--brand-500)] h-1.5 rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(100, (subscription.usage.audits.current / (subscription.usage.audits.limit === Infinity ? 100 : subscription.usage.audits.limit)) * 100)}%`
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-[var(--ink-secondary)]">Searches Used</span>
                                    <span className="font-semibold tabular-nums text-[var(--ink-primary)]">
                                        {subscription.usage.searches.current} / {subscription.usage.searches.limit === Infinity ? '∞' : subscription.usage.searches.limit}
                                    </span>
                                </div>
                                <div className="bg-[var(--neutral-100)] rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-[var(--brand-500)] h-1.5 rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(100, (subscription.usage.searches.current / (subscription.usage.searches.limit === Infinity ? 100 : subscription.usage.searches.limit)) * 100)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="card p-4">
                        <span className="text-[11px] font-semibold text-[var(--ink-tertiary)] uppercase tracking-wider block">Total Discovered</span>
                        <span className="text-xl sm:text-2xl font-bold text-[var(--ink-primary)] tabular-nums mt-1 block">{analytics.overview.totalLeads}</span>
                    </div>

                    <div className="card p-4">
                        <span className="text-[11px] font-semibold text-[var(--ink-tertiary)] uppercase tracking-wider block">Audits Run</span>
                        <span className="text-xl sm:text-2xl font-bold text-[var(--ink-primary)] tabular-nums mt-1 block">{analytics.overview.totalAudits}</span>
                    </div>

                    <div className="card p-4">
                        <span className="text-[11px] font-semibold text-[var(--ink-tertiary)] uppercase tracking-wider block">Conversion Rate</span>
                        <span className="text-xl sm:text-2xl font-bold text-emerald-600 tabular-nums mt-1 block">{analytics.overview.conversionRate}%</span>
                    </div>

                    <div className="card p-4">
                        <span className="text-[11px] font-semibold text-[var(--ink-tertiary)] uppercase tracking-wider block">Potential Pipeline Value</span>
                        <span className="text-xl sm:text-2xl font-bold text-[var(--brand-600)] tabular-nums mt-1 block">${analytics.overview.potentialRevenue.toLocaleString()}</span>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Leads Over Time */}
                    <div className="card p-5 space-y-4">
                        <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--ink-primary)]">Lead Discovery Velocity</h3>
                        <div className="h-64">
                            {analytics.leadsOverTime.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analytics.leadsOverTime}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                        <XAxis dataKey="date" fontSize={11} stroke="var(--ink-muted)" tickFormatter={(v) => v.slice(5)} />
                                        <YAxis fontSize={11} stroke="var(--ink-muted)" />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'var(--surface)', 
                                                borderRadius: 8, 
                                                border: '1px solid var(--border)',
                                                fontSize: 12,
                                                boxShadow: 'var(--shadow-md)'
                                            }} 
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#6366f1"
                                            strokeWidth={2}
                                            dot={{ fill: "#6366f1", r: 3 }}
                                            activeDot={{ r: 5 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-xs text-[var(--ink-muted)]">
                                    No data yet. Start discovering leads to populate charts.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lead Funnel */}
                    <div className="card p-5 space-y-4">
                        <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--ink-primary)]">Outreach & Deal Funnel</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnelData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                    <XAxis type="number" fontSize={11} stroke="var(--ink-muted)" />
                                    <YAxis type="category" dataKey="stage" fontSize={11} width={80} stroke="var(--ink-muted)" />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'var(--surface)', 
                                            borderRadius: 8, 
                                            border: '1px solid var(--border)',
                                            fontSize: 12,
                                            boxShadow: 'var(--shadow-md)'
                                        }} 
                                    />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card p-5 space-y-3">
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--ink-primary)] flex items-center gap-2">
                        <Activity size={14} className="text-[var(--brand-500)]" />
                        <span>Audit & Activity Stream</span>
                    </h3>
                    {analytics.recentEvents.length > 0 ? (
                        <div className="divide-y divide-[var(--border)] max-h-72 overflow-y-auto">
                            {analytics.recentEvents.map((event, i) => (
                                <div key={i} className="flex items-center justify-between py-2.5 text-xs">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-1.5 h-1.5 bg-[var(--brand-500)] rounded-full" />
                                        <span className="font-medium text-[var(--ink-primary)]">{event.event.replace(/_/g, ' ')}</span>
                                    </div>
                                    <span className="text-[11px] text-[var(--ink-muted)] tabular-nums">
                                        {new Date(event.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--ink-muted)] text-xs py-4 text-center">No recent activity recorded yet.</p>
                    )}
                </div>
            </div>
        </DashboardShell>
    );
}
