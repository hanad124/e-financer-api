import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const isOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = req.body.userid as string | undefined;

    console.log("currentUserId", currentUserId);

    if (!currentUserId) {
      console.log("no currentUserId");
      return res.sendStatus(403);
    }

    if (currentUserId !== req.params.id) {
      console.log("not owner");
      return res.sendStatus(403);
    }

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};


const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionToken =
      req.headers.authorization?.split(" ")[1] || req.cookies["token"];
    if (!sessionToken) {
      console.log("no session token");
      return res.status(401).send({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      sessionToken,
      process.env.JWT_SECRET as string
    ) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      console.log("no user");
      return res.status(401).send({ message: "Unauthorized" });
    }

    req.body.userid = user.id;

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export { isAuthenticated, isOwner };
