import { Request, Response, NextFunction } from "express";
import { getGroupByIdService } from "./group.service";
import { createError } from "../../utils/error";
import { errorCode } from "../../config/errorCode";
import { createErrorHelper } from "../../utils/createErrorHelper";
import { GroupType, RoleName } from "../../generated/prisma/enums";
import { Prisma } from "../../generated/prisma/client";

type GroupProps = {
  members: {
    id: number;
    role: RoleName;
    joinedAt: Date;
    userId: number;
    groupId: number;
  }[];
} & {
  id: number;
  name: string;
  description: string | null;
  type: GroupType;
  createdAt: Date;
  updatedAt: Date;
};

export const checkGroupExist = async (groupId: number, type?: GroupType) => {
  const group = await getGroupByIdService(+groupId, type);
  if (!group) {
    throw createErrorHelper.notFound(
      "This group does not exist",
      errorCode.notFound,
    );
  }
  return group;
};

// export const checkGroupCreatePermission = async (
//   groupId: number,
//   adminId: number,
//   memberId: number,
// ) => {
//   const group = await checkGroupExist(groupId);

//   const groupMainMember = group.members.find(
//     (members) => members.userId === adminId,
//   );

//   if (!groupMainMember) {
//     throw createErrorHelper.unauthorized(
//       "This user is not group member",
//       errorCode.unauthenticated,
//     );
//   }

//   const groupMemberAcc = group.members.find(
//     (members) => members.userId === memberId,
//   );

//   if (!groupMemberAcc) {
//     throw createErrorHelper.unauthorized(
//       "This user is not group member",
//       errorCode.unauthenticated,
//     );
//   }

//   const isGroupOwnerOrAdmin = ["OWNER", "ADMIN"].includes(groupMainMember.role);

//   if (!isGroupOwnerOrAdmin) {
//     throw createErrorHelper.forbidden(
//       "This action is not allowed",
//       errorCode.unauthorized,
//     );
//   }

//   if (groupMainMember.userId === groupMemberAcc?.userId) {
//     throw createErrorHelper.badRequest(
//       "This action is not allowed",
//       errorCode.invalid,
//     );
//   }
// };

// TODO

export const checkGroupAdminPermission = async (
  groupId: number,
  adminId: number,
) => {
  const group = await checkGroupExist(groupId);

  const groupMainMember = group.members.find((m) => m.userId === adminId);

  if (!groupMainMember) {
    throw createErrorHelper.unauthorized(
      "This user is not group member",
      errorCode.unauthenticated,
    );
  }

  const isAdmin = ["OWNER", "ADMIN"].includes(groupMainMember.role);

  if (!isAdmin) {
    throw createErrorHelper.forbidden(
      "This action is not allowed",
      errorCode.unauthorized,
    );
  }

  return group;
};

export const checkMemberExist = async (
  adminId: number,
  memberId: number,
  group: GroupProps,
) => {
  const member = group.members.find((m) => m.userId === memberId);

  if (!member) {
    throw createErrorHelper.badRequest(
      "User is not in group",
      errorCode.invalid,
    );
  }

  if (adminId === memberId) {
    throw createErrorHelper.badRequest(
      "This action is not allowed",
      errorCode.invalid,
    );
  }
};

export const checkRemoveMemberPermission = async (
  groupId: number,
  adminId: number,
  memberId: number,
) => {
  const group = await checkGroupAdminPermission(groupId, adminId);

  const member = group.members.find((m) => m.userId === memberId);

  if (!member) {
    throw createErrorHelper.badRequest(
      "User is not in group",
      errorCode.invalid,
    );
  }

  if (adminId === memberId) {
    throw createErrorHelper.badRequest(
      "Cannot remove yourself",
      errorCode.invalid,
    );
  }
};

export const checkAddMemberPermission = async (
  groupId: number,
  adminId: number,
  memberId: number,
) => {
  const group = await checkGroupAdminPermission(groupId, adminId);

  const member = group.members.find((m) => m.userId === memberId);

  if (member) {
    throw createErrorHelper.badRequest(
      "User already in group",
      errorCode.invalid,
    );
  }
};
