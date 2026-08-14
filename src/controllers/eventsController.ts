import { type Request, type Response } from "express";

import { listEvents, type ListEventsOptions } from "../services/eventsService.ts";

export async function handleListEvents(_request: Request, response: Response): Promise<void> {
  const options = response.locals.query as ListEventsOptions;
  response.status(200).json(listEvents(options));
}
