# Session 3 implementation plan

- [ ] Add Prisma 7 configuration, Postgres Docker setup, schema, migration, and environment documentation.
- [ ] Replace the in-memory event store with Prisma-backed event repository operations, including list filters and pagination.
- [ ] Add Prisma-backed booking creation in a serializable transaction, cancellation, retrieval, duplicate handling, and rebooking.
- [ ] Add an idempotent seed with fixture users, events, bookings, and a capacity-five concurrency event.
- [ ] Add the parallel-bookings proof script and document the index investigation and fresh-clone setup.
- [ ] Run formatting, type checking, linting, and available runtime/database verification; check off completed items.
