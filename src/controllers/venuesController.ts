import { type Request, type Response } from "express";

import {
  createVenue,
  listVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
  type CreateVenueInput,
  type UpdateVenueInput,
} from "../services/venuesService.ts";
interface ListVenuesQuery {
  limit?: number;
}

interface VenueParams {
  id: string;
}

export async function handleCreateVenue(request: Request, response: Response): Promise<void> {
  const input = request.body as CreateVenueInput;
  const venue = createVenue(input);
  response.status(201).json(venue);
}

export async function handleListVenues(request: Request, response: Response): Promise<void> {
  const { limit } = response.locals.query as ListVenuesQuery;
  const venues = listVenues({ limit });
  response.status(200).json(venues);
}

export async function handleGetVenue(_request: Request, response: Response): Promise<void> {
  const { id } = response.locals.params as VenueParams;
  const venue = getVenueById(id);
  response.status(200).json(venue);
}

export async function handleUpdateVenue(request: Request, response: Response): Promise<void> {
  const { id } = response.locals.params as VenueParams;
  const input = request.body as UpdateVenueInput;
  const venue = updateVenue(id, input);
  response.status(200).json(venue);
}

export async function handleDeleteVenue(_request: Request, response: Response): Promise<void> {
  const { id } = response.locals.params as VenueParams;
  deleteVenue(id);
  response.status(204).send();
}
