# LeadScout - Project Documentation 📚

> A comprehensive SaaS platform for digital agencies to discover leads, audit websites, and close more deals.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Authentication Flow](#authentication-flow)
5. [Payment Integration](#payment-integration)
6. [Website Scanning System](#website-scanning-system)
7. [Lead Discovery](#lead-discovery)
8. [AI Recommendations](#ai-recommendations)
9. [Database Schema](#database-schema)
10. [API Endpoints](#api-endpoints)
11. [Deployment](#deployment)

---

## 🎯 Project Overview

LeadScout helps digital agencies:
- **Find Leads**: Discover businesses with poor websites using Google Places API
- **Audit Websites**: Scan sites for security, mobile, performance, SEO, and more
- **Generate Reports**: Create professional PDF audit reports to pitch clients
- **Manage Pipeline**: CRM to track leads from discovery to closed deal
- **AI Recommendations**: Personalized improvement suggestions using AI

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16 + React 19 | App Router, Server Components |
| **Styling** | Tailwind CSS 4 | Utility-first styling |
| **Auth** | Better Auth | Email/password + Google OAuth |
| **Database** | Supabase (PostgreSQL) | Data storage + real-time |
| **Payments** | Polar.sh | Subscription management |
| **Scanning** | Playwright | Headless browser automation |
| **AI** | OpenRouter / Grok | AI-powered recommendations |
| **PDF** | jsPDF + jspdf-autotable | Report generation |
| **Charts** | Recharts | Analytics visualization |

### Key Dependencies
```json
{
  "next": "16.1.1",
  "react": "19.2.3",
  "better-auth": "^1.4.10",
  "@polar-sh/better-auth": "^1.6.3",
  "@supabase/supabase-js": "^2.89.0",
  "playwright": "^1.57.0",
  "jspdf": "^3.0.4"
}
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  /app                                                            │
│  ├── page.tsx           → Landing page                          │
│  ├── dashboard/         → Main app interface                    │
│  ├── login/             → Auth pages                            │
│  ├── pricing/           → Pricing + checkout                    │
│  ├── settings/          → User profile                          │
│  └── api/               → API routes                            │
├─────────────────────────────────────────────────────────────────┤
│  /lib                                                            │
│  ├── auth.ts            → Better Auth config                    │
│  ├── scanner/           → Website audit logic                   │
│  ├── discovery/         → Google Places integration             │
│  ├── subscription.ts    → Usage limits & tracking               │
│  ├── ai-recommendations → AI-powered suggestions                │
│  └── pdf-generator.ts   → PDF report creation                   │
├─────────────────────────────────────────────────────────────────┤
│                     EXTERNAL SERVICES                            │
├──────────────────┬──────────────────┬───────────────────────────┤
│    Supabase      │     Polar.sh     │    Scanner API (Render)   │
│  (Database)      │    (Payments)    │    (Playwright Service)   │
└──────────────────┴──────────────────┴───────────────────────────┘
```

### Directory Structure
```
lead-scout/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── actions.ts          # Server Actions
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Better Auth handlers
│   │   │   ├── v1/             # Public API (Pro/Enterprise)
│   │   │   └── razorpay/       # Payment webhooks
│   │   ├── dashboard/          # Main app
│   │   ├── login/              # Auth pages
│   │   └── pricing/            # Subscription pages
│   ├── components/             # Reusable components
│   ├── lib/                    # Core logic
│   │   ├── auth.ts             # Better Auth config
│   │   ├── scanner/            # Website scanner
│   │   ├── discovery/          # Lead discovery
│   │   ├── subscription.ts     # Usage/limits
│   │   └── ai-recommendations.ts # AI engine
│   └── middleware.ts           # Route protection
├── scanner-api/                # External scanner service
│   ├── index.ts                # Express API
│   ├── lib/scanner.ts          # Playwright scanner
│   └── Dockerfile              # Container config
└── supabase/                   # Database migrations
```

---

## 🔐 Authentication Flow

### Technology: Better Auth + Supabase

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│ Better Auth │────▶│  PostgreSQL │
│  (Browser)  │     │   Server    │     │  (via Pool) │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │  OAuth (Google)   │
       └───────────────────┘
```

### Key Files
- **`src/lib/auth.ts`** - Better Auth configuration with Polar plugin
- **`src/lib/auth-client.ts`** - Client-side auth helpers
- **`src/lib/auth-session.ts`** - Server-side session helper
- **`src/middleware.ts`** - Route protection

### Auth Methods Supported
1. **Email/Password** - Traditional signup/login
2. **Google OAuth** - One-click social login
3. **Session based** - 7-day sessions with auto-refresh

### How It Works
```typescript
// 1. User signs up (src/lib/auth.ts)
const auth = betterAuth({
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: { clientId, clientSecret }
  }
});

// 2. Get current user (src/lib/auth-session.ts)
export async function getCurrentUser() {
  const session = await auth.api.getSession();
  return session?.user || null;
}

// 3. Protect routes (src/middleware.ts)
export async function middleware(request: NextRequest) {
  const session = await betterFetch("/api/auth/get-session");
  if (!session.data && isProtectedRoute) {
    return redirect("/login");
  }
}
```

---

## 💳 Payment Integration

### Technology: Polar.sh (Merchant of Record)

**Why Polar?**
- Handles global taxes automatically
- Simple integration with Better Auth
- Customer portal included
- No Stripe complexity

### Pricing Plans
| Plan | Price | Limits |
|------|-------|--------|
| **Free** | $0/mo | 10 leads, 5 audits, 5 searches |
| **Pro** | $29/mo | 100 leads, 50 audits, 50 searches |
| **Enterprise** | $79/mo | Unlimited + API access + Excel export |

### Key Files
- **`src/lib/auth.ts`** - Polar plugin integration
- **`src/lib/plans.ts`** - Plan definitions & limits
- **`src/lib/subscription.ts`** - Usage tracking & limit checks
- **`src/app/pricing/page.tsx`** - Pricing page UI

### Payment Flow
```
1. User clicks "Subscribe" on pricing page
2. Better Auth's Polar plugin creates checkout
3. User completes payment on Polar
4. Webhook updates subscription in database
5. User gains access to plan features
```

### Code Implementation
```typescript
// 1. Define plans (src/lib/plans.ts)
export const PLANS = {
  free: { leads: 10, audits: 5, searches: 5 },
  pro: { leads: 100, audits: 50, searches: 50 },
  enterprise: { leads: Infinity, audits: Infinity }
};

// 2. Check limits (src/lib/subscription.ts)
export async function checkLimit(action) {
  const subscription = await getSubscription();
  const usage = await getUsage();
  if (usage[action] >= subscription.limits[action]) {
    return { allowed: false, reason: "Limit reached" };
  }
  return { allowed: true };
}

// 3. Polar integration (src/lib/auth.ts)
plugins: [
  polar({
    client: polarClient,
    use: [
      checkout({ products: [...] }),
      portal(),
      webhooks({ secret: POLAR_WEBHOOK_SECRET })
    ]
  })
]
```

---

## 🔍 Website Scanning System

### How Audits Work

The scanner uses **Playwright** (headless browser) to load websites and analyze them across 7 categories:

```
┌─────────────────────────────────────────────────────┐
│                    SCAN PROCESS                      │
├─────────────────────────────────────────────────────┤
│  1. Load URL in headless browser (mobile viewport)  │
│  2. Run parallel checks:                             │
│     • Security (HTTPS?)                              │
│     • Mobile (viewport meta tag?)                    │
│     • Performance (load time)                        │
│     • SEO (pending - future)                         │
│     • Business (analytics pixels?)                   │
│     • Content (copyright year?)                      │
│     • Social (social links?)                         │
│  3. Generate AI recommendations                      │
│  4. Calculate overall score (average)                │
│  5. Return ScanReport object                         │
└─────────────────────────────────────────────────────┘
```

### Key Files
- **`src/lib/scanner/index.ts`** - Main scanner class
- **`src/lib/scanner/types.ts`** - TypeScript interfaces
- **`src/lib/ai-recommendations.ts`** - AI enhancement
- **`scanner-api/`** - Microservice for production

### Check Details

| Check | What It Does | Pass Criteria |
|-------|--------------|---------------|
| **Security** | Checks for HTTPS | URL starts with `https://` |
| **Mobile** | Viewport meta tag | `<meta name="viewport">` exists |
| **Performance** | Measures load time | < 3 seconds |
| **Business** | Analytics detection | GA, GTM, or FB Pixel found |
| **Content** | Copyright freshness | Current year in page text |
| **Social** | Social media links | Links to major social platforms |

### Local vs Production
```
Development:
  └── Uses local Playwright (src/lib/scanner/)

Production (Vercel):
  └── Calls external Scanner API on Render
      └── SCANNER_API_URL env variable
      └── scanner-api/ service with Docker
```

### Scanner Code Example
```typescript
// src/lib/scanner/index.ts
async scan(url: string): Promise<ScanReport> {
  const page = await browser.newPage();
  await page.goto(url);

  // Run checks
  const security = await this.checkSecurity(page, url);
  const mobile = await this.checkMobile(page);
  // ... more checks

  // Generate AI recommendations
  const aiRecs = await generateAIRecommendations(url, checks, score);

  return {
    url,
    overallScore: score,
    checks: { security, mobile, ... }
  };
}
```

---

## 🔎 Lead Discovery

### Technology: Google Places API

Agencies can search for businesses like "Restaurants in Miami" and get a list of local businesses with:
- Business name
- Address
- Phone number
- Website URL
- Google Place ID

### Key Files
- **`src/lib/discovery/service.ts`** - Discovery service
- **`src/lib/discovery/types.ts`** - TypeScript interfaces
- **`src/app/actions.ts`** - `findLeads()` server action

### How It Works
```typescript
// 1. User searches "Dentists in Austin"
const results = await findLeads("Dentists in Austin");

// 2. Service calls Google Places API
const response = await fetch(
  `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}`
);

// 3. Returns array of businesses
[
  { name: "Austin Dental", phone: "512-...", website: "..." },
  { name: "Smile Clinic", phone: "512-...", website: "..." },
]
```

---

## 🤖 AI Recommendations

### Technology: OpenRouter (Claude 3 Haiku) / Grok

Instead of static recommendations, the system generates **personalized, context-aware** suggestions using AI.

### Key Files
- **`src/lib/ai-recommendations.ts`** - AI generator

### How It Works
```
1. Scan completes with all check results
2. Results sent to AI with context:
   - Website URL
   - Each check status/score
   - Overall score
3. AI generates personalized recommendations
4. Falls back to static recommendations if AI fails
```

### AI Prompt Structure
```typescript
// Sends this to AI:
"Analyze this website audit for example.com (Score: 65/100):
- SSL Secure: PASS (100/100)
- Mobile: FAIL (0/100) - Missing viewport
- Performance: WARNING (50/100) - 2.5s load
...

Provide specific, actionable recommendations..."

// AI returns:
{
  "security": "Your SSL is configured. Consider adding HSTS...",
  "mobile": "Critical: Add viewport meta tag immediately...",
  "performance": "Compress images and enable caching to...",
  "priorityFixes": ["Add viewport tag", "Compress images", "Add analytics"]
}
```

---

## 🗄 Database Schema

### Supabase PostgreSQL Tables

```sql
-- Users (managed by Better Auth)
CREATE TABLE "user" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  created_at TIMESTAMP
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES "user"(id),
  plan TEXT DEFAULT 'free',
  polar_subscription_id TEXT,
  current_period_end TIMESTAMP
);

-- Usage Tracking
CREATE TABLE usage (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES "user"(id),
  period TEXT,  -- "2026-01"
  leads_count INT DEFAULT 0,
  audits_count INT DEFAULT 0,
  searches_count INT DEFAULT 0
);

-- Leads (CRM)
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES "user"(id),
  business_name TEXT,
  website_url TEXT,
  phone TEXT,
  address TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  value INT,
  is_favorite BOOLEAN DEFAULT false
);

-- Audit Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  overall_score INT,
  scan_data JSONB
);

-- Analytics Events
CREATE TABLE events (
  id UUID PRIMARY KEY,
  user_id TEXT,
  event TEXT,
  metadata JSONB,
  created_at TIMESTAMP
);
```

---

## 🔌 API Endpoints

### Internal API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/*` | ALL | Better Auth handlers |
| `/api/chat` | POST | AI chatbot |
| `/api/razorpay/*` | POST | Payment webhooks |

### Public API (Pro/Enterprise)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/v1/leads` | GET | List all leads |
| `/api/v1/leads` | POST | Create lead |
| `/api/v1/leads/[id]` | GET | Get lead details |
| `/api/v1/audit` | POST | Run website audit |

### Server Actions
All main operations use Next.js **Server Actions** in `src/app/actions.ts`:
- `runAudit(url)` - Scan a website
- `findLeads(query)` - Search for businesses
- `saveLead(lead)` - Add to CRM
- `getLeads()` - Fetch all leads
- `exportLeadsToExcel()` - Generate XLSX

---

## 🚀 Deployment

### Main Application (Vercel)
```bash
# Deploy to Vercel
vercel --prod

# Environment Variables Required:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
DATABASE_URL=...
BETTER_AUTH_SECRET=...
POLAR_ACCESS_TOKEN=...
OPENROUTER_API_KEY=...
SCANNER_API_URL=https://your-scanner.onrender.com
```

### Scanner API (Render)
```bash
# Deploy scanner-api/ to Render
# Uses Docker for Playwright support

# Dockerfile includes:
- Node.js
- Playwright + Chromium
- Express server on port 3000
```

### Architecture in Production
```
                    ┌─────────────┐
                    │   Vercel    │
                    │  (Next.js)  │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐   ┌──────▼──────┐   ┌────▼─────┐
    │ Supabase  │   │   Render    │   │  Polar   │
    │ (Database)│   │ (Scanner)   │   │(Payments)│
    └───────────┘   └─────────────┘   └──────────┘
```

---

## 📁 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=random-32-char-secret
BETTER_AUTH_URL=https://your-app.com
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Payments
POLAR_ACCESS_TOKEN=polar_oat_xxx
POLAR_PRO_PRODUCT_ID=xxx
POLAR_ENTERPRISE_PRODUCT_ID=xxx
POLAR_WEBHOOK_SECRET=xxx

# External APIs
GOOGLE_PLACES_API_KEY=AIza...
OPENROUTER_API_KEY=sk-or-v1-xxx
GROK_API_KEY=xai-xxx

# Scanner (Production only)
SCANNER_API_URL=https://leadscout.onrender.com
```

---

## 🔄 Data Flow Summary

```
User Journey:
1. Sign Up → Better Auth → PostgreSQL
2. Search Leads → Google Places API → Display Results
3. Save Lead → Supabase → CRM
4. Run Audit → Scanner (Playwright) → AI Recommendations → Report
5. Download PDF → jsPDF → Branded Report
6. Export Excel → xlsx → Full Data + Recommendations
7. Subscribe → Polar → Webhook → Update Limits
```

---

## 📞 Key Contacts & Resources

- **Supabase Dashboard**: https://app.supabase.io
- **Polar Dashboard**: https://polar.sh/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com

---

*Last Updated: January 2026*
