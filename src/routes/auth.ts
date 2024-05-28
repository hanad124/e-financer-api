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

const router = Router();

router.get("/users/:id", isAuthenticated, isOwner, getUserById);
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/verify-email-link", verifyEmailLink);
router.post("/auth/verifyemail", verifyEmail);
router.get("/auth/user-info", isAuthenticated, isOwner, getUserInfo);
router.post("/auth/send-password-reset-link", sendPasswordResetLink);
router.post("/auth/reset-password", resetPassword);
router.post("/auth/update-password", isAuthenticated, isOwner, updatePassword);
router.post("/auth/update-email", isAuthenticated, isOwner, updateEmail);

export { router };
