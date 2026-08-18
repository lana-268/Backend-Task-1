import { readFile } from "node:fs/promises";

import pg from "pg";

import { config } from "../src/config.ts";

const client = new pg.Client({ connectionString: config.DATABASE_URL });
const mode = process.argv[2];

async function prepareBenchmark(): Promise<void> {
  const counts = await client.query<{
    users: number;
    events: number;
    bookings: number;
  }>(`SELECT
      (SELECT COUNT(*)::int FROM "User") AS users,
      (SELECT COUNT(*)::int FROM "Event") AS events,
      (SELECT COUNT(*)::int FROM "Booking") AS bookings`);
  console.log("Seed counts:", counts.rows[0]);

  await client.query(`
    INSERT INTO "User" (id, email, name, role)
    SELECT
      'proof-user-' || number,
      'proof-' || number || '@eventify.test',
      'Proof User ' || number,
      'ATTENDEE'::"Role"
    FROM generate_series(1, 2000) AS number
    ON CONFLICT DO NOTHING
  `);

  await client.query(`
    INSERT INTO "Event" (
      id, title, description, venue, "startsAt", capacity, "priceCents", "organizerId"
    )
    SELECT
      'proof-event-' || number,
      'Proof Event ' || number,
      'Index proof',
      'Proof Lab',
      NOW() + (number || ' minutes')::interval,
      3000,
      0,
      'usr-1'
    FROM generate_series(1, 2000) AS number
    ON CONFLICT DO NOTHING
  `);

  await client.query(`
    INSERT INTO "Booking" (id, "userId", "eventId", status, "createdAt")
    SELECT
      'proof-booking-' || user_number || '-' || event_number,
      'proof-user-' || user_number,
      'proof-event-' || event_number,
      'CANCELLED'::"BookingStatus",
      NOW() - ((user_number * 2000 + event_number) || ' seconds')::interval
    FROM generate_series(1, 2000) AS user_number
    CROSS JOIN generate_series(1, 100) AS event_number
    ON CONFLICT DO NOTHING
  `);

  await client.query(`ANALYZE "Booking"`);
}

async function explain(): Promise<void> {
  const result = await client.query<{ "QUERY PLAN": string }>(`
    EXPLAIN (ANALYZE, BUFFERS)
    SELECT * FROM "Booking"
    WHERE "userId" = 'proof-user-1000'
    ORDER BY "createdAt" DESC
    LIMIT 20
  `);
  console.log(result.rows.map((row) => row["QUERY PLAN"]).join("\n"));
}

async function applyIndex(): Promise<void> {
  const migration = await readFile(
    new URL("../prisma/migrations/20260818010000_add_booking_user_index/migration.sql", import.meta.url),
    "utf8",
  );
  await client.query(migration);
  await client.query(`ANALYZE "Booking"`);
}

async function dropIndex(): Promise<void> {
  await client.query(`DROP INDEX IF EXISTS "Booking_userId_createdAt_idx"`);
  await client.query(`ANALYZE "Booking"`);
}

async function resetDatabase(): Promise<void> {
  await client.query(`DROP DATABASE IF EXISTS eventify WITH (FORCE)`);
  await client.query(`CREATE DATABASE eventify`);
}

async function inspectSchema(): Promise<void> {
  const result = await client.query<{
    schema: string;
    name: string;
    kind: string;
  }>(`
    SELECT namespace.nspname AS schema, class.relname AS name, class.relkind AS kind
    FROM pg_class AS class
    JOIN pg_namespace AS namespace ON namespace.oid = class.relnamespace
    WHERE namespace.nspname NOT IN ('pg_catalog', 'information_schema')
    ORDER BY schema, name
  `);
  console.log(result.rows);
}

async function printSeedCounts(): Promise<void> {
  const result = await client.query<{
    users: number;
    events: number;
    bookings: number;
  }>(`SELECT
      (SELECT COUNT(*)::int FROM "User") AS users,
      (SELECT COUNT(*)::int FROM "Event") AS events,
      (SELECT COUNT(*)::int FROM "Booking") AS bookings`);
  console.log(result.rows[0]);
}

async function printParallelCounts(): Promise<void> {
  const result = await client.query<{ status: string; count: number }>(`
    SELECT status, COUNT(*)::int AS count
    FROM "Booking"
    WHERE "eventId" = '00000000-0000-4000-8000-000000000005'
    GROUP BY status
    ORDER BY status
  `);
  console.log(result.rows);
}

await client.connect();
try {
  if (mode === "prepare") await prepareBenchmark();
  else if (mode === "explain") await explain();
  else if (mode === "apply-index") await applyIndex();
  else if (mode === "drop-index") await dropIndex();
  else if (mode === "reset-database") await resetDatabase();
  else if (mode === "inspect-schema") await inspectSchema();
  else if (mode === "seed-counts") await printSeedCounts();
  else if (mode === "parallel-counts") await printParallelCounts();
  else throw new Error(
    "Usage: node scripts/index-proof.ts prepare|explain|apply-index|drop-index|reset-database|inspect-schema|seed-counts|parallel-counts",
  );
} finally {
  await client.end();
}
