import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

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
