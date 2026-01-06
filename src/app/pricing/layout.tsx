import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing",
    description:
        "Choose the perfect plan for your agency. From free to enterprise, LeadScout scales with your business needs.",
};

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
