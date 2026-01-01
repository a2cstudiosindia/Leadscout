# 🚀 LeadScout

**Automate Your Agency Growth.** LeadScout is a powerful, all-in-one platform designed for digital agencies to discover, audit, and convert leads with ease.

[![Live Demo](https://img.shields.io/badge/Live-Demo-teal.svg?style=for-the-badge)](https://lead-scout-zeta.vercel.app/)

---

## ✨ Features

### 🔍 Lead Discovery
- Search for any business niche in any location using **Google Places API**.
- Get instant access to business names, addresses, and website URLs.
- Filter and save high-potential leads directly to your CRM.

### ⚡ Digital Presence Audit
- **One-Click Scanning**: Deep-dive into any business website.
- **Comprehensive Scores**: Evaluate SEO, Performance, Security, and Accessibility.
- **Detailed Insights**: Identify broken links, slow load times, and missing meta tags.

### 💼 Integrated CRM
- **Lead Management**: Track leads through the funnel (New, Auditing, Audited, Contacted).
- **Auto-Save Notes**: Debounced note-saving ensures you never lose a detail.
- **KPI Dashboard**: Real-time tracking of Total Leads, Audits Run, and Potential Revenue.

### 📧 Outreach & Branding
- **AI Cold Emails**: Generate personalized outreach drafts based on audit findings.
- **PDF Reports**: Export professional audit summaries to share with prospects.
- **Agency Branding**: Customize the platform with your agency's name and logo.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Authentication**: [Supabase Auth](https://supabase.com/auth)
- **Database**: [Supabase PostgreSQL](https://supabase.com/database)
- **Storage**: [Supabase Storage](https://supabase.com/storage) (for Agency Logos)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm / npm / yarn
- A Supabase Project
- Google Maps API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AbhishekRDJ/LeadScout.git
   cd lead-scout
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. **Database Setup**
   Run the SQL scripts provided in the `supabase/` directory in your Supabase SQL Editor:
   - `schema.sql`: Core tables and RLS.
   - `schema_phase3.sql`: CRM and Branding updates.
   - `storage_setup.sql`: Storage bucket and policies.

5. **Run the development server**
   ```bash
   pnpm run dev
   ```

---

## 📸 Screenshots

> [!NOTE]
> Add your own screenshots here! (Dashboard, CRM, Audit Results)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by [AbhishekRDJ](https://github.com/AbhishekRDJ)
