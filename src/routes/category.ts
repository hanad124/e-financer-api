import { Router } from "express";

import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
} from "../controllers/category";

import { isAuthenticated } from "../middlewares/authMiddleware";

const router = Router();

router.post("/category", isAuthenticated, createCategory);
router.patch("/category/:id", isAuthenticated, updateCategory);
router.delete("/category/:id", isAuthenticated, deleteCategory);
router.get("/categories", isAuthenticated, getCategories);
router.get("/category/:id", isAuthenticated, getCategoryById);

export { router };
