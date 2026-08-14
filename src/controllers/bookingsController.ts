import { type Request, type Response } from "express";

import {
  cancelBooking,
  createBooking,
  getBookingById,
  type CreateBookingInput,
} from "../services/bookingsService.ts";

interface BookingParams {
  id: string;
}

export async function handleCreateBooking(request: Request, response: Response): Promise<void> {
  const booking = createBooking(request.body as CreateBookingInput);
  response.status(201).json(booking);
}

export async function handleGetBooking(_request: Request, response: Response): Promise<void> {
  const { id } = response.locals.params as BookingParams;
  response.status(200).json(getBookingById(id));
}

export async function handleCancelBooking(_request: Request, response: Response): Promise<void> {
  const { id } = response.locals.params as BookingParams;
  response.status(200).json(cancelBooking(id));
}
