import express, { Request, Response } from "express";
import { auth } from "../../middlewares/auth.js";
import {
  createGroupPost,
  deleteGroupPostById,
  getAllGroupPosts,
  getGroupPostById,
  updateGroupPostById,
} from "./groupPost.controller.js";

const groupPostRoutes = express.Router({ mergeParams: true });

// CRUD for Group Posts ( /:groupId/posts )
groupPostRoutes.get("/", auth, getAllGroupPosts);
groupPostRoutes.get("/:postId", auth, getGroupPostById);
groupPostRoutes.post("/", auth, createGroupPost);
groupPostRoutes.patch("/:postId", auth, updateGroupPostById);
groupPostRoutes.delete("/:postId", auth, deleteGroupPostById);
// groupPostRoutes.delete(
//   "/:groupId/posts/:postId/admin",
//   auth,
//   deleteGroupPostByAdmin,
// );

export default groupPostRoutes;
