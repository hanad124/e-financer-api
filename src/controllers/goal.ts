import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail";

import { initializeApp, applicationDefault } from "firebase-admin/app";
// import { getMessaging } from "firebase-admin/messaging";

process.env.GOOGLE_APPLICATION_CREDENTIALS;
initializeApp({
  credential: applicationDefault(),
  projectId: "e-financer",
});

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
    console.log("goal error", error);
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

    // get user by id
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send email notification to user if goal is achieved or exceeded the target date
    goals.forEach(async (goal) => {
      const savedAmount = goal.goalTransactions.reduce(
        (acc, curr) => acc + curr.transaction.amount,
        0
      );

      if (goal.achieved && !goal.emailSent) {
        console.log("Goal achieved");
        await sendEmail({
          user: user,
          emailType: "goalAchieved",
          props: { savedAmount, goalAmount: goal.amount },
        });

        // Update goal to mark email as sent
        await prisma.goal.update({
          where: { id: goal.id },
          data: { emailSent: true },
        });
      } else if (!goal.achieved && goal.targetDate < new Date()) {
        console.log("Goal not achieved");
        await sendEmail({
          user: user,
          emailType: "goalNotAchieved",
          props: { savedAmount, goalAmount: goal.amount },
        });

        // Update goal to mark email as sent
        await prisma.goal.update({
          where: { id: goal.id },
          data: { emailSent: true },
        });
      }
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

// send notification to user
// export const sendNotification = async (req: Request, res: Response) => {
//   const { title, body } = req.body;
//   const token = req.header("authorization")?.split(" ")[1];

//   // decode token
//   const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);

//   const userid = (decoded as any).id;

//   try {
//     // get user device token
//     const user = await prisma.user.findFirst({
//       where: { id: userid },
//     });

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//         success: false,
//       });
//     }

//     const recievedToken = req.body.fcmToken;

//     const message = {
//       notification: {
//         title,
//         body,
//       },
//       // token: ,
//     };

//     const messaging = getMessaging()
//     .send(message)
//     .then((response) => {
//       return res.status(200).json({
//         message: "Notification sent successfully",
//         success: true,
//         token: recievedToken,
//       });
//     })
//   } catch (error) {
//     return res.status(500).json({
//       message: "Failed to send notification",
//       success: false,
//     });
//   }
// };
