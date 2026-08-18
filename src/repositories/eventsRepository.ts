import { type Event } from "../domain.ts";
import { prisma } from "../lib/prisma.ts";

export interface EventData {
  title: string;
  description: string;
  venue?: string | null;
  startsAt: string;
  capacity: number;
  priceCents: number;
  organizerId: string;
}

function toDomain(event: {
  id: string; title: string; description: string; venue: string | null; startsAt: Date;
  capacity: number; priceCents: number; organizerId: string; createdAt: Date;
}): Event {
  return { ...event, startsAt: event.startsAt.toISOString(), createdAt: event.createdAt.toISOString() };
}

export async function findEventById(id: string): Promise<Event | undefined> {
  const event = await prisma.event.findUnique({ where: { id } });
  return event ? toDomain(event) : undefined;
}

export async function findEvents(options: {
  page: number; limit: number; venue?: string; from?: string; to?: string;
}): Promise<{ data: Event[]; total: number }> {
  const startsAt = options.from || options.to
    ? { ...(options.from ? { gte: new Date(`${options.from}T00:00:00.000Z`) } : {}), ...(options.to ? { lte: new Date(`${options.to}T23:59:59.999Z`) } : {}) }
    : undefined;
  const where = { ...(options.venue === undefined ? {} : { venue: options.venue }), ...(startsAt ? { startsAt } : {}) };
  const [events, total] = await prisma.$transaction([
    prisma.event.findMany({ where, skip: (options.page - 1) * options.limit, take: options.limit, orderBy: { startsAt: "asc" } }),
    prisma.event.count({ where }),
  ]);
  return { data: events.map(toDomain), total };
}

export async function createEvent(data: EventData): Promise<Event> {
  return toDomain(await prisma.event.create({ data: { ...data, startsAt: new Date(data.startsAt) } }));
}

export async function updateEvent(id: string, data: Partial<EventData>): Promise<Event | undefined> {
  const event = await prisma.event.update({ where: { id }, data: { ...data, ...(data.startsAt ? { startsAt: new Date(data.startsAt) } : {}) } }).catch((error: unknown) => {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") return null;
    throw error;
  });
  return event ? toDomain(event) : undefined;
}

export async function deleteEvent(id: string): Promise<Event | undefined> {
  const event = await prisma.event.delete({ where: { id } }).catch((error: unknown) => {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") return null;
    throw error;
  });
  return event ? toDomain(event) : undefined;
}
