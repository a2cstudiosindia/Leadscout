# LeadScout Design System Architecture

Documented per the `interface-design` skill specification.

## 1. Intent & Feel
- **Human**: Digital marketing and web design agency founders, sales operators, and lead-gen consultants.
- **Task**: Discover underperforming local websites, deliver branded technical audits, move prospects through the sales pipeline to Closed Won, track monthly retainers, and monetize out-of-scope referrals in the B2B Exchange.
- **Feel**: Dense, precise, authoritative — Stripe meets Linear. No emojis. Restrained cool indigo brand accent against warm-cool neutral surfaces.

## 2. Token Architecture
- **Canvas / Background**: `var(--canvas)` (`#f8f8fa`)
- **Card Surface**: `var(--surface)` (`#ffffff`)
- **Dark Surface / Sidebar**: `var(--neutral-950)` (`#0c0c1a`) / `var(--neutral-900)` (`#141422`)
- **Borders**: Light mode `rgba(0, 0, 0, 0.08)` / Dark mode `rgba(255, 255, 255, 0.06)`
- **Brand Accent**: Cool Indigo `var(--brand-500)` (`#6366f1`) / `var(--brand-600)` (`#4f46e5`)
- **Semantic Colors**:
  - Success / Won / Active: `#22c55e` / `var(--success-500)`
  - Warning / In-Progress / Needs Attention: `#f59e0b` / `var(--warning-500)`
  - Danger / Closed Lost / Critical Fail: `#f43f5e` / `var(--danger-500)`

## 3. Typography & Hierarchy
- **Base Typeface**: Inter (`next/font/google`), ui-sans-serif, system-ui
- **Type Scale Ratio**: ~1.25
  - `caption 11px` (500/secondary or muted uppercase)
  - `body-sm 13px` (400/regular)
  - `body 14px` (500/regular)
  - `heading-sm 16px` (600/semibold)
  - `heading-md 18px` (700/bold)
  - `heading-lg 22px` (700/bold)
  - `heading-xl 28px` (800/extrabold)
  - `display 36px+` (800/extrabold)
- **Tabular Figures**: All metrics, counters, prices, and stats use `font-variant-numeric: tabular-nums` (`.tabular`).

## 4. Depth & Elevation
- **Depth Strategy**: Subtle layered borders + clean micro-shadows.
  - `--shadow-xs`: `0 0 0 1px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)`
  - `--shadow-sm`: `0 0 0 1px rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)`
- **Concentric Radius Scale**:
  - Controls / Inputs / Badges: `--r-sm` (6px) or `--r-md` (8px)
  - Cards / Containers: `--r-lg` (12px)
  - Modals / Panels: `--r-xl` (16px)

## 5. Key Reusable Components
- **Button Primary (`.btn.btn-primary`)**:
  - Height: 36px (`btn-sm` 28px, `btn-lg` 44px)
  - Padding: 8px 14px
  - Background: `var(--brand-500)`
  - Hover: `var(--brand-600)`
  - Radius: `var(--r-md)` (8px)
  - Typography: 13px / 600 weight
- **Button Secondary (`.btn.btn-secondary`)**:
  - Background: `var(--surface)`
  - Border: 1px solid `var(--border)`
  - Color: `var(--ink-secondary)`
- **Input (`.input`)**:
  - Background: `var(--surface)`
  - Border: 1px solid `var(--border)`
  - Focus Ring: `2px solid var(--brand-500)`
- **Data Table (`.data-table`)**:
  - Headers: 11px / 600 uppercase tracking-wider
  - Row height: 48px
  - Border: 1px solid `var(--border)`
  - Striped / Hover: `hover:bg-[var(--neutral-50)]`

## 6. Agency Growth Engine Lifecycle
Every view in LeadScout reinforces the 5-step client acquisition lifecycle:
1. **Discover Leads**: Google Places API intelligence + fast health heuristics.
2. **Direct Audit**: Deep technical audit of SEO, mobile, SSL, performance.
3. **Pipeline & Deals**: Kanban board tracking Discovered -> Outreached -> Booked -> Won.
4. **Active Clients**: Contracted accounts, monthly retainers ($/mo), deliverables, renewals.
5. **B2B Exchange**: Referral marketplace to exchange overflow leads for 10% commission.
