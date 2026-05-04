import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export const getAllPostsService = () => {
  return prisma.post.findMany({ where: { privacy: "PUBLIC" } });
};

export const getAllPostsByOwnerService = (userId: number) => {
  return prisma.user.findFirst({
    where: { id: userId },
    include: { posts: true },
  });
};

export const getAllPostsByUserService = (userId: number) => {
  return prisma.user.findFirst({
    where: { id: userId },
    include: {
      posts: {
        where: { privacy: "PUBLIC", groupId: null },
      },
    },
  });
};

export const getPostByIdService = (postId: number) => {
  return prisma.post.findFirst({
    where: { id: postId },
  });
};

export const createPostService = (postData: Prisma.PostCreateArgs) => {
  return prisma.post.create(postData);
};

export const updatePostService = (postData: Prisma.PostUpdateArgs) => {
  return prisma.post.update(postData);
};

export const deletePostService = (userId: number, postId: number) => {
  return prisma.post.delete({
    where: { id: postId, authorId: userId },
  });
};
