import { type Booking } from "../domain.ts";
import { prisma } from "../lib/prisma.ts";

function toDomain(booking: { id: string; userId: string; eventId: string; status: "CONFIRMED" | "CANCELLED" | "WAITLISTED"; createdAt: Date }): Booking {
  return { ...booking, createdAt: booking.createdAt.toISOString() };
}

export async function findBookingById(id: string): Promise<Booking | undefined> {
  const booking = await prisma.booking.findUnique({ where: { id } });
  return booking ? toDomain(booking) : undefined;
}

export async function cancelBookingById(id: string): Promise<Booking | undefined> {
  const booking = await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } }).catch((error: unknown) => {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") return null;
    throw error;
  });
  return booking ? toDomain(booking) : undefined;
}
