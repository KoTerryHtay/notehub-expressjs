import { errorCode } from "../../config/errorCode";
import { prisma } from "../../lib/prisma";
import { createErrorHelper } from "../../utils/createErrorHelper";
import { checkMemberPrivateGroup } from "./groupPost.rbac";

export const getAllGroupPostsService = async (
  groupId: number,
  userId: number,
) => {
  const group = await checkMemberPrivateGroup(groupId, userId);

  return prisma.group.findFirst({
    where: { id: group.id },
    include: { posts: true },
  });
};

export const getGroupPostByIdService = async (
  groupId: number,
  postId: number,
  userId: number,
) => {
  const group = await checkMemberPrivateGroup(groupId, userId);

  const post = await prisma.post.findFirst({
    where: { id: postId, groupId: group.id },
  });

  if (!post) {
    throw createErrorHelper.notFound(
      "This post does not exist",
      errorCode.notFound,
    );
  }

  return post;
};
