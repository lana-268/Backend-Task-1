import { type Event } from "../domain.ts";
import * as eventsRepository from "../repositories/eventsRepository.ts";

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
export const updateEvent = eventsRepository.updateEvent;
export const deleteEvent = eventsRepository.deleteEvent;
