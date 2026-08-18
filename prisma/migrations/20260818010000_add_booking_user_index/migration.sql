-- Supports bookings for one user ordered newest first.
CREATE INDEX "Booking_userId_createdAt_idx" ON "Booking"("userId", "createdAt" DESC);
