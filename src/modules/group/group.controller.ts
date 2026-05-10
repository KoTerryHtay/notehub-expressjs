import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { checkValidationError, createError } from "../../utils/error.js";
import { errorCode } from "../../config/errorCode.js";
import { CustomRequest } from "../../types/index.js";
import { getUserById } from "../auth/auth.service.js";

import { Prisma } from "../../generated/prisma/client.js";
import {
  addGroupMemberByAdminService,
  createGroupMemberService,
  createGroupService,
  deleteGroupService,
  getAllGroupsService,
  getAllMembersService,
  leaveGroupMemberService,
  otherAdmin,
  removeGroupMemberByAdminService,
  updateGroupRoleService,
  updateGroupService,
} from "./group.service.js";
import {
  checkAddMemberPermission,
  checkGroupAdminPermission,
  checkGroupExist,
  checkMemberExist,
  checkRemoveMemberPermission,
} from "./group.rbac.js";
import { ResponseHandler } from "../../utils/response.js";
import { createErrorHelper } from "../../utils/createErrorHelper.js";

export const getAllGroups = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const groups = await getAllGroupsService();

  ResponseHandler.ok(res, groups, "All Groups get successfully");
  // return res.status(200).json({
  //   message: "All Groups get successfully",
  //   groups,
  // });
};

export const getGroupById = [
  param("id", "Group ID is required").isInt({ gt: 0 }),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const groupId = +req.params.id!;

    const group = await checkGroupExist(groupId);

    ResponseHandler.ok(res, group, `Group ${groupId} Id get successfully`);
  },
];

export const createGroup = [
  body("name", "name is required").trim().notEmpty().escape(),
  body("description", "description is required"),
  body("type", "type is required")
    .optional()
    .isIn(["PUBLIC", "PRIVATE"])
    .withMessage("Invalid type selected"),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const { name, description, type } = req.body;
    console.log("req.body >>>", { name, description, type });

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

    const newGroup: Prisma.GroupCreateArgs = {
      data: {
        name,
        description,
        ...(type && { type }),
        members: {
          create: {
            role: "OWNER",
            userId: user.id,
          },
        },
      },
    };

    const group = await createGroupService(newGroup);

    ResponseHandler.created(res, group, "Successfully created a new group");
  },
];

export const updateGroup = [
  param("id", "Group ID is required").isInt({ gt: 0 }),

  body("name", "name is required").optional().trim().notEmpty().escape(),
  body("description", "description is required").optional(),
  body("type", "type is required")
    .optional()
    .isIn(["PUBLIC", "PRIVATE"])
    .withMessage("Invalid type selected"),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const { name, description, type } = req.body;
    const groupId = +req.params.id!;

    console.log("req.body >>>", { name, description, type });

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

    const group = await checkGroupAdminPermission(groupId, user.id);

    const data: Prisma.GroupUpdateArgs = {
      where: { id: group.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(type && { type }),
      },
    };

    const groupUpdated = await updateGroupService(data);

    res.status(201).json({
      message: "Successfully updated the group",
      groupId: groupUpdated.id,
      group: groupUpdated,
    });
  },
];

export const getAllMembers = [
  param("id", "Post ID is required").isInt({ gt: 0 }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const groupId = +req.params.id!;

    const group = await checkGroupExist(groupId);

    const members = await getAllMembersService(group.id);

    return res.status(200).json({
      message: "All Members get successfully",
      members,
    });
  },
];

export const changeRole = [
  param("id", "Group ID is required").isInt({ gt: 0 }),
  param("memberId", "Member ID is required").isInt({ gt: 0 }),
  body("role", "role is required")
    .isIn(["OWNER", "ADMIN", "MEMBER"])
    .withMessage("Invalid role selected"),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const { role } = req.body;
    const groupId = +req.params.id!;
    const memberId = +req.params.memberId!;

    console.log("req.body >>>", { memberId, role });

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

    // await checkGroupCreatePermission(groupId, user.id, memberId);
    const group = await checkGroupAdminPermission(groupId, user.id);
    await checkMemberExist(group, memberId, user.id);

    const data: Prisma.GroupUpdateArgs = {
      where: { id: groupId },
      data: {
        members: {
          update: {
            where: {
              id: memberId,
            },
            data: {
              role,
            },
          },
        },
      },
      // select: { members: { where: { id: groupMemberAcc.id } } },
    };

    const groupUpdated = await updateGroupRoleService(data);

    res.status(201).json({
      message: "Successfully updated the group role",
      groupId: groupUpdated.id,
      group: groupUpdated,
    });
  },
];

export const joinGroup = [
  param("id", "Group ID is required").isInt({ gt: 0 }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const groupId = +req.params.id!;
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

    const group = await checkGroupExist(groupId);

    const groupMember = group.members.find(
      (member) => member.userId === user.id,
    );

    if (!!groupMember) {
      return next(
        createError(
          "This user is already group member",
          400,
          errorCode.userExist,
        ),
      );
    }

    const newGroupMember = await createGroupMemberService(group.id, user.id);

    ResponseHandler.created(res, newGroupMember, "Successfully join the group");
  },
];

export const leaveGroup = [
  param("id", "Group ID is required").isInt({ gt: 0 }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const groupId = +req.params.id!;
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

    const group = await checkGroupExist(groupId);

    const groupMember = group.members.find(
      (member) => member.userId === user.id,
    );

    if (!groupMember) {
      throw createErrorHelper.badRequest(
        "This user is not already group member",
        errorCode.invalid,
      );
    }

    const otherAdminCounts = await otherAdmin(group.id, user.id);
    console.log("otherAdminCounts >>>", otherAdminCounts);
    if (groupMember.role === "OWNER" || otherAdminCounts.length === 0) {
      throw createErrorHelper.badRequest(
        "You are the only owner or admin. Please assign owner or admin role to another user first.",
        errorCode.invalid,
      );
    }

    // const data: Prisma.GroupUpdateArgs = {
    //   where: { id: groupId },
    //   data: {
    //     members: {
    //       delete: { userId_groupId: { userId: user.id, groupId: group.id } },
    //     },
    //   },
    // };

    console.log(groupMember.id, group.id);
    const groupUpdated = await leaveGroupMemberService(
      groupMember.userId,
      group.id,
    );

    ResponseHandler.ok(res, groupUpdated.id, "Successfully leave the group");
  },
];

export const removeGroupMemberByAdmin = [
  param("id", "Group ID is required").isInt({ gt: 0 }),
  param("memberId", "Member ID is required").isInt({ gt: 0 }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const groupId = +req.params.id!;
    const memberId = +req.params.memberId!;

    const adminId = req.userId;

    console.log("req >>>", { groupId, memberId, adminId });

    const admin = await getUserById(adminId!);
    const member = await getUserById(memberId!);
    // console.log("admin >>>", admin);
    // console.log("member >>>", member);

    if (!admin || !member) {
      return next(
        createError(
          "This user has not registered",
          401,
          errorCode.unauthenticated,
        ),
      );
    }

    // await checkGroupCreatePermission(groupId, admin.id, member.id);
    await checkRemoveMemberPermission(groupId, admin.id, member.id);

    const removedGroupMember = await removeGroupMemberByAdminService(
      groupId,
      member.id,
    );

    ResponseHandler.ok(
      res,
      removedGroupMember.id,
      "Successfully removed this member",
    );
  },
];

export const addGroupMemberByAdmin = [
  param("id", "Group ID is required").isInt({ gt: 0 }),
  param("memberId", "Member ID is required").isInt({ gt: 0 }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const groupId = +req.params.id!;
    const memberId = +req.params.memberId!;

    const adminId = req.userId;

    console.log("req >>>", { groupId, memberId, adminId });

    const admin = await getUserById(adminId!);
    const member = await getUserById(memberId!);
    // console.log("admin >>>", admin);
    // console.log("member >>>", member);

    if (!admin || !member) {
      return next(
        createError(
          "This user has not registered",
          401,
          errorCode.unauthenticated,
        ),
      );
    }

    // await checkGroupCreatePermission(groupId, admin.id, member.id);
    await checkAddMemberPermission(groupId, admin.id, member.id);

    const addedGroupMember = await addGroupMemberByAdminService(
      groupId,
      member.id,
    );

    ResponseHandler.ok(
      res,
      addedGroupMember.id,
      "Successfully added this member",
    );
  },
];

export const deleteGroup = [
  param("id", "Group ID is required").isInt({ gt: 0 }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    checkValidationError(errors, next);

    const groupId = +req.params.id!;
    const userId = req.userId!;

    const group = await checkGroupExist(groupId);
    await checkGroupAdminPermission(group.id, userId, ["OWNER"]);
    const deletedGroup = await deleteGroupService(group.id);

    ResponseHandler.ok(
      res,
      deletedGroup.id,
      `Delete group ${deletedGroup.id} Id successfully`,
    );
  },
];
