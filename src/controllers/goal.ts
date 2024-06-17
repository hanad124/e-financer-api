import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const createGoal = async (req: Request, res: Response) => {
  const { name, amount, targetDate, goalType } = req.body;
  const token = req.header("authorization")?.split(" ")[1];

  // decode token
  const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);

  const userid = (decoded as any).id;

  console.log("userid", userid);

  try {
    const goal = await prisma.goal.create({
      data: {
        name,
        amount,
        targetDate: new Date(targetDate),
        goalType,
        userId: userid,
      },
    });

    console.log("goal", goal);
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
    console.error(error);
  }
};

// update goal
export const updateGoal = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, amount, targetDate, goalType } = req.body;

  const token = req.header("authorization")?.split(" ")[1];

  // decode token
  const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);

  const userid = (decoded as any).id;

  try {
    // check if goal exists
    const goal = await prisma.goal.findFirst({
      where: { id: id, userId: userid },
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
  const token = req.header("authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Decode token
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
  const userId = (decoded as any).id;

  try {
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        goalTransactions: {
          include: {
            transaction: true,
          },
        },
      },
    });

    // Check if goals exist
    if (goals.length === 0) {
      return res.status(404).json({
        message: "No goals found",
        success: false,
      });
    }

    // Track progress for each goal
    const trackedGoals = goals.map((goal) => {
      const totalAmount = goal.goalTransactions.reduce(
        (sum, goalTransaction) => {
          return sum + goalTransaction.transaction.amount;
        },
        0
      );

      const progress = (totalAmount / goal.amount) * 100;

      return { ...goal, totalAmount, progress };
    });

    return res.status(200).json({
      goals: trackedGoals,
      message: "Goals fetched successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch goals",
      success: false,
      error,
    });
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  const { id } = req.params;
  const token = req.header("authorization")?.split(" ")[1];

  // decode token
  const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);

  const userid = (decoded as any).id;
  try {
    // check if goal exists
    const goal = await prisma.goal.findFirst({
      where: { id: id, userId: userid },
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
  const token = req.header("authorization")?.split(" ")[1];

  // decode token
  const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);

  const userid = (decoded as any).id;
  try {
    const goal = await prisma.goal.findUnique({
      where: { id, userId: userid },
    });

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    let totalAmount = 0;

    if (goal.goalType === "INCOME") {
      const incomeResult = await prisma.transactions.aggregate({
        _sum: { amount: true },
        where: { userId: userid, type: "INCOME" },
      });

      totalAmount = incomeResult._sum.amount || 0;
    } else if (goal.goalType === "EXPENSE") {
      const expenseResult = await prisma.transactions.aggregate({
        _sum: { amount: true },
        where: { userId: userid, type: "EXPENSE" },
      });

      totalAmount = expenseResult._sum.amount || 0;
    } else if (goal.goalType === "SAVINGS") {
      const incomeResult = await prisma.transactions.aggregate({
        _sum: { amount: true },
        where: { userId: userid, type: "INCOME" },
      });

      const expenseResult = await prisma.transactions.aggregate({
        _sum: { amount: true },
        where: { userId: userid, type: "EXPENSE" },
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
