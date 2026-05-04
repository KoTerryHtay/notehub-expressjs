import { Response } from "express";

// type ApiResponse<T> = {
//   success: boolean;
//   message?: string;
//   data?: T;
//   error?: any;
// };

type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

type ApiError = {
  success: false;
  message: string;
  error?: unknown;
};

export const ResponseHandler = {
  ok: <T>(
    res: Response,
    data: T,
    message: string = "OK",
  ): Response<ApiSuccess<T>> => {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  },

  created: <T>(
    res: Response,
    data: T,
    message: string = "Created",
  ): Response<ApiSuccess<T>> => {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  },

  noContent: (res: Response): Response => {
    return res.status(204).send();
  },

  badRequest: (
    res: Response,
    message: string = "Bad Request",
  ): Response<ApiError> => {
    return res.status(400).json({
      success: false,
      message,
    });
  },

  unauthorized: (
    res: Response,
    message: string = "Unauthorized",
  ): Response<ApiError> => {
    return res.status(401).json({
      success: false,
      message,
    });
  },

  forbidden: (
    res: Response,
    message: string = "Forbidden",
  ): Response<ApiError> => {
    return res.status(403).json({
      success: false,
      message,
    });
  },

  notFound: (
    res: Response,
    message: string = "Not Found",
  ): Response<ApiError> => {
    return res.status(404).json({
      success: false,
      message,
    });
  },

  serverError: (
    res: Response,
    message: string = "Internal Server Error",
  ): Response<ApiError> => {
    return res.status(500).json({
      success: false,
      message,
    });
  },

  error: (
    res: Response,
    message: string = "Error",
    status: number = 500,
    error?: unknown,
  ): Response<ApiError> => {
    return res.status(status).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === "development" && { error }),
    });
  },
};
