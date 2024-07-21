import { Router } from "express";

import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getSingleBudget,
} from "../controllers/budget";

import { isAuthenticated } from "../middlewares/authMiddleware";

const budgetRouter = Router();

budgetRouter.get("/", isAuthenticated, getBudgets);
budgetRouter.post("/", isAuthenticated, createBudget);
budgetRouter.patch("/:id", isAuthenticated, updateBudget);
budgetRouter.delete("/:id", isAuthenticated, deleteBudget);
budgetRouter.get("/:id", isAuthenticated, getSingleBudget);

export { budgetRouter };
