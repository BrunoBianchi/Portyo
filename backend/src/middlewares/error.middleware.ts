import type { NextFunction, Request, Response } from "express";
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { ZodError } from "zod";
import { logger } from "../shared/utils/logger";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    logger.warn(`Error occurred after headers were sent: ${err.message}`);
    return next(err);
  }
  if (err instanceof ApiError) {
    if (err.code >= 500) {
      logger.error(`ApiError: ${err.message}`, err);
    } else {
      logger.warn(`ApiError: ${err.message}`);
    }
    return res.status(err.code).json({
      cause: err.cause,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    const message = err.issues
      .map((issue:any) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    
    logger.warn(`ZodError: ${message}`);
    return res.status(400).json({
      cause: APIErrors.badRequestError,
      message: message,
    });
  }

  logger.error(`Unhandled Error: ${err.message}`, err);
  
  return res.status(500).json({
    cause: APIErrors.internalServerError,
    message: "Internal Server Error",
  });
};
