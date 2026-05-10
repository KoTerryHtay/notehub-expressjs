import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { errorCode } from "../../config/errorCode.js";
import {
  checkUserExistById,
  createUserService,
  getOwnInfo,
  getUserByEmail,
  getUserById,
  updateUserService,
} from "./auth.service.js";
import { Prisma } from "../../generated/prisma/client.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../../utils/generate.js";
import { CustomRequest } from "../../types/index.js";
import { checkValidationError } from "../../utils/error.js";
import { createErrorHelper } from "../../utils/createErrorHelper.js";
import { ResponseHandler } from "../../utils/response.js";

export const register = [
  body("email", "Invalid Email").trim().notEmpty().isEmail(),
  body("password", "Password must be 8 digits")
    .trim()
    .notEmpty()
    .matches(/^[0-9]+$/)
    .isLength({ min: 8, max: 8 }),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const { email, password } = req.body;
    console.log({ email, password });

    const user = await getUserByEmail(email);

    if (user) {
      throw createErrorHelper.conflict(
        "This email has already been registered",
        errorCode.userExist,
      );
    }

    // all is ok
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const randToken = "I will replace Refresh Token soon.";

    const userData: Prisma.UserCreateInput = {
      email,
      password: hashPassword,
      refreshToken: randToken,
    };

    const newUser = await createUserService(userData);

    console.log("newUser >>>", { id: newUser.id, email: newUser.email });

    const accessTokenPayload = { id: newUser.id };
    const refreshTokenPayload = { id: newUser.id, email: newUser.email };

    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 60 * 15,
      },
    );

    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "30d",
      },
    );

    // Updating refreshToken
    const userUpdateData: Prisma.UserUpdateInput = {
      refreshToken,
    };

    await updateUserService(newUser.id, userUpdateData);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
      })
      .status(201)
      .json({
        message: "Successfully created an account",
        userId: newUser.id,
      });
  },
];

export const login = [
  body("email", "Invalid Email").trim().notEmpty().isEmail(),
  body("password", "Password must be 8 digits")
    .trim()
    .notEmpty()
    .matches(/^[0-9]+$/)
    .isLength({ min: 8, max: 8 }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    // If validation error occurs
    if (errors.length > 0) {
      const error: any = new Error(errors[0]!.msg);
      error.status = 400;
      error.code = errorCode.invalid;

      return next(error);
    }

    const password = req.body.password;

    const email = req.body.email as string;

    const user = await getUserByEmail(email);
    if (!user) {
      throw createErrorHelper.unauthorized(
        "This email has not registered.",
        errorCode.unauthenticated,
      );
    }

    const isMatchPassword = await bcrypt.compare(password, user!.password);
    if (!isMatchPassword) {
      const error: any = new Error("wrongPassword");
      error.status = 401;
      error.code = errorCode.invalid;

      return next(error);
    }

    // all is ok
    const accessTokenPayload = { id: user!.id };
    const refreshTokenPayload = { id: user!.id, email: user!.email };

    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 60 * 15, // 15 min
      },
    );

    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "30d",
      },
    );

    const userData: Prisma.UserUpdateInput = {
      refreshToken,
    };

    await updateUserService(user!.id, userData);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 1 * 60 * 1000, // 1 minutes
        // maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
      })
      .status(200)
      .json({
        message: "Successfully Logged In.",
        userId: user!.id,
      });
  },
];

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // clear HttpOnly cookies
  // Update refreshToken in User Table
  const refreshToken = req.cookies ? req.cookies.refreshToken : null;
  console.log("refreshToken >>>", refreshToken);

  if (!refreshToken) {
    const error: any = new Error("You are not an authenticated user.");
    error.status = 401;
    error.code = errorCode.unauthenticated;
    return next(error);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
      id: number;
      email: string;
    };
  } catch (err) {
    const error: any = new Error("You are not an authenticated user.");
    error.status = 401;
    error.code = errorCode.unauthenticated;
    return next(error);
  }

  if (isNaN(decoded.id)) {
    const err: any = new Error("You are not an authenticated user.");
    err.status = 401;
    err.code = errorCode.unauthenticated;
    return next(err);
  }

  const user = await getUserById(decoded.id);
  if (!user) {
    throw createErrorHelper.unauthorized(
      "This email has not registered.",
      errorCode.unauthenticated,
    );
  }

  if (user!.email !== decoded.email) {
    const error: any = new Error("You are not an authenticated user.");
    error.status = 401;
    error.code = errorCode.unauthenticated;
    return next(error);
  }

  const userData: Prisma.UserUpdateInput = {
    refreshToken: generateToken(),
  };

  await updateUserService(user!.id, userData);

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    path: "/",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    path: "/",
  });

  res.status(200).json({
    message: "Successfully logged out. See you soon.",
  });
};

export const authCheck = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;
  // const user = await getUserById(userId!);
  // checkUserIfNotExist(user);
  const user = await checkUserExistById(userId!);
  const userInfo = await getOwnInfo(user.id);

  ResponseHandler.ok(res, userInfo, "You are authenticated.");
  // res.status(200).json({
  //   message: "You are authenticated.",
  //   userId: user.id,
  //   username: user.name,
  // });
};
