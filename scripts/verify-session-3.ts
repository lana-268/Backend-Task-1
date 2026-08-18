import assert from "node:assert/strict";

import pg from "pg";

import { config } from "../src/config.ts";

const baseUrl = `http://localhost:${config.PORT}/v1`;
const database = new pg.Client({ connectionString: config.DATABASE_URL });

async function request(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; body: unknown }> {
  const response = await fetch(`${baseUrl}${path}`, init);
  return { status: response.status, body: await response.json() };
}

await database.connect();
try {
  await database.query(`
    DELETE FROM "Booking"
    WHERE ("userId" = 'parallel-user-20' AND "eventId" = '00000000-0000-4000-8000-000000000001')
       OR ("userId" = 'parallel-user-19' AND "eventId" = '00000000-0000-4000-8000-000000000002')
  `);

  const defaultList = await request("/events");
  assert.equal(defaultList.status, 200);
  assert.equal((defaultList.body as { page: number }).page, 1);
  assert.equal((defaultList.body as { limit: number }).limit, 20);
  assert.equal((defaultList.body as { total: number }).total, 5);

  const filteredList = await request(
    "/events?venue=Istanbul%20Hub&from=2026-10-01&to=2026-10-05&page=1&limit=1",
  );
  assert.equal(filteredList.status, 200);
  assert.equal((filteredList.body as { total: number }).total, 2);
  assert.equal((filteredList.body as { data: unknown[] }).data.length, 1);

  const invalidList = await request("/events?page=0");
  assert.equal(invalidList.status, 400);

  const createdEvent = await request("/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "Verification Event",
      description: "Temporary CRUD verification event.",
      venue: "Verification Lab",
      startsAt: "2026-12-01T10:00:00.000Z",
      capacity: 10,
      priceCents: 500,
    }),
  });
  assert.equal(createdEvent.status, 201);
  const eventId = (createdEvent.body as { id: string }).id;

  assert.equal((await request(`/events/${eventId}`)).status, 200);
  const updatedEvent = await request(`/events/${eventId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Updated Verification Event" }),
  });
  assert.equal(updatedEvent.status, 200);
  assert.equal((updatedEvent.body as { title: string }).title, "Updated Verification Event");
  assert.equal((await request(`/events/${eventId}`, { method: "DELETE" })).status, 200);
  assert.equal((await request(`/events/${eventId}`)).status, 404);

  const bookingHeaders = {
    "content-type": "application/json",
    "x-user-id": "parallel-user-20",
  };
  const bookingBody = JSON.stringify({
    eventId: "00000000-0000-4000-8000-000000000001",
  });
  const firstBooking = await request("/bookings", {
    method: "POST",
    headers: bookingHeaders,
    body: bookingBody,
  });
  assert.equal(firstBooking.status, 201);
  assert.equal((firstBooking.body as { status: string }).status, "CONFIRMED");
  const bookingId = (firstBooking.body as { id: string }).id;

  assert.equal((await request(`/bookings/${bookingId}`)).status, 200);
  assert.equal(
    (
      await request("/bookings", {
        method: "POST",
        headers: bookingHeaders,
        body: bookingBody,
      })
    ).status,
    409,
  );

  const cancelledBooking = await request(`/bookings/${bookingId}`, { method: "DELETE" });
  assert.equal(cancelledBooking.status, 200);
  assert.equal((cancelledBooking.body as { status: string }).status, "CANCELLED");

  const rebooked = await request("/bookings", {
    method: "POST",
    headers: bookingHeaders,
    body: bookingBody,
  });
  assert.equal(rebooked.status, 201);
  assert.equal((rebooked.body as { id: string }).id, bookingId);
  assert.equal((rebooked.body as { status: string }).status, "CONFIRMED");

  const bookingRows = await database.query<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM "Booking"
    WHERE "userId" = 'parallel-user-20'
      AND "eventId" = '00000000-0000-4000-8000-000000000001'
  `);
  assert.equal(bookingRows.rows[0]?.count, 1);

  const unknownBookingId = "00000000-0000-4000-8000-999999999999";
  assert.equal((await request(`/bookings/${unknownBookingId}`)).status, 404);
  assert.equal(
    (await request(`/bookings/${unknownBookingId}`, { method: "DELETE" })).status,
    404,
  );

  await database.query(`
    INSERT INTO "Booking" (id, "userId", "eventId", status)
    VALUES (
      '00000000-0000-4000-8000-999999999998',
      'parallel-user-19',
      '00000000-0000-4000-8000-000000000002',
      'WAITLISTED'
    )
  `);
  const waitlistedAttempt = await request("/bookings", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-user-id": "parallel-user-19",
    },
    body: JSON.stringify({ eventId: "00000000-0000-4000-8000-000000000002" }),
  });
  assert.equal(waitlistedAttempt.status, 409);
  const waitlistedStatus = await database.query<{ status: string }>(`
    SELECT status FROM "Booking"
    WHERE "userId" = 'parallel-user-19'
      AND "eventId" = '00000000-0000-4000-8000-000000000002'
  `);
  assert.equal(waitlistedStatus.rows[0]?.status, "WAITLISTED");

  console.log({
    eventList: "passed",
    paginationAndFiltering: "passed",
    eventCrud: "passed",
    bookingCreateGetCancelRebook: "passed",
    duplicateConflict: "passed",
    unknownBooking: "passed",
    waitlistedUnchanged: "passed",
  });
} finally {
  await database.end();
}
