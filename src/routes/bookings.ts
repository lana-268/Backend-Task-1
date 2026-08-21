import { Router } from "express";
import { z } from "zod";

import {
  handleCancelBooking,
  handleCreateBooking,
  handleGetBooking,
} from "../controllers/bookingsController.ts";
import { requireAuth } from "../middleware/auth.ts";
import { validate, validateParams } from "../middleware/validate.ts";

const bookingsRouter = Router();
bookingsRouter.use(requireAuth);

const createBookingSchema = z.strictObject({
  eventId: z.string().min(1, "Event ID is required"),
});

const bookingParamsSchema = z.strictObject({
  id: z.string().uuid("Invalid booking ID"),
});

bookingsRouter.post("/", validate(createBookingSchema), handleCreateBooking);
bookingsRouter.get("/:id", validateParams(bookingParamsSchema), handleGetBooking);
bookingsRouter.delete("/:id", validateParams(bookingParamsSchema), handleCancelBooking);

export { bookingsRouter };
