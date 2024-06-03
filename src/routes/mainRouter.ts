import express from "express";
import { authRouter, categoryRouter } from ".";

const mainRouter = express.Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/categories", categoryRouter);

export default mainRouter;
