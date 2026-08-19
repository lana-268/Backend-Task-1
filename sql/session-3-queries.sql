\set ON_ERROR_STOP on
\connect sandbox

-- INNER JOIN: who booked which event?
SELECT
  users.name AS user_name,
  users.email,
  events.title AS event_title,
  bookings.status,
  bookings.created_at AS booking_created_at
FROM bookings
INNER JOIN users ON users.id = bookings.user_id
INNER JOIN events ON events.id = bookings.event_id
ORDER BY bookings.created_at DESC
LIMIT 25;

-- LEFT JOIN: events that have no matching booking rows.
SELECT events.id, events.title
FROM events
LEFT JOIN bookings ON bookings.event_id = events.id
WHERE bookings.id IS NULL
ORDER BY events.title;

-- GROUP BY / COUNT / HAVING: confirmed bookings beyond capacity.
SELECT
  events.id,
  events.title,
  events.capacity,
  COUNT(bookings.id) AS confirmed_bookings
FROM events
INNER JOIN bookings
  ON bookings.event_id = events.id
  AND bookings.status = 'CONFIRMED'
GROUP BY events.id, events.title, events.capacity
HAVING COUNT(bookings.id) > events.capacity
ORDER BY events.title;

-- Aggregates: confirmed revenue in cents, including zero-revenue events.
SELECT
  events.id,
  events.title,
  COUNT(bookings.id) AS confirmed_bookings,
  COUNT(bookings.id) * events.price_cents AS confirmed_revenue_cents
FROM events
LEFT JOIN bookings
  ON bookings.event_id = events.id
  AND bookings.status = 'CONFIRMED'
GROUP BY events.id, events.title, events.price_cents
ORDER BY confirmed_revenue_cents DESC, events.title;
