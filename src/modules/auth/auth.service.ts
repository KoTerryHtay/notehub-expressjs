import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { createErrorHelper } from "../../utils/createErrorHelper";
import { errorCode } from "../../config/errorCode";

export const getOwnInfo = async (userId: number) => {
  const userInfo = await prisma.user.findFirst({
    where: { id: userId },
    include: {
      posts: true,
      memberships: true,
    },
  });
  return userInfo;
};

export const checkUserExistById = async (userId: number) => {
  const user = await getUserById(userId);
  if (!user) {
    throw createErrorHelper.unauthorized(
      "This user does not exist",
      errorCode.notFound,
    );
  }
  return user;
};

export const getUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const createUserService = (userData: Prisma.UserCreateInput) => {
  return prisma.user.create({
    data: userData,
  });
};

export const updateUserService = (
  id: number,
  userData: Prisma.UserUpdateInput,
) => {
  return prisma.user.update({
    where: { id },
    data: userData,
  });
};

export const getUserById = (id: number) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
};
