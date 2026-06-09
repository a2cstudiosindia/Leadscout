# Supabase Project Setup — `tarpgdmozonsbuspvjjk`

## 1. MCP Server (Cursor)

MCP config is at `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=tarpgdmozonsbuspvjjk&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"
    }
  }
}
```

**Authenticate MCP:**
1. Open **Cursor Settings → Tools & MCP**
2. Find the **supabase** server and enable it
3. Complete the OAuth login in your browser (pick the org that owns this project)
4. Restart Cursor if tools don't appear

**Verify:** Ask the agent: *"List all tables in the database using MCP tools."*

## 2. Agent Skills

Installed via `npx skills add supabase/agent-skills`:

- `.cursor/skills/supabase` — Supabase development guide
- `.cursor/skills/supabase-postgres-best-practices` — Postgres best practices

## 3. Environment Variables

Update `.env` with keys from the new project:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tarpgdmozonsbuspvjjk.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard → Settings → API → service_role key |
| `DATABASE_URL` | Dashboard → Settings → Database → Connection string (URI) |

See `.env.new-supabase.example` for a template.

> **Important:** `DATABASE_URL` must point to the **new** project for Better Auth to work.

## 4. Apply Database Schema

A consolidated bootstrap migration is at:
`supabase/migrations/000_bootstrap_lead_scout.sql`

**Option A — npm script (recommended):**
```bash
# After updating DATABASE_URL in .env
npm run db:bootstrap
```

**Option B — Supabase MCP:**
Ask the agent to run `apply_migration` with the bootstrap SQL after MCP auth.

**Option C — SQL Editor:**
Paste the contents of `000_bootstrap_lead_scout.sql` into Dashboard → SQL Editor → Run.

### Tables created

| Table | Purpose |
|---|---|
| `user`, `session`, `account`, `verification` | Better Auth |
| `leads`, `reports` | Core CRM |
| `profiles` | Agency branding |
| `subscriptions`, `usage`, `events` | Billing & limits |
| `api_keys` | REST API access |
| `scan_jobs` | Async audit queue |
| `places_cache`, `api_call_logs` | API cost control |
| `agency-logos` bucket | Logo storage |

## 5. CLI Link (optional)

If your Supabase CLI account has access to this project:

```bash
supabase login
supabase link --project-ref tarpgdmozonsbuspvjjk
supabase db push
```

> Current CLI session may not have access (403). Use MCP OAuth or the dashboard instead.

## 6. Verify Connection

```bash
npm run dev
```

1. Sign up / log in (Better Auth → Postgres)
2. Search for leads (Places API)
3. Save a lead (writes to `leads` table)
4. Run an audit (queues to `scan_jobs`)
