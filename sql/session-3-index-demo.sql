\set ON_ERROR_STOP on
\connect sandbox

-- The initial UNIQUE (event_id, user_id) index cannot efficiently serve a
-- predicate on user_id alone because user_id is not its leading column.
DROP INDEX IF EXISTS bookings_user_id_idx;
ANALYZE bookings;

EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM bookings
WHERE user_id = '10000000-0000-4000-8000-000000000038';

CREATE INDEX bookings_user_id_idx ON bookings (user_id);
ANALYZE bookings;

-- PostgreSQL may choose Index Scan or an index-based bitmap plan.
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM bookings
WHERE user_id = '10000000-0000-4000-8000-000000000038';
