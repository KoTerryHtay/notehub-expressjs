import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { checkValidationError } from "../../utils/error";
import { errorCode } from "../../config/errorCode";
import { CustomRequest } from "../../types";
import { checkUserExistById, getUserById } from "../auth/auth.service";
import {
  getAllPostsService,
  getPostByIdService,
  createPostService,
  updatePostService,
  deletePostService,
  getAllPostsByUserService,
  getAllPostsByOwnerService,
} from "./post.service";
import { Prisma } from "../../generated/prisma/client";
import { ResponseHandler } from "../../utils/response";
import { createErrorHelper } from "../../utils/createErrorHelper";

export const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const posts = await getAllPostsService();

  ResponseHandler.ok(res, posts, "All Posts get successfully");
};

export const getPostById = [
  param("id", "Post ID is required").isInt({ gt: 0 }),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const postId = +req.params.id!;

    const post = await getPostByIdService(postId);

    ResponseHandler.ok(res, post, `Post ${postId} Id get successfully`);
  },
];

export const getAllPostsByOwner = [
  // param("id", "User ID is required").isInt({ gt: 0 }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // const errors = validationResult(req).array({ onlyFirstError: true });

    // checkValidationError(errors, next);

    const userId = +req.userId!;

    const checkUser = await checkUserExistById(userId);

    const user = await getAllPostsByOwnerService(checkUser.id);
    if (!user?.posts) {
      throw createErrorHelper.notFound(
        "This user do not have any post",
        errorCode.notFound,
      );
    }

    ResponseHandler.ok(res, user.posts, `Your posts get successfully`);
  },
];

export const getAllPostsByUserId = [
  param("userId", "User ID is required").isInt({ gt: 0 }),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const userId = +req.params.userId!;

    const checkUser = await checkUserExistById(userId);

    const user = await getAllPostsByUserService(checkUser.id);
    console.log(user);
    if (!user?.posts) {
      throw createErrorHelper.notFound(
        "This user do not have any post",
        errorCode.notFound,
      );
    }

    ResponseHandler.ok(
      res,
      user.posts,
      `All Posts from ${user.id}Id get successfully`,
    );
  },
];

export const createPost = [
  body("content", "Content is required").trim().notEmpty().escape(),
  body("imageUrl", "image url is invalid").optional({ nullable: true }),
  body("privacy", "privacy is invalid")
    .optional()
    .isIn(["PUBLIC", "PRIVATE"])
    .withMessage("Invalid type selected"),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const { content, imageUrl, privacy } = req.body;

    console.log("req.body >>>", { content, imageUrl, privacy });

    const userId = req.userId;

    const user = await getUserById(userId!);
    if (!user) {
      throw createErrorHelper.unauthorized(
        "This user has not registered",
        errorCode.unauthenticated,
      );
      // return next(
      //   createError(
      //     "This user has not registered",
      //     401,
      //     errorCode.unauthenticated,
      //   ),
      // );
    }

    const newPost: Prisma.PostCreateArgs = {
      data: {
        content,
        imageUrl: imageUrl ?? "https://picsum.photos/200/300",
        authorId: userId,
        ...(privacy && { privacy }),
      },
    };

    const post = await createPostService(newPost);

    ResponseHandler.created(res, post, "Successfully created a new post");
  },
];

export const updatePost = [
  param("id", "Post ID is required").isInt({ gt: 0 }),

  body("content", "Content is required").trim().notEmpty().escape(),
  body("imageUrl", "image url is invalid").optional({ nullable: true }),
  body("privacy", "privacy is invalid")
    .optional()
    .isIn(["PUBLIC", "PRIVATE"])
    .withMessage("Invalid type selected"),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const { content, imageUrl, privacy } = req.body;
    const postId = +req.params.id!;

    console.log("req.body >>>", { postId, content, imageUrl, privacy });

    const userId = req.userId;

    const user = await getUserById(userId!);

    if (!user) {
      throw createErrorHelper.unauthorized(
        "This user has not registered",
        errorCode.unauthenticated,
      );
    }

    const post = await getPostByIdService(+postId);
    if (!post) {
      throw createErrorHelper.notFound(
        "This post does not exist",
        errorCode.notFound,
      );
    }

    if (user.id !== post.authorId) {
      throw createErrorHelper.forbidden(
        "This action is not allowed",
        errorCode.unauthorized,
      );
    }

    const data: Prisma.PostUpdateArgs = {
      where: { id: postId, authorId: userId },
      data: {
        ...(content && { content }),
        ...(imageUrl && { imageUrl }),
        ...(privacy && { privacy }),
      },
    };

    const postUpdated = await updatePostService(data);

    ResponseHandler.created(res, postUpdated, "Successfully updated the post");
  },
];

export const deletePost = [
  param("id", "Post ID is required").isInt({ gt: 0 }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const postId = +req.params.id!;

    console.log("req.body >>>", { postId });

    const userId = req.userId!;

    const user = await getUserById(userId);

    if (!user) {
      throw createErrorHelper.unauthorized(
        "This user has not registered",
        errorCode.unauthenticated,
      );
    }

    const post = await getPostByIdService(+postId);
    if (!post) {
      throw createErrorHelper.notFound(
        "This post does not exist",
        errorCode.notFound,
      );
    }

    if (user.id !== post.authorId) {
      throw createErrorHelper.forbidden(
        "This action is not allowed",
        errorCode.unauthorized,
      );
    }

    const postDeleted = await deletePostService(userId, postId);

    ResponseHandler.ok(res, postDeleted.id, "Successfully deleted the post.");
  },
];
