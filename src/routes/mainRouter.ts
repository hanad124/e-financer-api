import express from "express";
import {
  authRouter,
  categoryRouter,
  transactionRouter,
  GoalRouter,
  budgetRouter,
} from ".";

const mainRouter = express.Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/categories", categoryRouter);
mainRouter.use("/transactions", transactionRouter);
mainRouter.use("/goals", GoalRouter);
mainRouter.use("/budgets", budgetRouter);

export default mainRouter;
