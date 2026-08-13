export type Role = "ATTENDEE" | "ORGANIZER" | "ADMIN";

export type BookingStatus = "CONFIRMED" | "CANCELLED" | "WAITLISTED";

export interface Event {
  id: string;
  title: string;
  description: string;
  venue: string | null;
  startsAt: string;
  capacity: number;
  priceCents: number;
  organizerId: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  contactEmail: string;
  createdAt: string;
}

export function findById<T extends { id: string }>(
  records: readonly T[],
  id: string,
): T | undefined {
  return records.find((record) => record.id === id);
}
