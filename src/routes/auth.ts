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

const router = Router();

router.get("/users/:id", getUserById);
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/verify-email-link", verifyEmailLink);
router.get("/auth/verifyemail/:token", verifyEmail);
router.get("/auth/user-info", getUserInfo);
router.post("/auth/send-password-reset-link", sendPasswordResetLink);
router.post("/auth/reset-password", resetPassword);
router.post("/auth/update-password", updatePassword);
router.post("/auth/update-email", updateEmail);

export { router };
