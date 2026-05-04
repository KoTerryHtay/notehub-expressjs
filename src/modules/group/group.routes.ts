import express from "express";
import { auth } from "../../middlewares/auth";
import {
  changeRole,
  createGroup,
  getAllGroups,
  getAllMembers,
  getGroupById,
  joinGroup,
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

groupRoutes.get("/:id/members", auth, getAllMembers);

// change RBAC for Group
groupRoutes.patch("/:id/members/:memberId/role", auth, changeRole);

export default groupRoutes;
