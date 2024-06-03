import { Router } from "express";

import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
} from "../controllers/category";

import { isAuthenticated } from "../middlewares/authMiddleware";

const categoryRouter = Router();

categoryRouter.post("/", isAuthenticated, createCategory);
categoryRouter.patch("/:id", isAuthenticated, updateCategory);
categoryRouter.delete("/:id", isAuthenticated, deleteCategory);
categoryRouter.get("/", isAuthenticated, getCategories);
categoryRouter.get("/:id", isAuthenticated, getCategoryById);

export { categoryRouter };
