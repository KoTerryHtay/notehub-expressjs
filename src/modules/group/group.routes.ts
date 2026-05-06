import express from "express";
import { auth } from "../../middlewares/auth";
import {
  addGroupMemberByAdmin,
  changeRole,
  createGroup,
  getAllGroups,
  getAllMembers,
  getGroupById,
  joinGroup,
  leaveGroup,
  removeGroupMemberByAdmin,
  updateGroup,
} from "./group.controller";

const groupRoutes = express.Router();

groupRoutes.get("/", getAllGroups);
groupRoutes.get("/:id", getGroupById);

groupRoutes.post("/", auth, createGroup);
groupRoutes.patch("/:id", auth, updateGroup);
// groupRoutes.delete("/:id", auth, deletePost);

// Join Group
groupRoutes.post("/:id/join", auth, joinGroup);

// leave from group
groupRoutes.delete("/:id/leave", auth, leaveGroup);

groupRoutes.get("/:id/members", auth, getAllMembers);

// remove user from group by admin or owner
groupRoutes.delete(
  "/:id/members/:memberId/remove",
  auth,
  removeGroupMemberByAdmin,
);

// add user to group by admin or owner
groupRoutes.post("/:id/members/:memberId/add", auth, addGroupMemberByAdmin);

// change RBAC for Group
groupRoutes.patch("/:id/members/:memberId/role", auth, changeRole);

export default groupRoutes;
