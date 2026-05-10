import { NextFunction } from "express";
import { ValidationError } from "express-validator";
import { errorCode } from "../config/errorCode.js";
import { createErrorHelper } from "./createErrorHelper.js";

export const createError = (message: string, status: number, code: string) => {
  const error: any = new Error(message);
  error.status = status;
  error.code = code;
  return error;
};

export const checkValidationError = (
  errors: ValidationError[],
  next: NextFunction,
) => {
  if (errors.length > 0) {
    throw createErrorHelper.badRequest(errors[0]!.msg, errorCode.invalid);
    // return next(createError(errors[0]!.msg, 400, errorCode.invalid));
  }
};
