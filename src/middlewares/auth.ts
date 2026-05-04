import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createError } from "../utils/error";
import { errorCode } from "../config/errorCode";
import { getUserById, updateUserService } from "../modules/auth/auth.service";
import { Prisma } from "../generated/prisma/client";
import { CustomRequest } from "../types";
import { createErrorHelper } from "../utils/createErrorHelper";

export const auth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.cookies ? req.cookies.accessToken : null;
  const refreshToken = req.cookies ? req.cookies.refreshToken : null;

  if (!refreshToken) {
    throw createErrorHelper.unauthorized(
      "You are not an authenticated user.",
      errorCode.unauthenticated,
    );
    // return next(
    //   createError(
    //     "You are not an authenticated user.",
    //     401,
    //     errorCode.unauthenticated,
    //   ),
    // );
  }

  const generateNewTokens = async () => {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
        id: number;
        email: string;
      };
    } catch (error) {
      return next(
        createError(
          "You are not an authenticated user.",
          401,
          errorCode.unauthenticated,
        ),
      );
    }

    if (isNaN(decoded.id)) {
      return next(
        createError(
          "You are not an authenticated user.",
          401,
          errorCode.unauthenticated,
        ),
      );
    }

    const user = await getUserById(decoded.id);
    if (!user) {
      return next(
        createError(
          "This account has not registered!",
          401,
          errorCode.unauthenticated,
        ),
      );
    }

    if (user.email !== decoded.email) {
      return next(
        createError(
          "You are not an authenticated user.",
          401,
          errorCode.unauthenticated,
        ),
      );
    }

    if (user.refreshToken !== refreshToken) {
      return next(
        createError(
          "You are not an authenticated user.",
          401,
          errorCode.unauthenticated,
        ),
      );
    }

    const accessTokenPayload = { id: user.id };
    const refreshTokenPayload = { id: user.id, phone: user.email };

    const newAccessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 60 * 15, // 15 min
      },
    );

    const newRefreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "30d",
      },
    );

    const userData: Prisma.UserUpdateInput = {
      refreshToken: newRefreshToken,
    };

    await updateUserService(user!.id, userData);

    res
      .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 1 * 60 * 1000, // 1 minutes
        // maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

    req.userId = user.id;
    next();
  };

  if (!accessToken) {
    await generateNewTokens();
  } else {
    //  -- Verify access token --
    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as {
        id: number;
      };

      if (isNaN(decoded.id)) {
        return next(
          createError(
            "You are not an authenticated user.",
            401,
            errorCode.unauthenticated,
          ),
        );
      }

      req.userId = decoded.id;

      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        generateNewTokens();
      } else {
        return next(
          createError("Access Token is invalid", 400, errorCode.attack),
        );
      }
    }
  }
};
