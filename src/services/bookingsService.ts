import { randomUUID } from "node:crypto";

import { type Booking } from "../domain.ts";
import { HttpError } from "../utils/httpError.ts";
import { getEventById } from "./eventsService.ts";

const bookingsStore = new Map<string, Booking>();
const currentUserId = "usr-1";

export interface CreateBookingInput {
  eventId: string;
}

export function createBooking(input: CreateBookingInput): Booking {
  const event = getEventById(input.eventId);
  if (!event) {
    throw new HttpError(404, "Event not found");
  }

  for (const booking of bookingsStore.values()) {
    if (booking.userId === currentUserId && booking.eventId === input.eventId) {
      throw new HttpError(409, "Booking already exists for this event");
    }
  }

  const confirmedBookings = Array.from(bookingsStore.values()).filter(
    (booking) => booking.eventId === input.eventId && booking.status === "CONFIRMED",
  ).length;

  if (confirmedBookings >= event.capacity) {
    throw new HttpError(409, "Event capacity has been reached");
  }

  const booking: Booking = {
    id: randomUUID(),
    userId: currentUserId,
    eventId: input.eventId,
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
  };

  bookingsStore.set(booking.id, booking);
  return booking;
}

export function getBookingById(id: string): Booking {
  const booking = bookingsStore.get(id);
  if (!booking) {
    throw new HttpError(404, "Booking not found");
  }
  return booking;
}

export function cancelBooking(id: string): Booking {
  const booking = getBookingById(id);
  const cancelledBooking: Booking = { ...booking, status: "CANCELLED" };
  bookingsStore.set(id, cancelledBooking);
  return cancelledBooking;
}
