import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const createGoal = async (req: Request, res: Response) => {
  const { name, amount, targetDate, icon } = req.body;
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

        // use default icon in the database if icon is not provided
        icon:
          icon ||
          "https://img.icons8.com/?size=100&id=20884&format=png&color=6957E7",

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
  const { name, amount, targetDate, icon } = req.body;

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
        icon:
          icon ||
          "https://img.icons8.com/?size=100&id=20884&format=png&color=6957E7",
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
    // Fetch goals for the user
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

    return res.json({
      success: true,
      message: "Goals fetched successfully",
      goals,
    });
  } catch (error) {
    return res.status(500).json({
      error: `Internal Server Error: ${error}`,
      success: false,
      message: `Failed to fetch goals: ${error}`,
    });
  } finally {
    await prisma.$disconnect();
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
