import { type Booking } from "../domain.ts";
import { prisma } from "../lib/prisma.ts";
import { HttpError } from "../utils/httpError.ts";

function toDomain(booking: { id: string; userId: string; eventId: string; status: "CONFIRMED" | "CANCELLED" | "WAITLISTED"; createdAt: Date }): Booking {
  return { ...booking, createdAt: booking.createdAt.toISOString() };
}

const maximumTransactionAttempts = 10;

function hasPrismaCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

export async function createBookingTransaction(userId: string, eventId: string): Promise<Booking> {
  for (let attempt = 1; attempt <= maximumTransactionAttempts; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const event = await tx.event.findUnique({ where: { id: eventId } });
        if (!event) throw new HttpError(404, "Event not found");

        const confirmedBookings = await tx.booking.count({ where: { eventId, status: "CONFIRMED" } });
        if (confirmedBookings >= event.capacity) throw new HttpError(409, "Event capacity has been reached");

        const existing = await tx.booking.findUnique({ where: { userId_eventId: { userId, eventId } } });
        if (existing?.status === "CANCELLED") {
          return toDomain(await tx.booking.update({ where: { userId_eventId: { userId, eventId } }, data: { status: "CONFIRMED" } }));
        }
        if (existing?.status === "WAITLISTED") throw new HttpError(409, "Booking already exists for this event");

        // The database constraint remains the final duplicate guard; P2002 is mapped below.
        return toDomain(await tx.booking.create({ data: { userId, eventId, status: "CONFIRMED" } }));
      }, { isolationLevel: "Serializable" });
    } catch (error) {
      if (hasPrismaCode(error, "P2034") && attempt < maximumTransactionAttempts) continue;
      if (hasPrismaCode(error, "P2002")) throw new HttpError(409, "Booking already exists for this event");
      throw error;
    }
  }
  throw new HttpError(409, "Booking could not be completed");
}
