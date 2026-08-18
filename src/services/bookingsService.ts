import { type Booking } from "../domain.ts";
import { createBookingTransaction } from "../bookings/create-booking.skeleton.ts";
import { cancelBookingById, findBookingById } from "../repositories/bookingsRepository.ts";
import { HttpError } from "../utils/httpError.ts";

export interface CreateBookingInput {
  eventId: string;
}

export async function createBooking(userId: string, input: CreateBookingInput): Promise<Booking> {
  return createBookingTransaction(userId, input.eventId);
}

export async function getBookingById(id: string): Promise<Booking> {
  const booking = await findBookingById(id);
  if (!booking) {
    throw new HttpError(404, "Booking not found");
  }
  return booking;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const booking = await cancelBookingById(id);
  if (!booking) throw new HttpError(404, "Booking not found");
  return booking;
}
