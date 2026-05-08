import { Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { checkValidationError } from "../../utils/error";
import { ResponseHandler } from "../../utils/response";
import {
  getAllGroupPostsService,
  getGroupPostByIdService,
} from "./groupPost.service";
import { checkGroupExist, checkMemberExist } from "./group.rbac";
import { CustomRequest } from "../../types";
import { Prisma } from "../../generated/prisma/client";
import {
  createPostService,
  deletePostByAdminService,
  deletePostService,
  getPostByIdService,
  updatePostService,
} from "../post/post.service";
import { createErrorHelper } from "../../utils/createErrorHelper";
import { errorCode } from "../../config/errorCode";

export const getAllGroupPosts = [
  param("groupId", "Group ID is required").isInt({ gt: 0 }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const groupId = +req.params.groupId!;
    const userId = req.userId!;

    const group = await checkGroupExist(groupId);
    const groupPosts = await getAllGroupPostsService(group.id, userId);

    ResponseHandler.ok(res, groupPosts, "All group posts get successfully");
  },
];

export const getGroupPostById = [
  param("groupId", "Group ID is required").isInt({ gt: 0 }),
  param("postId", "Group ID is required").isInt({ gt: 0 }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const groupId = +req.params.groupId!;
    const postId = +req.params.postId!;
    const userId = req.userId!;

    const groupPost = await getGroupPostByIdService(groupId, postId, userId);

    ResponseHandler.ok(
      res,
      groupPost,
      `group post ${groupPost.id} get successfully`,
    );
  },
];

export const createGroupPost = [
  param("groupId", "Group ID is required").isInt({ gt: 0 }),

  body("content", "Content is required").trim().notEmpty().escape(),
  body("imageUrl", "image url is invalid").optional({ nullable: true }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const groupId = +req.params.groupId!;
    const userId = req.userId!;

    const { content, imageUrl } = req.body;

    console.log("req.body >>>", { content, imageUrl });

    const group = await checkGroupExist(groupId);
    await checkMemberExist(group, userId);

    const newPost: Prisma.PostCreateArgs = {
      data: {
        content,
        authorId: userId,
        groupId: group.id,
        imageUrl: imageUrl ?? "https://picsum.photos/200/300",
      },
    };
    const newGroupPosts = await createPostService(newPost);

    ResponseHandler.created(
      res,
      newGroupPosts,
      "created group posts successfully",
    );
  },
];

export const updateGroupPostById = [
  param("groupId", "Group ID is required").isInt({ gt: 0 }),
  param("postId", "Post ID is required").isInt({ gt: 0 }),

  body("content", "Content is required").trim().notEmpty().escape(),
  body("imageUrl", "image url is invalid").optional({ nullable: true }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const groupId = +req.params.groupId!;
    const postId = +req.params.postId!;
    const userId = req.userId!;

    const { content, imageUrl } = req.body;

    console.log("req.body >>>", { content, imageUrl, groupId, postId, userId });

    const group = await checkGroupExist(groupId);
    await checkMemberExist(group, userId);

    const post = await getPostByIdService(+postId);
    if (!post) {
      throw createErrorHelper.notFound(
        "This post does not exist",
        errorCode.notFound,
      );
    }

    if (userId !== post.authorId) {
      throw createErrorHelper.forbidden(
        "This action is not allowed",
        errorCode.unauthorized,
      );
    }

    const data: Prisma.PostUpdateArgs = {
      where: { id: postId, authorId: userId, groupId },
      data: {
        ...(content && { content }),
        ...(imageUrl && { imageUrl }),
      },
    };

    const postUpdated = await updatePostService(data);

    ResponseHandler.created(
      res,
      postUpdated,
      "Successfully updated the group post",
    );
  },
];

// deleteGroupPostById ( delete group post by owner or admin )
export const deleteGroupPostById = [
  param("groupId", "Group ID is required").isInt({ gt: 0 }),
  param("postId", "Post ID is required").isInt({ gt: 0 }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const groupId = +req.params.groupId!;
    const postId = +req.params.postId!;
    const userId = req.userId!;

    const group = await checkGroupExist(groupId);
    await checkMemberExist(group, userId);

    const post = await getPostByIdService(+postId);
    if (!post) {
      throw createErrorHelper.notFound(
        "This post does not exist",
        errorCode.notFound,
      );
    }

    const groupMainMember = group.members.find((m) => m.userId === userId);

    const isAdmin = ["OWNER", "ADMIN"].includes(groupMainMember!.role);
    console.log("isAdmin >>>", isAdmin);
    if (isAdmin) {
      const postDeleted = await deletePostByAdminService(postId);

      ResponseHandler.ok(
        res,
        postDeleted.id,
        "Successfully removed this post.",
      );
    }

    if (userId !== post.authorId) {
      throw createErrorHelper.forbidden(
        "This action is not allowed",
        errorCode.unauthorized,
      );
    }

    const postDeleted = await deletePostService(userId, postId);

    ResponseHandler.ok(res, postDeleted.id, "Successfully deleted the post.");
  },
];
