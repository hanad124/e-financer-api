import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import getUserId from "../helpers/getUserId";

const prisma = new PrismaClient();

// create budget
export const createBudget = async (req: Request, res: Response) => {
  const { name, amount, description, icon } = req.body;
  const userId = getUserId(req);

  try {
    const existingBudget = await prisma.budget.findFirst({
      where: { name, userId },
    });

    if (existingBudget) {
      return res
        .status(400)
        .json({ message: "Budget already exists", success: false });
    }

    const budget = await prisma.budget.create({
      data: {
        name,
        amount,
        leftToSpend: amount,
        description,
        icon:
          icon ||
          "https://img.icons8.com/?size=100&id=484&format=png&color=6957E7",
        userId,
      },
    });

    return res.json({
      success: true,
      message: "Budget created successfully!",
      budget,
    });
  } catch (error) {
    console.log("budget error: ", error);
    return res.status(500).json({
      error: "Internal Server Error",
      success: false,
      message: "Budget creation failed",
    });
  } finally {
    await prisma.$disconnect();
  }
};

// update budget
export const updateBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, amount, description, icon } = req.body;

    const userId = getUserId(req);

    const budget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
        success: false,
      });
    }

    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        name,
        amount,
        description,
        icon:
          icon ||
          "https://img.icons8.com/?size=100&id=484&format=png&color=6957E7",
        userId,
      },
    });

    return res.json({
      success: true,
      message: "Budget updated successfully!",
      budget: updatedBudget,
    });
  } catch (error) {
    console.log("budget error: ", error);
    return res.status(500).json({
      error: "Internal Server Error",
      success: false,
      message: "Budget update failed",
    });
  } finally {
    await prisma.$disconnect();
  }
};

// get all transactions
export const getBudgets = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        transactions: true,
      },
    });

    return res.json({
      success: true,
      message: "Budgets fetched successfully!",
      budgets,
    });
  } catch (error) {
    console.log("Budget error: ", error);
    return res.status(500).json({
      error: "Internal Server Error",
      success: false,
      message: "Budget fetch failed",
    });
  } finally {
    await prisma.$disconnect();
  }
};

// get single budget
export const getSingleBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    const budget = await prisma.budget.findFirst({
      where: { id, userId },
      include: {
        transactions: true,
      },
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
        success: false,
      });
    }

    return res.json({
      success: true,
      message: "Budget fetched successfully!",
      budget,
    });
  } catch (error) {
    console.log("Budget error: ", error);
    return res.status(500).json({
      error: "Internal Server Error",
      success: false,
      message: "Budget fetch failed",
    });
  } finally {
    await prisma.$disconnect();
  }
};

// delete budget
export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    const budget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
        success: false,
      });
    }

    await prisma.budget.delete({ where: { id } });

    return res.json({
      success: true,
      message: "Budget deleted successfully!",
    });
  } catch (error) {
    console.log("budget error: ", error);
    return res.status(500).json({
      error: "Internal Server Error",
      success: false,
      message: "Budget delete failed",
    });
  } finally {
    await prisma.$disconnect();
  }
};
