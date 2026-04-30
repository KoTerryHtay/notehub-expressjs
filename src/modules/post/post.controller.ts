import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { createError } from "../../utils/error";
import { errorCode } from "../../config/errorCode";
import { CustomRequest } from "../../types";
import { getUserById } from "../auth/auth.service";
import {
  getAllPostsService,
  getPostByIdService,
  createPostService,
  updatePostService,
  deletePostService,
} from "./post.service";
import { Prisma } from "../../generated/prisma/client";

export const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const posts = await getAllPostsService();

  return res.status(200).json({
    message: "All Posts get successfully",
    posts,
  });
};

export const getPostById = [
  param("id", "Post ID is required").isInt({ gt: 0 }),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    // If validation error occurs
    if (errors.length > 0) {
      return next(createError(errors[0]!.msg, 400, errorCode.invalid));
    }

    const postId = +req.params.id!;

    const post = await getPostByIdService(postId);

    return res.status(200).json({
      message: `Post ${postId} Id get successfully`,
      post,
    });
  },
];

export const createPost = [
  body("content", "Content is required").trim().notEmpty().escape(),
  body("imageUrl", "image url is invalid").optional({ nullable: true }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    // If validation error occurs
    if (errors.length > 0) {
      return next(createError(errors[0]!.msg, 400, errorCode.invalid));
    }

    const { content, imageUrl } = req.body;

    console.log("req.body >>>", { content, imageUrl });

    const userId = req.userId;

    const user = await getUserById(userId!);
    if (!user) {
      return next(
        createError(
          "This user has not registered",
          401,
          errorCode.unauthenticated,
        ),
      );
    }

    const newPost: Prisma.PostCreateArgs = {
      data: {
        content,
        imageUrl: imageUrl ?? "https://picsum.photos/200/300",
        authorId: userId,
      },
    };

    const post = await createPostService(newPost);

    res.status(201).json({
      message: "Successfully created a new post",
      postId: post.id,
    });
  },
];

export const updatePost = [
  param("id", "Post ID is required").isInt({ gt: 0 }),

  body("content", "Content is required").trim().notEmpty().escape(),
  body("imageUrl", "image url is invalid").optional({ nullable: true }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    // If validation error occurs
    if (errors.length > 0) {
      return next(createError(errors[0]!.msg, 400, errorCode.invalid));
    }

    const { content, imageUrl } = req.body;
    const postId = +req.params.id!;

    console.log("req.body >>>", { postId, content, imageUrl });

    const userId = req.userId;

    const user = await getUserById(userId!);

    if (!user) {
      return next(
        createError(
          "This user has not registered",
          401,
          errorCode.unauthenticated,
        ),
      );
    }

    const post = await getPostByIdService(+postId);
    if (!post) {
      return next(
        createError("This post does not exist", 401, errorCode.invalid),
      );
    }

    if (user.id !== post.authorId) {
      return next(
        createError("This action is not allowed", 403, errorCode.unauthorized),
      );
    }

    const data: Prisma.PostUpdateArgs = {
      where: { id: postId, authorId: userId },
      data: {
        ...(content && { content }),
        ...(imageUrl && { imageUrl }),
      },
    };

    const postUpdated = await updatePostService(data);

    res.status(201).json({
      message: "Successfully updated the post",
      postId: post.id,
      post: postUpdated,
    });
  },
];

export const deletePost = [
  param("id", "Post ID is required").isInt({ gt: 0 }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    // If validation error occurs
    if (errors.length > 0) {
      return next(createError(errors[0]!.msg, 400, errorCode.invalid));
    }

    const postId = +req.params.id!;

    console.log("req.body >>>", { postId });

    const userId = req.userId!;

    const user = await getUserById(userId);

    if (!user) {
      return next(
        createError(
          "This user has not registered",
          401,
          errorCode.unauthenticated,
        ),
      );
    }

    const post = await getPostByIdService(+postId);
    if (!post) {
      return next(
        createError("This post does not exist", 401, errorCode.invalid),
      );
    }

    if (user.id !== post.authorId) {
      return next(
        createError("This action is not allowed", 403, errorCode.unauthorized),
      );
    }

    const postDeleted = await deletePostService(userId, postId);

    res.status(200).json({
      message: "Successfully deleted the post.",
      postId: postDeleted.id,
    });
  },
];
