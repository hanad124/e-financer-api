// utils/jobQueue.ts
import Queue from "bull";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const updateGoalsQueue = new Queue("updateGoals");

updateGoalsQueue.process(async (job, done) => {
  const { userId, amount } = job.data;
  try {
    // Get all ongoing goals for the user
    const goals = await prisma.goal.findMany({
      where: {
        userId: userId,
        achieved: false,
      },
    });

    // Prepare updates
    const goalUpdates = goals.map((goal) => {
      const remainingAmount = goal.amount - goal.savedAmount;
      const amountToAdd = Math.min(amount, remainingAmount);
      const newSavedAmount = goal.savedAmount + amountToAdd;
      const isAchieved = newSavedAmount >= goal.amount;

      return prisma.goal.update({
        where: { id: goal.id },
        data: {
          savedAmount: newSavedAmount,
          achieved: isAchieved,
          achievedDate: isAchieved ? new Date() : null,
        },
      });
    });

    // Execute all goal updates in parallel
    await Promise.all(goalUpdates);
    done();
  } catch (error) {
    done(new Error(`Failed to update goals: ${error.message}`));
  } finally {
    await prisma.$disconnect();
  }
});

export const addJobToQueue = (queueName: string, data: any) => {
  if (queueName === "updateGoals") {
    updateGoalsQueue.add(data);
  }
};
