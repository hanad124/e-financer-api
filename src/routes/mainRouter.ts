import express from "express";
import { authRouter, categoryRouter, transactionRouter } from ".";

const mainRouter = express.Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/categories", categoryRouter);
mainRouter.use("/transactions", transactionRouter);

export default mainRouter;
