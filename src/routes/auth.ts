import { Router } from "express";

import {
  register,
  login,
  getUserById,
  verifyEmailLink,
  verifyOTP,
  sendPasswordResetLink,
  resetPassword,
  updatePassword,
  updateEmail,
  getUserInfo,
  updateProfile,
  savePushToken,
} from "../controllers";

import { isAuthenticated, isOwner } from "../middlewares/authMiddleware";

const authRouter = Router();

authRouter.get("/users/:id", isAuthenticated, isOwner, getUserById);
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/verify-email-link", verifyEmailLink);
authRouter.post("/verify-otp", verifyOTP);
authRouter.get("/user-info", isAuthenticated, getUserInfo);
authRouter.post("/send-password-reset-link", sendPasswordResetLink);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/update-password", isAuthenticated, updatePassword);
authRouter.post("/update-email", isAuthenticated, updateEmail);
authRouter.patch("/update-profile", isAuthenticated, updateProfile);
authRouter.post("/save-push-token", isAuthenticated, savePushToken);

export { authRouter };
