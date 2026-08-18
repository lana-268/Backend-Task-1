# Session 3 implementation plan

- [x] Inspect repository architecture, branches, and existing Session 1–2 behavior.
- [x] Add Prisma 7/database configuration, PostgreSQL Docker setup, schema, migration, and environment documentation.
- [x] Create the Event repository and integrate it with the Event service.
- [x] Implement PostgreSQL-backed event pagination, filtering, and CRUD.
- [x] Create the Booking repository/service integration.
- [x] Implement transactional booking creation with Serializable isolation and confirmed-only capacity checking.
- [x] Implement cancelled booking reactivation, duplicate booking handling, and P2002-to-409 mapping.
- [x] Implement PostgreSQL booking retrieval and soft cancellation.
- [x] Add an idempotent seed script with required users, roles, events, and sample bookings.
- [x] Add twenty parallel users and a capacity-five event fixture.
- [x] Enable Prisma query logging and record EXPLAIN ANALYZE before the bookings-by-user index.
- [x] Create the appropriate bookings-by-user index and record EXPLAIN ANALYZE after it.
- [x] Test endpoints, rebooking, capacity, duplicate handling, and parallel booking concurrency.
- [x] Verify a fresh-clone-equivalent setup, migrations, seed, Docker configuration, and generated Prisma files.
- [x] Update README/PR documentation and mark only verified checklist items complete.
