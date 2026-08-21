import { type Event } from "../domain.ts";
import { type AuthenticatedUser } from "../auth/accessToken.ts";
import * as eventsRepository from "../repositories/eventsRepository.ts";
import { HttpError } from "../utils/httpError.ts";

export interface ListEventsOptions {
  page: number;
  limit: number;
  venue?: string;
  from?: string;
  to?: string;
}

export interface PaginatedEvents {
  data: Event[];
  page: number;
  limit: number;
  total: number;
}

export async function getEventById(id: string): Promise<Event | undefined> {
  return eventsRepository.findEventById(id);
}

export async function listEvents(options: ListEventsOptions): Promise<PaginatedEvents> {
  const result = await eventsRepository.findEvents(options);
  return {
    data: result.data,
    page: options.page,
    limit: options.limit,
    total: result.total,
  };
}

export const createEvent = eventsRepository.createEvent;

async function requireEventOwner(id: string, auth: AuthenticatedUser): Promise<Event | undefined> {
  const event = await eventsRepository.findEventById(id);
  if (!event) return undefined;
  if (auth.role !== "ADMIN" && event.organizerId !== auth.id) {
    throw new HttpError(403, "Forbidden");
  }
  return event;
}

export async function updateEvent(
  id: string,
  data: Partial<eventsRepository.EventData>,
  auth: AuthenticatedUser,
): Promise<Event | undefined> {
  if (!await requireEventOwner(id, auth)) return undefined;
  return eventsRepository.updateEvent(id, data);
}

export async function deleteEvent(id: string, auth: AuthenticatedUser): Promise<Event | undefined> {
  if (!await requireEventOwner(id, auth)) return undefined;
  return eventsRepository.deleteEvent(id);
}
