import express from "express";
import { auth } from "../../middlewares/auth";
import {
  createPost,
  deletePost,
  getAllPosts,
  getAllPostsByOwner,
  getAllPostsByUserId,
  getPostById,
  updatePost,
} from "./post.controller";

const postRoutes = express.Router();

postRoutes.get("/", getAllPosts);

// get posts of owner
postRoutes.get("/me", auth, getAllPostsByOwner);

// get posts of another user ( can get only public post )
postRoutes.get("/user/:userId/posts", getAllPostsByUserId);

postRoutes.post("/", auth, createPost);

postRoutes.get("/:id", getPostById);
postRoutes.patch("/:id", auth, updatePost);
postRoutes.delete("/:id", auth, deletePost);

// CRUD for Group Posts
// groupRoutes.get("/:id/posts", auth, getAllGroupPosts);
// groupRoutes.post("/:id/posts", auth, createGroupPost);
// groupRoutes.patch("/:id/posts/:postId", auth, updateGroupPostById);
// groupRoutes.delete("/:id/posts/:postId", auth, deleteGroupPostById);

export default postRoutes;
