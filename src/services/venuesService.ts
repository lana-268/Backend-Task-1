import { randomUUID } from "node:crypto";

import { HttpError } from "../utils/httpError.ts";
import { type Venue } from "../domain.ts";

const venuesStore = new Map<string, Venue>();

export interface CreateVenueInput {
  name: string;
  address: string;
  capacity: number;
  contactEmail: string;
}

export interface UpdateVenueInput {
  name?: string;
  address?: string;
  capacity?: number;
  contactEmail?: string;
}

export interface ListVenuesOptions {
  limit?: number;
}

export function createVenue(input: CreateVenueInput): Venue {
  // Check for duplicate name
  for (const venue of venuesStore.values()) {
    if (venue.name === input.name) {
      throw new HttpError(409, `Venue with name "${input.name}" already exists`);
    }
  }

  const venue: Venue = {
    id: randomUUID(),
    name: input.name,
    address: input.address,
    capacity: input.capacity,
    contactEmail: input.contactEmail,
    createdAt: new Date().toISOString(),
  };

  venuesStore.set(venue.id, venue);
  return venue;
}

export function listVenues(options: ListVenuesOptions): Venue[] {
  const venues = Array.from(venuesStore.values());
  const limit = options.limit ?? 10;
  return venues.slice(0, limit);
}

export function getVenueById(id: string): Venue {
  const venue = venuesStore.get(id);
  if (!venue) {
    throw new HttpError(404, "Venue not found");
  }
  return venue;
}

export function updateVenue(id: string, input: UpdateVenueInput): Venue {
  const venue = getVenueById(id);

  // Check for duplicate name if name is being updated
  if (input.name && input.name !== venue.name) {
    for (const existingVenue of venuesStore.values()) {
      if (existingVenue.id !== id && existingVenue.name === input.name) {
        throw new HttpError(409, `Venue with name "${input.name}" already exists`);
      }
    }
  }

  const updatedVenue: Venue = {
    ...venue,
    ...input,
  };

  venuesStore.set(id, updatedVenue);
  return updatedVenue;
}

export function deleteVenue(id: string): void {
  const venue = getVenueById(id);
  venuesStore.delete(venue.id);
}
