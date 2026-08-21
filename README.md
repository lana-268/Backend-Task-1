# Eventify

The event booking API you build across this course. This template ships the
project skeleton - strict TypeScript config, ESLint, editor settings - so
Session 1 starts at the interesting part: writing the server.

## Prerequisites

Check these off before Session 1 (they match the course pre-work email):

- [ ] **Node 24 LTS** - check with `node --version` (must print `v24.x`).
      Node 20 is EOL and Node 22 will not run this course's TypeScript setup.
- [ ] **npm 11** - ships with Node 24; check with `npm --version`.
- [ ] **Git** installed and a **GitHub account** you can push to.
- [ ] **VS Code** with the **GitHub Copilot** extension (free tier is fine).
      Students: start GitHub Education verification now - Copilot Pro is free
      for verified students, but approval takes days.

## Setup

```bash
# 1. Create YOUR repo from this template on GitHub ("Use this template"),
#    name it eventify, then clone it:
git clone https://github.com/<your-username>/eventify.git
cd eventify

# 2. Create your local env file (never committed). Prisma's config imports it
#    explicitly; Prisma 7 does not load .env automatically:
cp .env.example .env

# 3. Install dependencies and generate the Prisma client:
npm install
```

Start PostgreSQL and apply the migrations before running the API; the complete
Session 3 command sequence is below.

## Scripts

**`npm run dev`** - runs `node --watch --env-file=.env src/server.ts`.
Node 24 runs TypeScript directly by stripping types and restarts on save - no
nodemon, no tsx, no build step.

**`npm run typecheck`** - runs `tsc --noEmit`.
Node strips types without checking them, so a green `dev` proves nothing -
this is the real gate; run it before every commit.

**`npm run lint`** - runs ESLint (flat config, typescript-eslint) over the
project. Preconfigured from day one; CI starts enforcing it in Session 6.

## Session 3: PostgreSQL bookings

Events and bookings now use Prisma 7 and PostgreSQL. Event listing supports validated pagination and filtering; booking creation uses a Serializable transaction, soft cancellation, and cancelled-row reactivation.

```bash
cp .env.example .env
npm install
docker compose up -d
npx prisma migrate dev
npx prisma db seed
npm run dev
```

The Compose stack also creates a separate `sandbox` database from
[`session-3-sandbox-seed.sql`](session-3-sandbox-seed.sql) the first time the PostgreSQL
volume is initialized. Prisma continues to use only the `eventify` database.
Connect to the practice database and run the read-only exercises with:

```powershell
docker compose exec postgres psql -U eventify -d sandbox
Get-Content -Raw sql/session-3-queries.sql | docker compose exec -T postgres psql -U eventify -d sandbox
```

If the PostgreSQL volume already existed before the sandbox mount was added,
run the initializer once without deleting application data:

```bash
docker compose exec postgres psql -U eventify -d eventify -f /docker-entrypoint-initdb.d/10-sandbox-seed.sql
```

To recreate both databases from an empty volume, use `docker compose down -v`
before `docker compose up -d`. This deletes all local PostgreSQL data,
including the Prisma-managed `eventify` database, so use the one-time command
above when application data must be preserved.

To verify the initial teaching fixtures before running the index demo:

```powershell
Get-Content -Raw sql/verify-sandbox.sql | docker compose exec -T postgres psql -U eventify -d sandbox
Get-Content -Raw sql/session-3-index-demo.sql | docker compose exec -T postgres psql -U eventify -d sandbox
```

The index demo deliberately drops and recreates `bookings_user_id_idx`. The
initial schema has only the ordered unique constraint on `(event_id, user_id)`;
the second plan may use an index scan or an index-based bitmap plan.

### Transaction exercise

Open two terminals with the first connection command above. In terminal 1:

```sql
BEGIN;
UPDATE events SET capacity = capacity + 25 WHERE title = 'TS Conf';
SELECT title, capacity FROM events WHERE title = 'TS Conf';
```

Run the same `SELECT` in terminal 2: it still sees the committed old value.
Run `COMMIT;` in terminal 1, then repeat the terminal 2 query to see the new
value. For rollback practice, record the current capacity, repeat `BEGIN` and
`UPDATE`, then run `ROLLBACK;`; both terminals will retain the recorded value.
The seed value is 100; after the commit demonstration you can restore it with
`UPDATE events SET capacity = 100 WHERE title = 'TS Conf';`.

Run `node scripts/parallel-bookings.ts` in another terminal for the freshly seeded capacity-five event: it should report 5 x 201 and 15 x 409. The script exits unsuccessfully if any response differs from that result. The bookings-by-user proof query is `SELECT * FROM "Booking" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 20`, supported by `Booking_userId_createdAt_idx`; the measured before/after plans are recorded in the Session 3 PR description.

**Your booking service checked capacity before every insert and the event still oversold: why did the check fail, and what property of the fix makes overselling impossible?** The separate concurrent checks let requests observe the same remaining capacity, while a Serializable transaction makes the check and write atomic and serializable so they cannot all commit an oversell.

## Homework is submitted as a Pull Request

Every session's homework lands as **one PR** to your own `eventify` repo:

1. Branch from `main` (e.g. `session-1`), commit in logical steps.
2. Open a PR whose description covers: what you built, how to run it, and
   which parts were AI-assisted plus how you verified them. A classmate
   should be able to run your server from the description alone.
3. Merge only when `npm run typecheck` and `npm run lint` pass.

**The ownership rule:** AI writes with you, but you own every line you ship.
At the start of each session one function from someone's PR is picked at
random and its author walks the class through it, line by line. Any function
in your PR can be that function.

## Session 4: Authentication and authorization

Event discovery (`GET /v1/events` and `GET /v1/events/:id`) remains public.
Mutations, bookings, and venue routes use short-lived HS256 bearer access
tokens, role checks, and resource ownership checks. Login returns the access
token in JSON and sets a seven-day opaque refresh token in a Secure,
HttpOnly, SameSite=Strict cookie scoped to `/v1/auth/refresh`; the database
stores only its SHA-256 hash and every refresh rotates it atomically.

The seeded Session 4 accounts share the local-only password `Eventify123!`.
See [`docs/session-4-pr-description.md`](docs/session-4-pr-description.md) for
the route-policy rationale, OWASP audit triage, compatibility note, and
verification checklist.
