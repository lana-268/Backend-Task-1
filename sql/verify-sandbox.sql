\set ON_ERROR_STOP on
\connect sandbox

DO $$
DECLARE
  user_count integer;
  event_count integer;
  booking_count integer;
  empty_event_count integer;
  oversold_event_count integer;
  ts_conf_count integer;
  ordered_unique_count integer;
  standalone_user_index_count integer;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO event_count FROM events;
  SELECT COUNT(*) INTO booking_count FROM bookings;

  SELECT COUNT(*) INTO empty_event_count
  FROM events
  LEFT JOIN bookings ON bookings.event_id = events.id
  WHERE bookings.id IS NULL;

  SELECT COUNT(*) INTO oversold_event_count
  FROM (
    SELECT events.id
    FROM events
    INNER JOIN bookings
      ON bookings.event_id = events.id
      AND bookings.status = 'CONFIRMED'
    GROUP BY events.id, events.capacity
    HAVING COUNT(bookings.id) > events.capacity
  ) AS oversold;

  SELECT COUNT(*) INTO ts_conf_count FROM events WHERE title = 'TS Conf';

  SELECT COUNT(*) INTO ordered_unique_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename = 'bookings'
    AND indexdef LIKE 'CREATE UNIQUE INDEX%ON public.bookings USING btree (event_id, user_id)';

  SELECT COUNT(*) INTO standalone_user_index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename = 'bookings'
    AND indexdef LIKE '%USING btree (user_id)%';

  IF user_count <> 2000 THEN
    RAISE EXCEPTION 'expected 2000 users, found %', user_count;
  END IF;
  IF event_count <> 220 THEN
    RAISE EXCEPTION 'expected 220 events, found %', event_count;
  END IF;
  IF booking_count <> 10500 THEN
    RAISE EXCEPTION 'expected 10500 bookings, found %', booking_count;
  END IF;
  IF empty_event_count <> 10 THEN
    RAISE EXCEPTION 'expected 10 events without bookings, found %', empty_event_count;
  END IF;
  IF oversold_event_count <> 2 THEN
    RAISE EXCEPTION 'expected 2 oversold events, found %', oversold_event_count;
  END IF;
  IF ts_conf_count <> 1 THEN
    RAISE EXCEPTION 'expected one TS Conf event, found %', ts_conf_count;
  END IF;
  IF ordered_unique_count <> 1 THEN
    RAISE EXCEPTION 'expected UNIQUE (event_id, user_id) index';
  END IF;
  IF standalone_user_index_count <> 0 THEN
    RAISE EXCEPTION 'run initial verification before the user_id index demo';
  END IF;
END $$;

SELECT
  (SELECT COUNT(*) FROM users) AS users,
  (SELECT COUNT(*) FROM events) AS events,
  (SELECT COUNT(*) FROM bookings) AS bookings;
