import { Router } from "express";
import { z } from "zod";

import {
  handleCancelBooking,
  handleCreateBooking,
  handleGetBooking,
} from "../controllers/bookingsController.ts";
import { validate, validateParams } from "../middleware/validate.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

const bookingsRouter = Router();

const createBookingSchema = z.strictObject({
  eventId: z.string().min(1, "Event ID is required"),
});

const bookingParamsSchema = z.strictObject({
  id: z.string().uuid("Invalid booking ID"),
});

bookingsRouter.post("/", validate(createBookingSchema), asyncHandler(handleCreateBooking));
bookingsRouter.get("/:id", validateParams(bookingParamsSchema), asyncHandler(handleGetBooking));
bookingsRouter.delete("/:id", validateParams(bookingParamsSchema), asyncHandler(handleCancelBooking));

export { bookingsRouter };
