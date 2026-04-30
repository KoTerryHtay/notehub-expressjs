import express from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import postRoutes from "../modules/post/post.routes.js";

const router = express.Router();

router.use("/api", authRoutes);
router.use("/api/posts", postRoutes);

export default router;
