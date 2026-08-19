# Session 3: Bookings That Survive a Restart

## What was built

- Replaced the in-memory event and booking stores with PostgreSQL repositories using Prisma 7 and `@prisma/adapter-pg`.
- Preserved the route/controller/service layering while adding event CRUD, validated pagination, exact venue filtering, and inclusive date filtering.
- Added Serializable booking transactions with confirmed-only capacity checks, cancelled-row reactivation, duplicate conflict handling, P2002-to-409 mapping, and bounded P2034 retries.
- Added booking retrieval and soft cancellation without deleting booking rows.
- Added an idempotent seed with 23 users, all required roles, five events, three sample bookings, and a capacity-five concurrency fixture.
- Enabled Prisma query logging and added an ordered `(userId, createdAt DESC)` index for newest-first bookings-by-user queries.
- Added a separate `sandbox` database on the same PostgreSQL service, with 2,000 users, 220 events, 10,500 bookings, intentional zero-booking and oversold cases, SQL exercises, and the required `(event_id, user_id)` index-order demonstration.

## How to run from a fresh clone

```bash
cp .env.example .env
npm install
docker compose up -d
npx prisma migrate dev
npx prisma db seed
npm run dev
```

The sandbox initializer is mounted into `/docker-entrypoint-initdb.d/` and
runs only when the PostgreSQL volume is first created. On an existing volume,
initialize it without removing the `eventify` data:

```bash
docker compose exec postgres psql -U eventify -d eventify -f /docker-entrypoint-initdb.d/10-sandbox-seed.sql
```

In another terminal, run:

```bash
node scripts/parallel-bookings.ts
```

The verified parallel result was:

```text
5 x 201
15 x 409
```

The database verification query returned five confirmed rows and no additional statuses:

```text
status     | count
-----------+------
CONFIRMED  | 5
```

## Bookings-by-user query

```sql
SELECT *
FROM "Booking"
WHERE "userId" = 'proof-user-1000'
ORDER BY "createdAt" DESC
LIMIT 20;
```

### Before the index

```text
Limit  (cost=341.23..341.28 rows=20 width=62) (actual time=3.628..3.740 rows=20 loops=1)
  Buffers: shared hit=11 read=93 written=93
  ->  Sort  (cost=341.23..341.48 rows=100 width=62) (actual time=3.625..3.705 rows=20 loops=1)
        Sort Key: "createdAt" DESC
        Sort Method: top-N heapsort  Memory: 20kB
        Buffers: shared hit=11 read=93 written=93
        ->  Bitmap Heap Scan on "Booking"  (cost=5.20..338.57 rows=100 width=62) (actual time=0.291..3.451 rows=100 loops=1)
              Recheck Cond: ("userId" = 'proof-user-1000'::text)
              Heap Blocks: exact=100
              Buffers: shared hit=11 read=93 written=93
              ->  Bitmap Index Scan on "Booking_userId_eventId_key"  (cost=0.00..5.17 rows=100 width=0) (actual time=0.200..0.201 rows=100 loops=1)
                    Index Cond: ("userId" = 'proof-user-1000'::text)
                    Buffers: shared read=4 written=4
Planning:
  Buffers: shared hit=28 read=5 written=5
Planning Time: 4.233 ms
Execution Time: 3.797 ms
```

### After the index

```text
Limit  (cost=0.42..79.97 rows=20 width=62) (actual time=0.231..0.801 rows=20 loops=1)
  Buffers: shared read=23 written=23
  ->  Index Scan using "Booking_userId_createdAt_idx" on "Booking"  (cost=0.42..398.16 rows=100 width=62) (actual time=0.180..0.691 rows=20 loops=1)
        Index Cond: ("userId" = 'proof-user-1000'::text)
        Buffers: shared read=23 written=23
Planning:
  Buffers: shared hit=17 read=1 written=1
Planning Time: 2.639 ms
Execution Time: 0.854 ms
```

## Interpretation

Before I added the ordered index, PostgreSQL used the uniqueness index to find all 100 matching bookings and then performed a top-N sort to return the newest 20. After I added `(userId, createdAt DESC)`, PostgreSQL read the rows in the requested order directly from the new index and stopped after 20, reducing the measured execution time from 3.797 ms to 0.854 ms.

## Exit ticket

**Your booking service checked capacity before every insert and the event still oversold: why did the check fail, and what property of the fix makes overselling impossible?**

The separate concurrent capacity checks allowed multiple requests to observe the same available space, while the Serializable transaction makes the check and write one serializable unit so conflicting requests cannot all commit and oversell the event.

## Verification

- `npx prisma migrate dev`: passed against PostgreSQL 17.
- `npx prisma db seed` twice: previously passed against the isolated class database; the seed uses upserts for 23 users, five events, and three sample bookings.
- Event pagination, filtering, and CRUD: passed.
- Booking create, get, duplicate conflict, cancel, same-row rebook, full-event conflict, unknown ID, and WAITLISTED preservation: passed.
- Parallel booking proof: five `201` responses and fifteen `409` responses; the database contained exactly five confirmed rows.
- `npm test`: passed (the repository currently has the Session 6 placeholder test command).
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npx prisma validate` and `npx prisma generate`: passed.
- A clean-copy `npm ci` regenerated the ignored Prisma client through `postinstall`; typecheck, lint, and Prisma validation then passed without using files from the original working directory.

### Sandbox verification in the current environment

- `npm run typecheck`, `npm run lint`, `npm test`, `npx prisma validate`, and `npx prisma generate`: passed on 2026-08-19.
- Docker is not installed in the current environment, so the Compose command itself could not run. The initializer mount was reviewed against the existing PostgreSQL 17 service configuration, and all database checks below ran on an isolated native PostgreSQL 17 cluster instead.
- The initializer and `sql/verify-sandbox.sql` passed with exactly 2,000 users, 220 events, 10,500 bookings, ten zero-booking events, one `TS Conf`, two intentional oversold events, the ordered unique constraint, and no initial standalone `user_id` index.
- Rerunning the initializer inserted zero rows and retained the same counts, confirming idempotency.
- The INNER JOIN returned 10,500 rows; the LEFT JOIN found ten unmatched events; HAVING returned only the two intentional oversells with fifty confirmed bookings each; and the revenue query ranked all events successfully.
- The two-connection transaction check proved that the second connection retained capacity 100 while the first saw its uncommitted value 125, observed 125 after commit, and retained 125 after a separate update to 165 was rolled back. The fixture was restored to 100 afterward.
- The sandbox `user_id` plan changed from a sequential scan (1.939 ms measured execution) to a bitmap index plan using `bookings_user_id_idx` (0.102 ms measured execution).
- Prisma migrations and the application seed passed against the isolated database. Live API checks passed for duplicate conflicts, soft cancellation, same-row reactivation, full capacity, and missing event/booking responses.
- The 20-way concurrency proof passed with five `201` responses, fifteen `409` responses, and exactly five confirmed database rows.
- A deterministic fixture check produced 10,500 distinct `(event_id, user_id)` pairs, ten empty events, and exactly the two intended oversold events with fifty confirmed bookings each.
- `sql/verify-sandbox.sql` provides fail-fast assertions for row counts, zero-booking events, the two oversold events, `TS Conf`, the ordered unique constraint, and the absence of the standalone `user_id` index before the index exercise.
