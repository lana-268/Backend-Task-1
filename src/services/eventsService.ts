import { readFileSync } from "node:fs";

import { type Event } from "../domain.ts";

const eventsPath = new URL("../../data/events.json", import.meta.url);
const events = JSON.parse(readFileSync(eventsPath, "utf8")) as Event[];
const eventsStore = new Map(events.map((event) => [event.id, event]));

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

export function getEventById(id: string): Event | undefined {
  return eventsStore.get(id);
}

export function listEvents(options: ListEventsOptions): PaginatedEvents {
  const filteredEvents = Array.from(eventsStore.values()).filter((event) => {
    const eventDate = event.startsAt.slice(0, 10);

    return (
      (options.venue === undefined || event.venue === options.venue) &&
      (options.from === undefined || eventDate >= options.from) &&
      (options.to === undefined || eventDate <= options.to)
    );
  });

  const start = (options.page - 1) * options.limit;

  return {
    data: filteredEvents.slice(start, start + options.limit),
    page: options.page,
    limit: options.limit,
    total: filteredEvents.length,
  };
}
