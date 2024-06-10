import { Router } from "express";
import {
  createGoal,
  getGoals,
  deleteGoal,
  updateGoal,
  trackGoalProgress,
} from "../controllers/goal";
import { isAuthenticated } from "../middlewares/authMiddleware";

const GoalRouter = Router();

GoalRouter.post("/", isAuthenticated, createGoal);
GoalRouter.patch("/:id", isAuthenticated, updateGoal);
GoalRouter.get("/", isAuthenticated, getGoals);
GoalRouter.delete("/:id", isAuthenticated, deleteGoal);
GoalRouter.post("/track/:id", isAuthenticated, trackGoalProgress);

export { GoalRouter };
