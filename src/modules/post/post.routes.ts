import express from "express";
import { auth } from "../../middlewares/auth";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  updatePost,
} from "./post.controller";

const postRoutes = express.Router();

postRoutes.get("/", getAllPosts);
postRoutes.get("/:id", getPostById);

postRoutes.post("/", auth, createPost);
postRoutes.patch("/:id", auth, updatePost);
postRoutes.delete("/:id", auth, deletePost);

export default postRoutes;
