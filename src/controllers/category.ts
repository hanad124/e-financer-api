import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// create category
export const createCategory = async (req: Request, res: Response) => {
  const { name, icon, user } = req.body;

  try {
    const existingCategory = await prisma.category.findFirst({
      where: { name, userId: user },
    });

    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category already exists", success: false });
    }

    const category = await prisma.category.create({
      data: { name, iconId: icon, userId: user },
    });

    return res.json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      success: false,
      message: "Category creation failed",
    });
  } finally {
    await prisma.$disconnect();
  }
};

// update category
export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, icon, user } = req.body;

  try {
    // find category
    const category = await prisma.category.findFirst({
      where: { id: id, userId: user },
    });

    if (!category) {
      return res.status(400).json({
        message: "Category not found",
        success: false,
      });
    }

    // update category
    await prisma.category.update({
      where: { id: id, userId: user },
      data: {
        name,
        iconId: icon,
      },
    });

    return res.json({
      success: true,
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
  const { user } = req.body;

  try {
    // find category
    const category = await prisma.category.findFirst({
      where: { id: id, userId: user },
    });

    if (!category) {
      return res.status(400).json({
        message: "Category not found",
        success: false,
      });
    }

    // delete category
    await prisma.category.delete({
      where: { id: id, userId: user },
    });

    return res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

// get all categories
export const getCategories = async (req: Request, res: Response) => {
  const { user } = req.body;

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "user is required" });
  }

  try {
    const categories = await prisma.category.findMany({
      where: { userId: user },
      include: {
        icons: true, // Correct relation name
      },
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
  const { user } = req.body;

  try {
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: user,
      },
      include: {
        icons: true, // Correct relation name
      },
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    return res.json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

// create category icon
export const createCategoryIcon = async (req: Request, res: Response) => {
  const { name, icon } = req.body;

  try {
    const existingIcon = await prisma.icon.findFirst({
      where: { name },
    });

    if (existingIcon) {
      return res
        .status(400)
        .json({ message: "Icon already exists", success: false });
    }

    const categoryIcon = await prisma.icon.create({
      data: { name, icon },
    });

    return res.json({
      success: true,
      message: "Icon created successfully",
      categoryIcon,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      success: false,
      message: "Icon creation failed",
    });
  } finally {
    await prisma.$disconnect();
  }
};

// get all category icons
export const getCategoryIcons = async (req: Request, res: Response) => {
  console.log(req.body);
  try {
    const icons = await prisma.icon.findMany();

    if (icons.length === 0) {
      return res.json({ success: true, message: "No icons found" });
    }

    return res.json({
      success: true,
      icons,
      message: "Icons fetched successfully!",
    });
  } catch (error) {
    console.error("Error fetching icons:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

// get category icon by id
export const getCategoryIcon = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const icon = await prisma.icon.findFirst({
      where: {
        id: id,
      },
    });

    return res.json({ success: true, icon });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

// delete category icon
export const deleteCategoryIcon = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const icon = await prisma.icon.findFirst({
      where: { id: id },
    });

    if (!icon) {
      return res.status(400).json({
        message: "Icon not found",
        success: false,
      });
    }

    await prisma.icon.delete({
      where: { id: id },
    });

    return res.json({
      success: true,
      message: "Icon deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};
