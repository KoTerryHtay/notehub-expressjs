import { GroupType, Prisma, RoleName } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

export const getAllGroupsService = () => {
  return prisma.group.findMany();
};

export const getGroupByIdService = (groupId: number, type?: GroupType) => {
  return prisma.group.findFirst({
    where: { id: groupId, ...(type && { type }) },
    include: { members: true },
  });
};

export const otherAdmin = (groupId: number, userId: number) => {
  return prisma.groupMember.findMany({
    where: {
      groupId,
      role: { in: ["ADMIN", "OWNER"] },
      NOT: { userId },
    },
  });
};

export const createGroupService = (data: Prisma.GroupCreateArgs) => {
  return prisma.group.create(data);
};

export const updateGroupService = (data: Prisma.GroupUpdateArgs) => {
  return prisma.group.update(data);
};

export const deleteGroupService = async (groupId: number) => {
  await prisma.groupMember.deleteMany({
    where: {
      groupId: groupId,
    },
  });

  return prisma.group.delete({
    where: { id: groupId },
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

export const createGroupMemberService = (groupId: number, userId: number) => {
  return prisma.groupMember.create({ data: { groupId, userId } });
};

export const updateGroupMemberService = (
  groupId: number,
  userId: number,
  role: RoleName,
) => {
  return prisma.groupMember.update({
    where: { userId_groupId: { groupId, userId } },
    data: { role },
  });
};

export const leaveGroupMemberService = (userId: number, groupId: number) => {
  return prisma.groupMember.delete({
    where: { userId_groupId: { userId, groupId } },
  });
};

export const removeGroupMemberByAdminService = (
  groupId: number,
  memberId: number,
) => {
  return prisma.groupMember.delete({
    where: {
      userId_groupId: { groupId, userId: memberId },
    },
  });
};

export const addGroupMemberByAdminService = (
  groupId: number,
  memberId: number,
) => {
  return createGroupMemberService(groupId, memberId);
};
