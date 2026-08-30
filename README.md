# GroundsNearMe

Find and book a cricket ground in Karachi. This repository holds the **backend and
the owner/admin surfaces**: the Supabase schema, the Cloudflare Worker API, the R2
image pipeline, and the dashboards that sit behind the public site.

The player-facing site is built separately in vanilla HTML/CSS/JS by two other
developers. `index.html` here is their homepage, kept in the repo as the reference
for design tokens and the mock-data shapes the API has to match.

```
docs/                    the documentation below
index.html               public homepage (reference; not built here)
supabase/migrations/     24 migrations — Postgres is the source of truth
supabase/seed.sql        dev data mirroring the frontend's mock objects
workers/api/             the Cloudflare Worker: 45 routes in front of Supabase + R2
tools/check-consistency.sh  static cross-artefact checks (10/10 passing)
```

## Documentation

| Document | Read it when |
| --- | --- |
| [docs/SETUP-RUNBOOK.md](docs/SETUP-RUNBOOK.md) | taking this from a clean checkout to a working API |
| [docs/API-CONTRACT.md](docs/API-CONTRACT.md) | wiring the frontend's `js/api.js`, or adding a route |
| [docs/DATA-MODEL.md](docs/DATA-MODEL.md) | changing the schema, or asking "where is that enforced" |
| [docs/R2-IMAGES.md](docs/R2-IMAGES.md) | touching image upload, ordering or the CDN host |
| [docs/DESIGN-TOKENS.md](docs/DESIGN-TOKENS.md) | building a dashboard screen |
| [docs/ROADMAP.md](docs/ROADMAP.md) | asking what is done and what is next |

## Architecture

```
browser ──> Cloudflare Worker (/v1/*) ──> Supabase Postgres (RLS)
                    │
                    └────────────────────> R2 bucket (image bytes)
images.groundsnearme.pk ──> R2 (public read, cached)
```

Three decisions explain most of the code:

**Postgres is the authority, not the Worker.** A browser's request is executed
against Supabase with the caller's *own* access token, so RLS decides what they can
read and write. The role checks in the route handlers exist to fail fast with a
readable message — never as the only gate. The service-role key is used in exactly
one place: the scheduled housekeeping job.

**Double-booking is prevented by a database constraint.** A GiST exclusion
constraint on `(ground_id, slot)` for live bookings. Two players tapping the same
slot in the same millisecond get one `201` and one `409 SLOT_TAKEN`. No locks, no
polling, no read-then-write race — which is also why the availability grid can be
edge-cached for 20 seconds without risk.

**Images go to R2, not Supabase Storage,** and the database stores the object *key*,
not the URL. The site is already on Cloudflare, so same-platform delivery is one
fewer vendor in the request path, and Supabase's free-tier storage quota stays
reserved for structured data. Composing the URL at read time means changing CDN host
is an environment variable, not a data migration.

## Quick start

```bash
cd workers/api && npm install && npm test
```

62 unit tests over the router, CORS, the error envelope, validation, the R2 key
helpers and the Supabase client. Then follow
[docs/SETUP-RUNBOOK.md](docs/SETUP-RUNBOOK.md) — Supabase project, migrations,
superadmin bootstrap, R2 bucket, Worker vars and secrets, deploy.

```bash
bash tools/check-consistency.sh
```

Runs 10 static checks with no dependencies: env var usage, table names the Worker
references against the migrations, `$$` balance in every SQL file, service-role key
containment, that no local secrets file is tracked by git, relative import resolution,
router-to-handler wiring, `docs/API-CONTRACT.md` against the actual route table, and
the seed against the frontend's mock data. Run it before any commit; documentation
drift fails the build.

## Roles

| Role | Sees |
| --- | --- |
| `player` | own bookings, own matchmaking posts |
| `owner` | own grounds, their bookings, their subscription cycles (read-only) |
| `admin` | all grounds and bookings, leads, subscription management |
| `superadmin` | everything, **plus** the commission ledger and finance dashboard |

`admin` is deliberately not enough to read `commission_ledger` or call
`finance_overview()`. The private P&L has one RLS policy — superadmin — so it is
invisible to other staff by construction rather than by a hidden route.

## Status

Steps 1–3 of the build order are written; the dashboards (5–7) are not started. See
[docs/ROADMAP.md](docs/ROADMAP.md).

**What has been run.** `npm test` passes 62/62 and
`tools/check-consistency.sh` passes 10/10. The Worker bundles
(`wrangler deploy --dry-run`, 87 KiB) and serves locally under `wrangler dev`, where
the following were exercised against a real running instance: `/v1/health`, the CORS
allowlist (allowed origin echoed, lookalike origin gets no headers, preflight 204 vs
403), 404/405 handling, `401` on every protected route without a token, the
`/v1/finance/overview` role gate (`player`/`owner`/`admin` → `403`, `superadmin`
through), a forged token → `401`, request-body validation → `400`, and the image
upload guards → `415`/`413`.

**What has not been run.** No Postgres — there is no `psql`, Docker or Supabase CLI
here — so the 24 migrations have not been applied, and everything that depends on the
database is unverified: the exclusion constraint, the RLS policies, the guard
triggers, and every RPC. Local requests that reach Supabase return `502` by design
because `SUPABASE_URL` is still a placeholder.
[SETUP-RUNBOOK.md](docs/SETUP-RUNBOOK.md#what-has-and-has-not-been-executed) lists what
remains, in priority order.
