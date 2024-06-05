import { Router } from "express";

import {
  createCategory,
  // createCategoryIcon,
  updateCategory,
  deleteCategory,
  // deleteCategoryIcon,
  getCategories,
  // getCategoryIcons,
  getCategoryById,
  // getCategoryIcon,
} from "../controllers/category";

import { isAuthenticated } from "../middlewares/authMiddleware";

const categoryRouter = Router();

categoryRouter.post("/", isAuthenticated, createCategory);
// categoryRouter.post("/icon", isAuthenticated, createCategoryIcon);
categoryRouter.patch("/:id", isAuthenticated, updateCategory);
categoryRouter.delete("/:id", isAuthenticated, deleteCategory);
// categoryRouter.delete("/icon/:id", isAuthenticated, deleteCategoryIcon);
categoryRouter.get("/", isAuthenticated, getCategories);
// categoryRouter.get("/icons", isAuthenticated, getCategoryIcons);
categoryRouter.get("/:id", isAuthenticated, getCategoryById);
// categoryRouter.get("/icon/:id", isAuthenticated, getCategoryIcon);

export { categoryRouter };
