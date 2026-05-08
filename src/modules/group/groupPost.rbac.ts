import { errorCode } from "../../config/errorCode";
import { createErrorHelper } from "../../utils/createErrorHelper";
import { checkGroupExist } from "./group.rbac";

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
