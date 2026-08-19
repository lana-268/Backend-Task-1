# Session 3 implementation plan

## Existing application work to verify

- [x] Inspect the repository structure, package scripts, Prisma schema and migrations, Docker configuration, booking/event layers, Session 3 scripts, documentation, and TODOs.
- [x] Fold the Serializable booking transaction into the service and verify the confirmed-only capacity check, cancelled-row reactivation, duplicate/P2002 conflict handling, bounded retries, soft cancellation, and concurrency script.
- [x] Run the available typecheck, lint, test, and Prisma validation/generation commands; record why database-backed application verification cannot run in the current environment.

## Separate SQL sandbox

- [x] Add an idempotent PostgreSQL initialization seed that creates the separate `sandbox` database and its lowercase `users`, `events`, and `bookings` tables.
- [x] Seed approximately 2,000 users, 200+ events, and 10,000+ bookings while preserving zero-booking events, exactly named `TS Conf`, and two deliberately oversold events.
- [x] Preserve the `(event_id, user_id)` unique constraint order and omit a standalone `bookings.user_id` index from initial setup.
- [x] Mount the sandbox initialization SQL into `/docker-entrypoint-initdb.d/` on the existing PostgreSQL service.
- [x] Add reproducible SQL exercises for INNER JOIN, zero-booking LEFT JOIN, oversold HAVING, confirmed revenue, transactions, and before/after `user_id` index plans.
- [x] Document first-initialization behavior, reset instructions, sandbox connection commands, transaction terminals, and exercise commands without pointing Prisma at `sandbox`.
- [x] Verify the sandbox live on PostgreSQL 17: schema, row counts, idempotent reseeding, teaching fixtures, constraints, joins, aggregates, transaction visibility/rollback, and before/after EXPLAIN behavior. Docker Compose itself remains unavailable in this environment, so its existing-service initialization mount was verified statically.

## Completion

- [x] Record actual verification results and environment limitations in the Session 3 documentation.
- [x] Review the final diff for minimal scope and mark only completed checklist items checked.
