import { AppError } from "./AppError";

export const createErrorHelper = {
  badRequest: (message = "Bad Request", code?: string) => {
    return new AppError(message, 400, code);
  },

  unauthorized: (message = "Unauthorized", code?: string) => {
    return new AppError(message, 401, code);
  },

  forbidden: (message = "Forbidden", code?: string) => {
    return new AppError(message, 403, code);
  },

  notFound: (message = "Not Found", code?: string) => {
    return new AppError(message, 404, code);
  },

  serverError: (message = "Internal Server Error", code?: string) => {
    return new AppError(message, 500, code);
  },

  conflict: (message = "Conflict", code?: string) => {
    return new AppError(message, 409, code);
  },
};
