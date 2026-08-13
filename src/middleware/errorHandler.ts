import { type Request, type Response, type NextFunction } from "express";

import { HttpError } from "../utils/httpError.ts";

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  console.error("Error:", error);

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  response.status(500).json({ error: "Internal server error" });
}
