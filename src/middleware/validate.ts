import { type NextFunction, type Request, type Response } from "express";
import { type ZodSchema } from "zod";

import { HttpError } from "../utils/httpError.ts";

export function validate(schema: ZodSchema) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(request.body);

      if (!result.success) {
        const firstError = result.error.issues[0];
        const message = firstError ? firstError.message : "Validation failed";
        throw new HttpError(400, message, result.error.issues);
      }

      request.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (request: Request, response: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(request.query);

      if (!result.success) {
        const firstError = result.error.issues[0];
        const message = firstError ? firstError.message : "Validation failed";
        throw new HttpError(400, message, result.error.issues);
      }

      response.locals.query = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (request: Request, response: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(request.params);

      if (!result.success) {
        const firstError = result.error.issues[0];
        const message = firstError ? firstError.message : "Validation failed";
        throw new HttpError(400, message, result.error.issues);
      }

      response.locals.params = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}
