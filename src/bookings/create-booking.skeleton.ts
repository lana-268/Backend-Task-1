import { type Booking } from "../domain.ts";
import { createBooking } from "../services/bookingsService.ts";

/**
 * Completed exercise entry point. The production implementation now lives in
 * bookingsService.ts, where the controller reaches it through the normal layer.
 */
export async function createBookingTransaction(userId: string, eventId: string): Promise<Booking> {
  return createBooking(userId, { eventId });
}
