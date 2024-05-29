import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// create category
export const createCategory = async (req: Request, res: Response) => {
  const { name, color, icon, userId } = req.body;

  try {
    const existingCategory = await prisma.category.findFirst({
      where: { name, userId },
    });

    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category already exists", success: false });
    }

    const category = await prisma.category.create({
      data: { name, color, icon, userId: userId },
    });

    return res.json({
      succuess: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

// update category
export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, color, icon, userId } = req.body;

  try {
    const category = await prisma.category.update({
      where: { id: id, userId },
      data: { name, color, icon },
    });

    return res.json({
      succuess: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

// delete category
export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    await prisma.category.delete({
      where: {
        id: id,
        userId,
      },
    });

    return res.json({
      succuess: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

// get all categories
// export const getCategories = async (req: Request, res: Response) => {
//   const { userId } = req.body;
//   try {
//     const categories = await prisma.category.findMany({
//       where: { userId: userId },
//     });

//     console.log("categories", categories);

//     if (categories.length === 0)
//       return res.json({ succuess: true, message: "No categories found" });

//     return res.json({ succuess: true, categories });
//   } catch (error) {
//     return res.status(500).json({ error: "Internal Server Error" });
//   } finally {
//     await prisma.$disconnect();
//   }
// };

export const getCategories = async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "userId is required" });
  }

  try {
    const categories = await prisma.category.findMany({
      where: { userId: userId },
    });

    if (categories.length === 0) {
      return res.json({ success: true, message: "No categories found" });
    }

    return res.json({
      success: true,
      categories,
      message: "Categories fetched successfully!",
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

// get category by id
export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const category = await prisma.category.findFirst({
      where: {
        id: id,
        userId,
      },
    });

    return res.json({ succuess: true, category });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};
