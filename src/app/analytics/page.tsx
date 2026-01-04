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
                    <div className="animate-pulse text-teal-500 font-bold">Loading analytics...</div>
                </div>
            </DashboardShell>
        );
    }

    if (!analytics) {
        return (
            <DashboardShell>
                <div className="text-center py-12 text-gray-500">
                    Unable to load analytics data.
                </div>
            </DashboardShell>
        );
    }

    const funnelData = [
        { stage: "New", count: analytics.leadsByStatus.new, fill: "#38B2AC" },
        { stage: "Auditing", count: analytics.leadsByStatus.auditing, fill: "#4FD1C5" },
        { stage: "Audited", count: analytics.leadsByStatus.audited, fill: "#81E6D9" },
        { stage: "Contacted", count: analytics.leadsByStatus.contacted, fill: "#B2F5EA" },
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
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
                        <p className="text-gray-500 mt-1">Track your lead generation performance</p>
                    </div>
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 bg-teal-400 text-white px-4 py-2 rounded-xl font-bold hover:bg-teal-500 transition-all"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>

                {/* Usage Bar (if subscription info available) */}
                {subscription && (
                    <div className="bg-gradient-to-r from-teal-400 to-teal-500 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">{subscription.planName} Plan</h3>
                            <span className="text-sm opacity-80">This Month</span>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm opacity-80 mb-1">Leads Used</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-white/20 rounded-full h-2">
                                        <div
                                            className="bg-white rounded-full h-2 transition-all"
                                            style={{
                                                width: `${Math.min(100, (subscription.usage.leads.current / (subscription.usage.leads.limit === Infinity ? 100 : subscription.usage.leads.limit)) * 100)}%`
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold">
                                        {subscription.usage.leads.current}/{subscription.usage.leads.limit === Infinity ? '∞' : subscription.usage.leads.limit}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm opacity-80 mb-1">Audits Used</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-white/20 rounded-full h-2">
                                        <div
                                            className="bg-white rounded-full h-2 transition-all"
                                            style={{
                                                width: `${Math.min(100, (subscription.usage.audits.current / (subscription.usage.audits.limit === Infinity ? 100 : subscription.usage.audits.limit)) * 100)}%`
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold">
                                        {subscription.usage.audits.current}/{subscription.usage.audits.limit === Infinity ? '∞' : subscription.usage.audits.limit}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-teal-50 text-teal-500 rounded-xl">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Leads</p>
                                <h3 className="text-2xl font-bold text-gray-800">{analytics.overview.totalLeads}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                                <Search size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Audits Run</p>
                                <h3 className="text-2xl font-bold text-gray-800">{analytics.overview.totalAudits}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-500 rounded-xl">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Conversion Rate</p>
                                <h3 className="text-2xl font-bold text-gray-800">{analytics.overview.conversionRate}%</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Potential Revenue</p>
                                <h3 className="text-2xl font-bold text-gray-800">${analytics.overview.potentialRevenue.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Leads Over Time */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4">Leads Over Time</h3>
                        <div className="h-64">
                            {analytics.leadsOverTime.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analytics.leadsOverTime}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                                        <YAxis fontSize={12} />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#38B2AC"
                                            strokeWidth={2}
                                            dot={{ fill: "#38B2AC" }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    No data yet. Start saving leads!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lead Funnel */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4">Lead Funnel</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnelData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" fontSize={12} />
                                    <YAxis type="category" dataKey="stage" fontSize={12} width={80} />
                                    <Tooltip />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-teal-500" />
                        Recent Activity
                    </h3>
                    {analytics.recentEvents.length > 0 ? (
                        <div className="space-y-3">
                            {analytics.recentEvents.map((event, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-teal-400 rounded-full" />
                                        <span className="text-sm font-medium text-gray-700">{event.event.replace(/_/g, ' ')}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(event.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">No recent activity. Start using LeadScout!</p>
                    )}
                </div>
            </div>
        </DashboardShell>
    );
}
