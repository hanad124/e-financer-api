import { Router } from "express";

import {
  register,
  login,
  getUserById,
  verifyEmailLink,
  verifyEmail,
  sendPasswordResetLink,
  resetPassword,
  updatePassword,
  updateEmail,
  getUserInfo,
} from "../controllers";

import { isAuthenticated, isOwner } from "../middlewares/authMiddleware";

const authRouter = Router();

authRouter.get("/users/:id", isAuthenticated, isOwner, getUserById);
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/verify-email-link", verifyEmailLink);
authRouter.post("/verifyemail", verifyEmail);
authRouter.get("/user-info", isAuthenticated, isOwner, getUserInfo);
authRouter.post("/send-password-reset-link", sendPasswordResetLink);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/update-password", isAuthenticated, isOwner, updatePassword);
authRouter.post("/auth/update-email", isAuthenticated, isOwner, updateEmail);

export { authRouter };
