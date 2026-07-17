# ContextSOP — Full-Stack Refinement Plan

> **Purpose**: Deep technical audit of every layer of the ContextSOP application. This document maps each broken, incomplete, or disconnected area to a precise, actionable fix phase.

---

## Executive Summary of Issues Found

After a complete read-through of every key file in the stack, the following **critical failures** exist today:

| # | Area | Severity | Problem |
|---|------|----------|---------|
| 1 | **GenerateButton** | 🔴 Critical | Clicking "Generate SOP" runs a fake simulation — it **never calls the Flask backend**. It simply sleeps and prints to console. |
| 2 | **Dashboard Home** | 🔴 Critical | `/dashboard` renders a blank `<div>` with "Dashboard Home" text — no data, no SOPs, no navigation entry point. |
| 3 | **org_id in JWT** | 🔴 Critical | The backend `require_auth` reads `org_id` from `app_metadata` or `user_metadata`. Supabase's custom access token hook stores it as a custom JWT claim, which requires a **Supabase hook registered in the dashboard**. If this hook is not activated, every backend call returns `403 Forbidden`. |
| 4 | **Settings Page** | 🟡 High | Displays theme controls but has no real data — organization name, user role, and API settings are UI skeletons with no Supabase reads or writes. |
| 5 | **Auto-login on return** | 🟡 High | The middleware (`updateSession`) correctly redirects authenticated users from `/login` to `/dashboard` — this is expected behavior. But the dashboard has nothing to show, making it feel broken. |
| 6 | **Authentication RLS** | 🟡 High | All Supabase RLS policies check `auth.jwt() ->> 'org_id'`. This only works if the custom JWT hook is registered in Supabase Auth settings. Without it, all database queries return empty results (`[]`). |
| 7 | **SOP Generation result** | 🟡 High | Even if `generate` is called, after the job completes the frontend receives no redirect or notification — there is no poll/redirect loop. |
| 8 | **Runbook page wiring** | 🟡 High | `/dashboard/run/[sop_id]` fetches the SOP from **Supabase directly** via `db.ts`, but the generation saves it via **Flask → Supabase REST** — these must be consistent. |
| 9 | **Export: Auth header missing** | 🟡 High | `ExportDropdown` calls the `/api/v1/export/*` routes without attaching the Supabase bearer token. The Flask `require_auth` will reject every export request with `401`. |
| 10 | **Dashboard SOP list** | 🟠 Medium | There is no page that lists all existing SOPs for the logged-in organization. |
| 11 | **Settings page org data** | 🟠 Medium | Organization name and user role are never actually loaded from Supabase in the settings page. |
| 12 | **Polling after generation** | 🟠 Medium | No frontend code polls `GET /api/v1/sop/jobs/:id` to know when generation is complete. |
| 13 | **CORS in production** | 🟠 Medium | Flask CORS defaults to `http://localhost:3000`. Must be updated for any production deployment. |
| 14 | **Environment variables** | 🟠 Medium | Neither `backend/.env` nor `frontend/.env.local` are verified — both files may not exist, causing silent failures. |

---

## Phase R-1: Environment & Infrastructure Verification

**Goal**: Ensure all services can talk to each other and all credentials are valid.

### R-1.1 — Frontend Environment File

Create/verify `frontend/.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Verify**: Open `http://localhost:3000/signup` — no console errors about undefined env vars.

### R-1.2 — Backend Environment File

Create/verify `backend/.env` with:
```
FLASK_ENV=development
FLASK_SECRET_KEY=some-long-random-secret-string
FRONTEND_ORIGIN=http://localhost:3000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-...
```

**Verify**: `flask run --port=8080` starts without errors.

### R-1.3 — Supabase Database Migrations

Apply all three SQL files to your Supabase project via SQL Editor:

1. `supabase/migrations/20260715_initial_schema.sql`
2. `supabase/migrations/20260716_phase6_schema.sql`
3. `supabase/migrations/20260717_phase12_updates.sql`

**Verify**: Tables exist: `organizations`, `profiles`, `projects`, `sops`, `sop_versions`, `sop_executions`

### R-1.4 — Register the Custom JWT Access Token Hook (CRITICAL)

**This is the single most important setup step.** Without it, every backend API call returns 403 and all database reads return empty arrays.

1. Supabase Dashboard → **Authentication → Hooks**
2. Enable **"Customize access token (JWT) claims"** hook
3. Set function: `public.custom_access_token_hook`
4. Save

**Why**: The backend `require_auth` reads `org_id` from the JWT. The hook injects it. Without the hook, `org_id` is never set, and all RLS policies fail.

---

## Phase R-2: Authentication Flow

**Goal**: Signup creates a working organization + profile; login routes to a populated dashboard.

### R-2.1 — Signup Already Correct

`signup/page.tsx` passes `org_name` and `role` in metadata. The DB trigger `handle_new_user` creates the org and profile automatically. **This is already wired correctly** — no code change needed.

### R-2.2 — Email Confirmation Setting

For development: **Supabase → Auth → Email → Confirm email → Disable**. This allows instant login.

### R-2.3 — Auto-Redirect on Return Visit is Correct Behavior

The middleware correctly redirects authenticated users away from `/login`. This is NOT a bug. The user feels it is broken because `/dashboard` is empty. Fix is in Phase R-3.

---

## Phase R-3: Dashboard Home — Replace the Blank Page

**Goal**: Replace the blank "Dashboard Home" page with a real entry point.

### R-3.1 — Current State (BUG)

`/dashboard/page.tsx` renders:
```tsx
<div>
  <h1>Dashboard Home</h1>
  <p>Welcome to your ContextSOP workspace.</p>
</div>
```

No data, no SOPs, no meaningful content.

### R-3.2 — Fix: Redirect to SOPs List

Simplest approach — make `/dashboard` immediately redirect to the SOPs list:
```tsx
import { redirect } from "next/navigation";
export default function DashboardHome() {
  redirect("/dashboard/sops");
}
```

Then build `/dashboard/sops` as the real home (see Phase R-8).

---

## Phase R-4: The Core Pipeline — Fix GenerateButton

**Goal**: The "Generate SOP" button must actually call the Flask backend.

### R-4.1 — Current State (BUG)

`GenerateButton.tsx` `handleGenerate` function:
- Runs fake `setTimeout` delays
- Calls `uploadTranscript()` which returns `"mock-transcript-id-12345"`
- Logs `"[Phase 7 Payload Ready]"` to console
- **Never sends any HTTP request to Flask**

The TODOs in the file even label this as "Phase 7 Backend Integration" placeholder code that was never replaced.

### R-4.2 — The Correct Flow

```
User clicks "Generate SOP"
  → Get Supabase session token (supabase.auth.getSession())
  → POST /api/v1/sop/generate  { Authorization: Bearer <token>, body: { transcript } }
  → Flask: validates JWT → spawns background thread → calls OpenAI
  → Flask: returns { job_id, polling_url }
  → Frontend: polls GET /api/v1/sop/jobs/<job_id> every 2 seconds
  → When status="completed": redirect to /dashboard/run/<sop_id>
  → When status="failed": show error message in UI
```

### R-4.3 — Required Changes in GenerateButton.tsx

Replace the entire `handleGenerate` function body with real API calls.
Add imports: `useRouter` from `next/navigation`, `createClient` from `@/utils/supabase/client`.

Add a `router` variable inside the component: `const router = useRouter();`

The key fetch calls:
```typescript
// Step 1: Get auth token
const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
if (!token) throw new Error("Session expired. Please log in again.");

// Step 2: Start generation job
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/sop/generate`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  body: JSON.stringify({ transcript: transcript.trim() }),
});
if (!res.ok) {
  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.message || "Generation request failed.");
}
const { job_id } = await res.json();

// Step 3: Poll for completion
let sop_id: string | null = null;
let attempts = 0;
while (!sop_id && attempts < 90) {  // max 3 minutes
  await new Promise((r) => setTimeout(r, 2000));
  attempts++;
  const pollRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/sop/jobs/${job_id}`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const job = await pollRes.json();
  if (job.status === "completed") sop_id = job.sop_id;
  else if (job.status === "failed") throw new Error(job.error || "AI generation failed.");
}
if (!sop_id) throw new Error("Generation timed out. Please try again.");

// Step 4: Navigate to generated SOP
router.push(`/dashboard/run/${sop_id}`);
```

---

## Phase R-5: Fix Export Auth Headers

**Goal**: Every export request must carry the Supabase bearer token.

### R-5.1 — Where the Bug Lives

Look for the export fetch calls in `frontend/src/components/`. Each `fetch("/api/v1/export/...")` call is missing the auth header.

### R-5.2 — Fix Pattern

Before each export fetch:
```typescript
const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/export/markdown`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  body: JSON.stringify({ dsl_payload: sop.dsl_payload }),
});
```

---

## Phase R-6: Settings Page — Wire Real Data

**Goal**: The settings page must show and allow editing of real organization/profile data.

### R-6.1 — Use Auth Context

The `useAuth()` hook provides `{ user, profile, organization }`. These are fetched from Supabase on login and kept in context. Use them directly:

```tsx
import { useAuth } from "@/components/auth-provider";

const { user, profile, organization } = useAuth();

// Show:
// organization?.name
// user?.email
// profile?.role
// organization?.created_at
```

### R-6.2 — Organization Name Editing

Add a controlled input + save button. On save:
```typescript
await supabase.from("organizations").update({ name: newName }).eq("id", profile.organization_id);
```

Requires the update RLS policy from Phase R-7.

---

## Phase R-7: Fix RLS — Missing Update Policies

**Goal**: Add missing Row-Level Security policies for settings edits.

### R-7.1 — Current Gaps

The schema only has SELECT policies on `organizations` and `profiles`. The following policies are missing:

### R-7.2 — New Migration

Create: `supabase/migrations/20260718_missing_rls_policies.sql`

```sql
-- Allow organization owners to update their org name
create policy "owners can update their organization"
  on public.organizations for update to authenticated
  using (id::text = coalesce(auth.jwt() ->> 'org_id', ''))
  with check (id::text = coalesce(auth.jwt() ->> 'org_id', ''));

-- Allow users to update their own profile
create policy "users can update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
```

Apply this via Supabase SQL Editor.

---

## Phase R-8: Build the /dashboard/sops List Page

**Goal**: Build the central SOP browsing page that is the real "home" of the dashboard.

### R-8.1 — Route: /dashboard/sops

Create `frontend/src/app/dashboard/sops/page.tsx`

The page must:
1. Pull `profile.organization_id` from `useAuth()`
2. Call `listSops(profile.organization_id)` from `db.ts`
3. Render a grid/list of SOP cards:
   - Title, description, target environment badge
   - Step count from `sop.dsl_payload.steps.length`
   - Last updated timestamp
   - "Run" button → `router.push('/dashboard/run/' + sop.id)`
4. Empty state: "No SOPs yet" → button to `/dashboard/generator`
5. Search bar to filter by title

### R-8.2 — Add Navigation Entry

Update the Sidebar component to include a nav link to `/dashboard/sops` ("My SOPs").

---

## Phase R-9: Backend Resilience

**Goal**: Make generation errors visible and the memory store manageable.

### R-9.1 — Surface Job Errors in UI

After polling, if `job.status === "failed"`, show `job.error` as a red banner in the generator page — not just a console.error.

### R-9.2 — Clean Up Job Memory

In `sop.py`, add a cleanup that removes jobs older than 1 hour to prevent memory leaks:

```python
def cleanup_old_jobs():
    import time
    cutoff = time.time() - 3600
    with jobs_lock:
        old = [k for k, v in jobs.items() if v.get("created_at", time.time()) < cutoff]
        for k in old:
            del jobs[k]
```

Call this at the start of each new `generate` request.

---

## Phase R-10: End-to-End Flow Verification Checklist

Once all phases above are implemented, verify each flow manually:

### 10.1 — First-Time User
```
Visit / → Click "Get Started" → Fill signup form → Submit
→ Redirected to /dashboard/sops
→ Empty state shown with "Create your first SOP" CTA
```

### 10.2 — Returning User
```
Visit / → Browser has active session cookie
→ Redirected to /dashboard/sops (NOT asked to login again)
→ SOPs list shown for their organization
```

### 10.3 — SOP Generation
```
Click "New SOP" → /dashboard/generator
→ Paste incident logs
→ Click "Generate Standard Operating Procedure"
→ Loading shows real steps (auth → sending → processing → complete)
→ After OpenAI responds (~15–90s), redirect to /dashboard/run/<id>
→ See interactive runbook with all AI-extracted steps
```

### 10.4 — Runbook Execution
```
On /dashboard/run/<sop_id>
→ See variables panel (NAMESPACE, TARGET_HOST, etc.)
→ Fill in values and click start
→ Complete steps one by one
→ Progress auto-saved to sop_executions
→ Completion screen when all steps done
```

### 10.5 — Export
```
On runbook page → click Export dropdown
→ Select Markdown / HTML / PDF / JSON
→ File downloads without error (no 401)
```

### 10.6 — History
```
/dashboard/history → see past executions
→ "Inspect log" → see step progress details
→ "Versions" tab → compare diffs
```

---

## Phase R-11: Quick Diagnostic Commands

Run these to validate your environment before attempting the full flow:

```bash
# Verify backend is running and healthy
curl http://localhost:8080/api/v1/health

# Verify frontend is running
curl http://localhost:3000

# Verify backend can authenticate (replace TOKEN)
curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/v1/auth/me

# Check Supabase org_id is in JWT (look for org_id in payload)
# Decode your token at jwt.io
```

---

## Prioritized Implementation Order

| Priority | Phase | Task | Est. Effort |
|----------|-------|------|-------------|
| P0 🔴 | R-1.4 | Register Supabase JWT Hook | 5 min |
| P0 🔴 | R-1.1-1.2 | Verify .env files both services | 10 min |
| P0 🔴 | R-1.3 | Run all SQL migrations | 10 min |
| P1 🟡 | R-4 | Fix GenerateButton real API calls + polling | 2 hours |
| P1 🟡 | R-8 | Build /dashboard/sops list page | 2 hours |
| P1 🟡 | R-3 | Fix Dashboard Home → redirect | 5 min |
| P1 🟡 | R-5 | Fix Export auth headers | 30 min |
| P2 🟠 | R-7 | Add missing RLS policies migration | 30 min |
| P2 🟠 | R-6 | Wire Settings with real org/profile data | 1 hour |
| P3 🟢 | R-9 | Backend error surfacing + job cleanup | 1 hour |
| P3 🟢 | R-2 | Auth flow polish (email confirm UX) | 30 min |
