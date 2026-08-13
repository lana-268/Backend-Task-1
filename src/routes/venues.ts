import { Router } from "express";
import { z } from "zod";

import { validate, validateParams, validateQuery } from "../middleware/validate.ts";
import {
  handleCreateVenue,
  handleListVenues,
  handleGetVenue,
  handleUpdateVenue,
  handleDeleteVenue,
} from "../controllers/venuesController.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

const venuesRouter = Router();

const createVenueSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  contactEmail: z.string().email("Valid email is required"),
}).strict();

const listVenuesSchema = z.object({
  limit: z.coerce.number().int().positive().optional(),
}).strict();

const venueParamsSchema = z.object({
  id: z.string().uuid("Invalid venue ID"),
});

const updateVenueSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  contactEmail: z.string().email().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required",
});

venuesRouter.post("/", validate(createVenueSchema), asyncHandler(handleCreateVenue));

venuesRouter.get("/", validateQuery(listVenuesSchema), asyncHandler(handleListVenues));

venuesRouter.get("/:id", validateParams(venueParamsSchema), asyncHandler(handleGetVenue));

venuesRouter.patch(
  "/:id",
  validateParams(venueParamsSchema),
  validate(updateVenueSchema),
  asyncHandler(handleUpdateVenue),
);

venuesRouter.delete("/:id", validateParams(venueParamsSchema), asyncHandler(handleDeleteVenue));

export { venuesRouter };
