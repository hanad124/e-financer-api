import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// create transaction
export const createTransaction = async (req: Request, res: Response) => {
  const { title, description, amount, type, category, user } = req.body;

  try {
    const transaction = await prisma.transactions.create({
      data: {
        title,
        description,
        amount,
        type,
        categoryId: category,
        userId: user,
      },
    });

    return res.json({
      succuess: true,
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
  const { title, description, amount, type, category, user } = req.body;

  try {
    // find transaction
    const transaction = await prisma.transactions.findFirst({
      where: { id: id, userId: user },
    });

    if (!transaction) {
      return res.status(400).json({
        message: "Transaction not found",
        success: false,
      });
    }

    // update transaction
    const data = await prisma.transactions.update({
      where: { id: id, userId: user },
      data: {
        title,
        description,
        amount,
        type,
        categoryId: category,
      },
    });

    console.log("data: ", data);

    return res.json({
      succuess: true,
      message: "Transaction updated successfully",
      transaction: data,
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
  const { user } = req.body;

  try {
    // find transaction
    const transaction = await prisma.transactions.findFirst({
      where: { id: id, userId: user },
    });

    if (!transaction) {
      return res.status(400).json({
        message: "Transaction not found",
        success: false,
      });
    }

    // delete transaction
    await prisma.transactions.delete({
      where: { id: id, userId: user },
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
  const { user } = req.body;

  try {
    const transactions = await prisma.transactions.findMany({
      where: { userId: user },
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

// get transaction by id
export const getTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user } = req.body;

  try {
    const transaction = await prisma.transactions.findFirst({
      where: { id: id, userId: user },
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
  const { category, user } = req.body;

  try {
    const transactions = await prisma.transactions.findMany({
      where: { categoryId: category, userId: user },
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
