# GroundsNearMe — setup runbook

Everything needed to take this repository from a clean checkout to a working API,
in the order the steps actually depend on each other. Roughly 45 minutes the first
time, most of it waiting for Supabase and DNS.

Nothing here was run against a live project from this machine — see
[Verification](#verification) for what to check at each step and
[What has not been executed](#what-has-not-been-executed) for an honest list.

## Prerequisites

| Tool | Why | Check |
| --- | --- | --- |
| Node 20+ | `node --test` runs the Worker's unit tests | `node --version` |
| npm | installs `wrangler` | `npm --version` |
| A Cloudflare account | Workers, R2, Pages | — |
| A Supabase account | Postgres + auth | — |

The Supabase CLI is optional — every migration in this repo can be pasted into the
SQL editor instead, and on Windows that is usually the faster path. `psql` is only
needed if you prefer the command line.

## 1 · Supabase project

Create a project in the region closest to Karachi (`ap-south-1`, Mumbai, is the
current nearest). Free tier is correct for launch; revisit only when ground count
and traffic actually grow.

From **Project Settings → API**, copy:

- **Project URL** → `SUPABASE_URL`
- **anon public** key → `SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (secret — never in a repo,
  never in a browser)
- **JWT Secret** → `SUPABASE_JWT_SECRET`, *only* if the project still signs with
  HS256. New projects use asymmetric keys and are verified through JWKS instead;
  leave it blank in that case.

Under **Authentication → Providers**, enable Email. Turn on phone/OTP only if the
launch actually needs it — the schema does not care either way, `profiles.phone` is
just a column.

## 2 · Apply the migrations

The 24 files in `supabase/migrations/` are applied in filename order, and they are
idempotent wherever that is cheap (`create table if not exists`,
`create or replace function`), so re-running the whole folder against an existing
project is safe.

```bash
supabase link --project-ref YOUR_PROJECT_REF && supabase db push
```

Without the CLI: open the SQL editor and run each file in order, top to bottom.
Do not skip ahead — `…0005_bookings` needs the enums from `…0001`, and every RLS
file needs the tables it protects.

Two things to expect in the output:

- `…0001` installs `pgcrypto`, `btree_gist` and `citext` into the `extensions`
  schema. If your project has them elsewhere, the `set search_path` line at the top
  of `…0005` is the one to adjust — the default GiST opclass for `uuid` is only
  visible while `extensions` is on the path, and the exclusion constraint needs it.
- `…0024_bootstrap_staff` raises `bootstrap: no auth user for … — sign up first,
  then re-run.` That is expected on a fresh project. Step 4 comes back to it.

## 3 · Seed (development only)

`supabase/seed.sql` inserts the same grounds, prices and WhatsApp numbers the
frontend's mock data uses, so a locally-running site looks like the mock-up. Run it
on development and staging; do **not** run it on production.

```bash
supabase db reset   # drops, re-runs migrations, then seed.sql
```

`tools/check-consistency.sh` check 8 asserts the seed still mirrors `index.html`. If
the frontend devs change a mock price, that check fails and the seed needs the same
edit — which is the point.

## 4 · Promote the first superadmin

Every staff-granting path is itself staff-gated, so the first one has to be done by
hand. This is the only manual database step in the whole setup.

1. Sign up through the normal auth flow with the address that will own the finance
   dashboard.
2. Edit `v_superadmin_email` in
   `supabase/migrations/20260829120024_bootstrap_staff.sql`.
3. Run that one file again.

It prints `bootstrap: … promoted to superadmin (uuid)` on success and is safe to
re-run.

Promoting a teammate later is a one-liner (the file carries it as a comment):

```sql
update public.profiles set role = 'admin'
 where id = (select id from auth.users where email = 'teammate@example.com');
```

`admin` is deliberately **not** enough to read `commission_ledger` or call
`finance_overview()`. Only `superadmin` is. That is the whole point of having two
staff roles.

## 5 · R2 bucket

```bash
npx wrangler r2 bucket create groundsnearme-images
```

Then give it a public custom domain — `images.groundsnearme.pk` in
`wrangler.toml` — via **R2 → your bucket → Settings → Public access → Custom
domain**. Reads come straight from that hostname through Cloudflare's cache; writes
only ever happen through the Worker, gated to staff.

Set `R2_PUBLIC_BASE_URL` to that origin. A trailing slash is harmless — `publicUrl()`
strips it. It is a plain var, not a secret, and it is read at request time: the
database stores bare object keys, so moving the CDN host later is a config change
and not a data migration. See [R2-IMAGES.md](R2-IMAGES.md) for the key layout and
the upload flow.

## 6 · Worker configuration

Edit the `[vars]` block in `workers/api/wrangler.toml`:

| Var | Notes |
| --- | --- |
| `SUPABASE_URL` | from step 1 |
| `SUPABASE_ANON_KEY` | from step 1; safe to ship, it is RLS-bound |
| `R2_PUBLIC_BASE_URL` | from step 5 |
| `ALLOWED_ORIGINS` | comma-separated exact origins. Never `*` |
| `WHATSAPP_INTAKE_NUMBER` | digits only, country code first, no `+` |
| `API_VERSION` | leave as `v1` |

Then the two secrets, which never go in the file:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

`SUPABASE_JWT_SECRET` only if step 1 said HS256.

For local development, copy `workers/api/.dev.vars.example` to `.dev.vars` and fill
in the same two. `.dev.vars` must stay out of version control.

`ALLOWED_ORIGINS` is the one that bites: a browser calling from an origin not on
the list gets no CORS headers back and the fetch fails with a message that does not
mention the allowlist at all. The staging block already lists the usual local dev
ports.

## 7 · Rate limiting (optional)

The `RATE_LIMIT` KV namespace is commented out in `wrangler.toml`, so a fresh
checkout runs with rate limiting as a no-op and nothing breaks. To enable it:

```bash
npx wrangler kv namespace create RATE_LIMIT
```

Paste the returned id into the commented `[[kv_namespaces]]` block and uncomment it.
Every guarded route starts enforcing without a code change.

Worth knowing before deciding: the double-booking guarantee does **not** depend on
this. It is the Postgres exclusion constraint. KV only limits write abuse, and
`create_open_game()` keeps its own 5-per-day check in SQL as a backstop.

## 8 · Deploy

```bash
cd workers/api && npm install && npm test && npx wrangler deploy
```

`npm test` is `node --test test/` — five files covering CORS, the error envelope,
route matching, the shape layer and the validators. They are pure unit tests: no
network, no database, so they pass or fail on logic alone.

Staging is a separate Worker, Supabase project and bucket:

```bash
npx wrangler deploy --env staging
```

The `[triggers]` cron (`*/10 * * * *`) activates on deploy. It calls
`expire_stale_bookings()`, `expire_past_open_games()` and
`complete_finished_bookings()` with the service-role key, each independently so one
failure cannot stop the others. That third one is what accrues commission, so if
the finance dashboard is flat, check the cron before checking the ledger.

## 9 · Point the frontend at it

`js/api.js` on the public site switches from mock data to this API. The endpoint
shapes were built to match the mock objects field for field —
[API-CONTRACT.md](API-CONTRACT.md) has the mapping table and a minimal client. Add
the Pages domain to `ALLOWED_ORIGINS` and redeploy the Worker.

## Verification

Each step has a cheap check. Run them in order; a failure here is much easier to
diagnose than the same failure surfacing three steps later.

```bash
curl -s https://groundsnearme-api.YOUR-SUBDOMAIN.workers.dev/v1/health
```

Expect `{"ok":true,...}`. This is the only endpoint that needs neither auth nor a
database round trip, so it isolates "is the Worker up" from "is Supabase reachable".
It also reports `supabase_configured` and `images_configured` — two booleans that
answer "did step 6 actually take effect" without exposing a single key value.

```bash
curl -s "https://YOUR-WORKER/v1/grounds?limit=2" | head -c 400
```

A populated `items` array proves the anon key, RLS and `search_grounds()` all work
together. An empty array with `total: 0` after seeding usually means the grounds are
not `status = 'active'` — the public read filters on it.

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://YOUR-WORKER/v1/bookings
```

Expect `401`. If it is `500`, the JWT configuration in step 1 is wrong.

For the private dashboard, sign in as the superadmin, then:

```bash
curl -s -H "Authorization: Bearer YOUR_ACCESS_TOKEN" https://YOUR-WORKER/v1/finance/overview
```

An `admin` token must get `403` here. If it does not, stop and re-check step 4 —
that boundary is the whole reason there are two staff roles.

In SQL, the double-booking guarantee is worth confirming once by hand:

```sql
select conname from pg_constraint where conname = 'bookings_no_overlap';
```

One row. If it is missing, `btree_gist` was not visible when `…0005` ran; fix the
search path and re-run that file.

## Common failures

| Symptom | Cause |
| --- | --- |
| CORS error in the browser, no response body | origin missing from `ALLOWED_ORIGINS` |
| `401 AUTH_REQUIRED` with a token that looks fine | expired, or HS256 secret not set on an HS256 project |
| `403 FORBIDDEN` for a real staff member | `profiles.is_active` is false, or the role was never promoted |
| `404 GROUND_NOT_FOUND` for a ground you can see in the table | its `status` is not `active` |
| `409 SLOT_TAKEN` on an obviously free slot | a `pending` hold that has not lapsed yet; it clears itself |
| Finance dashboard all zeros | nothing is `completed` yet — the cron does that, and `commission_rate` is 0 by default |
| Images 404 from the CDN | custom domain not attached to the bucket, or `R2_PUBLIC_BASE_URL` points at a different bucket than the `IMAGES` binding |
| `operator class "gist" does not exist for type uuid` | `extensions` not on the search path when `…0005` ran |

## What has not been executed

Stated plainly because it affects how much trust to put in the above: no part of
this stack has been run. This machine has no `node`, `npm`, `psql`, `docker`,
`wrangler` or `supabase` binary, and its `python3` is a Windows Store stub, so:

- the 24 migrations have **not** been applied to any Postgres instance
- `npm test` has **not** been run
- the Worker has **not** been started with `wrangler dev` or deployed
- no image has been through the R2 upload path

What *has* been verified is static: `tools/check-consistency.sh` passes 9/9, which
cross-checks env var usage, table names referenced by the Worker against the
migrations, `$$` balance in every SQL file, service-role key containment, relative
import resolution, router-to-handler wiring, `docs/API-CONTRACT.md` against the
route table, and the seed against the frontend's mock data. Every factual claim in
the docs was read out of the SQL or the Worker source rather than recalled.

Runtime verification needs Node 20+ and a Supabase project. In priority order once
those exist: `npm test`, then apply the migrations, then the `/v1/health` and
`/v1/grounds` curls above, then two concurrent `POST /v1/bookings` for the same slot
to see one `201` and one `409 SLOT_TAKEN`, then an `admin` token against
`/v1/finance/overview` expecting `403`.
