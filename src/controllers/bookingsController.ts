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

const currentUserId = "usr-1";

export async function handleCreateBooking(request: Request, response: Response): Promise<void> {
  const booking = await createBooking(request.header("x-user-id") || currentUserId, request.body as CreateBookingInput);
  response.status(201).json(booking);
}

export async function handleGetBooking(_request: Request, response: Response): Promise<void> {
  const { id } = response.locals.params as BookingParams;
  response.status(200).json(await getBookingById(id));
}

export async function handleCancelBooking(_request: Request, response: Response): Promise<void> {
  const { id } = response.locals.params as BookingParams;
  response.status(200).json(await cancelBooking(id));
}
