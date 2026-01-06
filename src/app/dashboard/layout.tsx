import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description:
        "Manage your leads, run website audits, and track your sales pipeline all in one powerful dashboard.",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
