import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export const getAllGroupsService = () => {
  return prisma.group.findMany();
};

export const getGroupByIdService = (id: number) => {
  return prisma.group.findFirst({
    where: { id },
    include: { members: true },
  });
};

export const createGroupService = (data: Prisma.GroupCreateArgs) => {
  return prisma.group.create(data);
};

export const updateGroupService = (data: Prisma.GroupUpdateArgs) => {
  return prisma.group.update(data);
};

export const deleteGroupService = (userId: number, groupId: number) => {
  return prisma.group.delete({
    where: { id: groupId, authorId: userId },
  });
};

export const getAllMembersService = (id: number) => {
  return prisma.group.findFirst({
    where: { id },
    select: { members: true },
  });
};

export const updateGroupRoleService = (data: Prisma.GroupUpdateArgs) => {
  return prisma.group.update(data);
};
