# Session 3 implementation plan

- [x] Inspect repository architecture, branches, and existing Session 1–2 behavior.
- [ ] Add Prisma 7/database configuration, PostgreSQL Docker setup, schema, migration, and environment documentation.
- [ ] Create the Event repository and integrate it with the Event service.
- [ ] Implement PostgreSQL-backed event pagination, filtering, and CRUD.
- [ ] Create the Booking repository/service integration.
- [ ] Implement transactional booking creation with Serializable isolation and confirmed-only capacity checking.
- [ ] Implement cancelled booking reactivation, duplicate booking handling, and P2002-to-409 mapping.
- [ ] Implement PostgreSQL booking retrieval and soft cancellation.
- [ ] Add an idempotent seed script with required users, roles, events, and sample bookings.
- [ ] Add twenty parallel users and a capacity-five event fixture.
- [ ] Enable Prisma query logging and record EXPLAIN ANALYZE before the bookings-by-user index.
- [ ] Create the appropriate bookings-by-user index and record EXPLAIN ANALYZE after it.
- [ ] Test endpoints, rebooking, capacity, duplicate handling, and parallel booking concurrency.
- [ ] Verify a fresh-clone-equivalent setup, migrations, seed, Docker configuration, and generated Prisma files.
- [ ] Update README/PR documentation and mark only verified checklist items complete.
