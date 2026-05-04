import { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  return res.status(status).json({
    success: false,
    message,
    error: err.code || "UNKNOWN_ERROR",
    ...(process.env.NODE_ENV === "development" && { error: err }),
  });
};
