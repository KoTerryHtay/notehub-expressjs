import { Request, Response, NextFunction } from "express";
import { getGroupByIdService } from "./group.service";
import { createError } from "../../utils/error";
import { errorCode } from "../../config/errorCode";
import { createErrorHelper } from "../../utils/createErrorHelper";

export const checkGroupExist = async (groupId: number) => {
  const group = await getGroupByIdService(+groupId);
  if (!group) {
    throw createErrorHelper.notFound(
      "This group does not exist",
      errorCode.notFound,
    );
  }
  return group;
};

export const checkGroupCreatePermission = async (
  groupId: number,
  adminId: number,
  memberId: number,
  next: NextFunction,
) => {
  const group = await checkGroupExist(groupId);

  const groupMainMember = group.members.find(
    (members) => members.id === adminId,
  );
  if (!groupMainMember) {
    return next(
      createError(
        "This user is not group member",
        401,
        errorCode.unauthenticated,
      ),
    );
  }

  const groupMemberAcc = group.members.find(
    (members) => members.id === memberId,
  );
  if (!groupMemberAcc) {
    return next(
      createError(
        "This user is not group member",
        401,
        errorCode.unauthenticated,
      ),
    );
  }

  if (groupMainMember.userId === groupMemberAcc.userId) {
    return next(
      createError("You cannot change your own role", 400, errorCode.invalid),
    );
  }

  const isGroupOwnerOrAdmin = ["OWNER", "ADMIN"].includes(groupMainMember.role);

  if (!isGroupOwnerOrAdmin) {
    return next(
      createError("This action is not allowed", 403, errorCode.unauthorized),
    );
  }
};

export const checkGroupUpdatePermission = async (
  groupId: number,
  userId: number,
  next: NextFunction,
) => {
  const group = await checkGroupExist(groupId);

  const isAllowNameChange =
    group.members.find((members) => members.id === userId)?.role !== "MEMBER";

  if (!isAllowNameChange) {
    return next(
      createError("This action is not allowed", 403, errorCode.unauthorized),
    );
  }
};
