import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Analytics",
    description:
        "Track your lead generation performance with detailed analytics. Monitor leads, conversion rates, and revenue potential.",
};

export default function AnalyticsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
