import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: {
    default: "LeadScout - B2B Lead Discovery & Automated Audits for Agencies",
    template: "%s | LeadScout",
  },
  description:
    "Discover local businesses with underperforming websites, execute instant automated audits, and deliver white-label reports that convert prospects into clients.",
  keywords: [
    "lead generation",
    "digital agency",
    "website audit",
    "SEO tools",
    "client acquisition",
    "business leads",
    "marketing automation",
  ],
  authors: [{ name: "LeadScout" }],
  creator: "LeadScout",
  publisher: "LeadScout",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://leadscout.app",
    siteName: "LeadScout",
    title: "LeadScout - B2B Lead Discovery & Automated Audits for Agencies",
    description:
      "Discover local businesses with underperforming websites, execute instant automated audits, and deliver white-label reports that convert prospects into clients.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LeadScout - Lead Generation for Digital Agencies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LeadScout - B2B Lead Discovery & Automated Audits",
    description:
      "Discover local businesses with underperforming websites, execute instant automated audits, and deliver white-label reports.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased bg-white text-[#1d1d1f] min-h-screen selection:bg-black selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded-lg"
        >
          Skip to main content
        </a>
        <main id="main-content">{children}</main>
        <ChatWidget />
      </body>
    </html>
  );
}
