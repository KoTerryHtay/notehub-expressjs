import express from "express";
import { authCheck, login, logout, register } from "./auth.controller.js";
import { auth, guestOnlyMiddleware } from "../../middlewares/auth.js";

const authRoutes = express.Router();

authRoutes.post("/register", guestOnlyMiddleware, register);
authRoutes.post("/login", guestOnlyMiddleware, login);
authRoutes.post("/logout", logout);

// Add later
// authRoutes.post("/change-password", changePassword);
// authRoutes.post("/change-username", changeUserName);
// authRoutes.post("/change-email", changeEmail);

authRoutes.get("/auth-check", auth, authCheck);

export default authRoutes;
