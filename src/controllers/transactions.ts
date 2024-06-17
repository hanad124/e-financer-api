import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// create transaction
export const createTransaction = async (req: Request, res: Response) => {
  const { title, description, amount, type, category } = req.body;

  const token = req.header("authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);
  const userId = (decoded as any).id;

  try {
    const transaction = await prisma.transactions.create({
      data: {
        title,
        description,
        amount,
        type,
        categoryId: category,
        userId: userId,
      },
    });

    // Check if a goal exists with the same name as the transaction title
    const goal = await prisma.goal.findFirst({
      where: { name: title, userId: userId },
    });

    console.log("goal: ", goal);

    if (goal) {
      // Create GoalTransaction record
      const goalTransaction = await prisma.goalTransaction.create({
        data: {
          goalId: goal.id,
          transactionId: transaction.id,
        },
      });

      console.log("goalTransaction: ", goalTransaction);
    }

    return res.json({
      success: true,
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      success: false,
      message: "Transaction creation failed",
    });
  } finally {
    await prisma.$disconnect();
  }
};
// update transaction
export const updateTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, amount, type, category } = req.body;

  const token = req.header("authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);
  const userId = (decoded as any).id;

  try {
    // Find transaction
    const transaction = await prisma.transactions.findFirst({
      where: { id: id, userId: userId },
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
        success: false,
      });
    }

    // Update transaction
    const updatedTransaction = await prisma.transactions.update({
      where: { id: id },
      data: {
        title,
        description,
        amount,
        type,
        categoryId: category,
      },
    });

    // Check if a goal exists with the same name as the transaction title
    const goal = await prisma.goal.findFirst({
      where: { name: title, userId: userId },
    });

    if (goal) {
      // Check if a GoalTransaction already exists
      const goalTransaction = await prisma.goalTransaction.findFirst({
        where: {
          goalId: goal.id,
          transactionId: transaction.id,
        },
      });

      if (!goalTransaction) {
        // Create GoalTransaction record if it does not exist
        await prisma.goalTransaction.create({
          data: {
            goalId: goal.id,
            transactionId: transaction.id,
          },
        });
      }
    }

    return res.json({
      success: true,
      message: "Transaction updated successfully",
      transaction: updatedTransaction,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      success: false,
      message: "Transaction update failed",
    });
  } finally {
    await prisma.$disconnect();
  }
};

// delete transaction
export const deleteTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const token = req.header("authorization")?.split(" ")[1];

  // decode token
  const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);

  const userid = (decoded as any).id;
  try {
    // find transaction
    const transaction = await prisma.transactions.findFirst({
      where: { id: id, userId: userid },
    });

    if (!transaction) {
      return res.status(400).json({
        message: "Transaction not found",
        success: false,
      });
    }

    // delete transaction
    await prisma.transactions.delete({
      where: { id: id, userId: userid },
    });

    return res.json({
      succuess: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      success: false,
      message: "Transaction delete failed",
    });
  } finally {
    await prisma.$disconnect();
  }
};

// get all transactions
export const getTransactions = async (req: Request, res: Response) => {
  const token = req.header("authorization")?.split(" ")[1];

  // decode token
  const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);

  const userid = (decoded as any).id;

  console.log("userid: ", userid);
  try {
    const transactions = await prisma.transactions.findMany({
      where: { userId: userid },
      include: {
        category: true,
      },
    });

    console.log("transactions: ", transactions);

    return res.json({
      success: true,
      message: "Transactions fetched successfully",
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      success: false,
      message: "Transaction fetch failed",
    });
  } finally {
    await prisma.$disconnect();
  }
};

// get transaction by id
export const getTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const token = req.header("authorization")?.split(" ")[1];

  // decode token
  const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);

  const userid = (decoded as any).id;
  try {
    const transaction = await prisma.transactions.findFirst({
      where: { id: id, userId: userid },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      return res.status(400).json({
        message: "Transaction not found",
        success: false,
      });
    }

    return res.json({
      success: true,
      message: "Transaction fetched successfully",
      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      success: false,
      message: "Transaction fetch failed",
    });
  } finally {
    await prisma.$disconnect();
  }
};

// get transactions by category
export const getTransactionsByCategory = async (
  req: Request,
  res: Response
) => {
  const { category } = req.body;

  const token = req.header("authorization")?.split(" ")[1];

  // decode token
  const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);

  const userid = (decoded as any).id;

  try {
    const transactions = await prisma.transactions.findMany({
      where: { categoryId: category, userId: userid },
      include: {
        category: true,
      },
    });

    return res.json({
      success: true,
      message: "Transactions fetched successfully",
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      success: false,
      message: "Transaction fetch failed",
    });
  } finally {
    await prisma.$disconnect();
  }
};
