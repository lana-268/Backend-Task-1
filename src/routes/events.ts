import { Router } from "express";
import { z } from "zod";

import { handleCreateEvent, handleDeleteEvent, handleGetEvent, handleListEvents, handleUpdateEvent } from "../controllers/eventsController.ts";
import { validate, validateParams, validateQuery } from "../middleware/validate.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

const eventsRouter = Router();

const listEventsSchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  venue: z.string().optional(),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
});

const eventSchema = z.strictObject({
  title: z.string().min(1),
  description: z.string(),
  venue: z.string().nullable().optional(),
  startsAt: z.iso.datetime(),
  capacity: z.number().int().positive(),
  priceCents: z.number().int().nonnegative(),
  organizerId: z.string().min(1).optional(),
});

const eventParamsSchema = z.strictObject({
  id: z.string().uuid("Invalid event ID"),
});

eventsRouter.post("/", validate(eventSchema), asyncHandler(handleCreateEvent));
eventsRouter.get("/", validateQuery(listEventsSchema), asyncHandler(handleListEvents));
eventsRouter.get("/:id", validateParams(eventParamsSchema), asyncHandler(handleGetEvent));
eventsRouter.patch("/:id", validateParams(eventParamsSchema), validate(eventSchema.partial()), asyncHandler(handleUpdateEvent));
eventsRouter.delete("/:id", validateParams(eventParamsSchema), asyncHandler(handleDeleteEvent));

export { eventsRouter };
