import { Router } from "express";
import { z } from "zod";

import { handleListEvents } from "../controllers/eventsController.ts";
import { validateQuery } from "../middleware/validate.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

const eventsRouter = Router();

const listEventsSchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  venue: z.string().optional(),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
});

eventsRouter.get("/", validateQuery(listEventsSchema), asyncHandler(handleListEvents));

export { eventsRouter };
