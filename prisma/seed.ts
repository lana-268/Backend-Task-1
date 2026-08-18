import { PrismaPg } from "@prisma/adapter-pg";

import { config } from "../src/config.ts";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: config.DATABASE_URL }),
});
const parallelEventId = "00000000-0000-4000-8000-000000000005";

const users = [
  { id: "usr-1", email: "organizer@eventify.test", name: "Olive Organizer", role: "ORGANIZER" as const },
  { id: "usr-2", email: "admin@eventify.test", name: "Avery Admin", role: "ADMIN" as const },
  { id: "usr-3", email: "attendee@eventify.test", name: "Andy Attendee", role: "ATTENDEE" as const },
  ...Array.from({ length: 20 }, (_, index) => ({ id: `parallel-user-${index + 1}`, email: `parallel-${index + 1}@eventify.test`, name: `Parallel User ${index + 1}`, role: "ATTENDEE" as const })),
];

const events = [
  { id: "00000000-0000-4000-8000-000000000001", title: "TypeScript Fundamentals", description: "A practical workshop.", venue: "Istanbul Hub", startsAt: new Date("2026-10-01T09:00:00.000Z"), capacity: 40, priceCents: 2500 },
  { id: "00000000-0000-4000-8000-000000000002", title: "PostgreSQL Lab", description: "Database design lab.", venue: "Istanbul Hub", startsAt: new Date("2026-10-05T09:00:00.000Z"), capacity: 30, priceCents: 3000 },
  { id: "00000000-0000-4000-8000-000000000003", title: "API Design", description: "HTTP API patterns.", venue: "Ankara Hub", startsAt: new Date("2026-10-10T09:00:00.000Z"), capacity: 25, priceCents: 2000 },
  { id: "00000000-0000-4000-8000-000000000004", title: "Concurrency Clinic", description: "Transactions in practice.", venue: "Remote", startsAt: new Date("2026-10-15T09:00:00.000Z"), capacity: 100, priceCents: 0 },
  { id: parallelEventId, title: "Parallel Booking Proof", description: "Capacity-five concurrency fixture.", venue: "Test Lab", startsAt: new Date("2026-11-01T09:00:00.000Z"), capacity: 5, priceCents: 0 },
];

async function main(): Promise<void> {
  for (const user of users) await prisma.user.upsert({ where: { id: user.id }, update: user, create: user });
  for (const event of events) await prisma.event.upsert({ where: { id: event.id }, update: { ...event, organizerId: "usr-1" }, create: { ...event, organizerId: "usr-1" } });
  await prisma.booking.upsert({ where: { userId_eventId: { userId: "usr-3", eventId: events[0].id } }, update: { status: "CONFIRMED" }, create: { userId: "usr-3", eventId: events[0].id, status: "CONFIRMED" } });
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
