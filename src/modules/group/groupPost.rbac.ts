import { errorCode } from "../../config/errorCode.js";
import { createErrorHelper } from "../../utils/createErrorHelper.js";
import { checkGroupExist } from "./group.rbac.js";

export const checkMemberPrivateGroup = async (
  groupId: number,
  userId: number,
) => {
  const group = await checkGroupExist(groupId);

  if (group.type === "PRIVATE") {
    const checkMember = group.members.find((m) => m.userId === userId);
    if (!checkMember) {
      throw createErrorHelper.forbidden(
        "You are not a group member ",
        errorCode.unauthorized,
      );
    }
  }

  return group;
};
