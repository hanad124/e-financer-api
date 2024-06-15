import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createGoal = async (req: Request, res: Response) => {
  const { name, amount, targetDate, goalType, user } = req.body;

  try {
    const goal = await prisma.goal.create({
      data: {
        name,
        amount,
        targetDate: new Date(targetDate),
        goalType,
        userId: user,
      },
    });
    res.status(201).json({
      goal,
      message: "Goal created successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create goal",
      success: false,
    });
  }
};

// update goal
export const updateGoal = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, amount, targetDate, goalType, user } = req.body;

  try {
    // check if goal exists
    const goal = await prisma.goal.findFirst({
      where: { id: id, userId: user },
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
        success: false,
      });
    }

    await prisma.goal.update({
      where: { id: id },
      data: {
        name,
        amount,
        targetDate: new Date(targetDate),
        goalType,
      },
    });

    return res.status(200).json({
      message: "Goal updated successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update goal",
      success: false,
    });
  }
};

export const getGoals = async (req: Request, res: Response) => {
  const { user } = req.body;

  try {
    const goals = await prisma.goal.findMany({
      where: { userId: user },
    });

    // check if goals exist
    if (goals.length === 0) {
      return res.status(404).json({
        message: "No goals found",
        success: false,
      });
    }
    return res.status(200).json({
      goals,
      success: true,
      message: "Goals fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch goals",
      success: false,
    });
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user } = req.body;

  try {
    // check if goal exists
    const goal = await prisma.goal.findFirst({
      where: { id: id, userId: user },
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
        success: false,
      });
    }

    await prisma.goal.delete({
      where: { id: id },
    });
    return res.status(204).json({
      message: "Goal deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete goal",
      success: false,
    });
  }
};

export const trackGoalProgress = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user } = req.body;

  try {
    const goal = await prisma.goal.findUnique({
      where: { id, userId: user },
    });

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    let totalAmount = 0;

    if (goal.goalType === "INCOME") {
      const incomeResult = await prisma.transactions.aggregate({
        _sum: { amount: true },
        where: { userId: user, type: "INCOME" },
      });

      totalAmount = incomeResult._sum.amount || 0;
    } else if (goal.goalType === "EXPENSE") {
      const expenseResult = await prisma.transactions.aggregate({
        _sum: { amount: true },
        where: { userId: user, type: "EXPENSE" },
      });

      totalAmount = expenseResult._sum.amount || 0;
    } else if (goal.goalType === "SAVINGS") {
      const incomeResult = await prisma.transactions.aggregate({
        _sum: { amount: true },
        where: { userId: user, type: "INCOME" },
      });

      const expenseResult = await prisma.transactions.aggregate({
        _sum: { amount: true },
        where: { userId: user, type: "EXPENSE" },
      });

      const totalIncome = incomeResult._sum.amount || 0;
      const totalExpenses = expenseResult._sum.amount || 0;
      totalAmount = totalIncome - totalExpenses;
    }

    const progress = (totalAmount / goal.amount) * 100;

    return res.status(200).json({ goal, totalAmount, progress });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to track goal progress" });
  }
};
