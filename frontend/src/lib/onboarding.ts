import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Income from "@/models/Income";
import Expense from "@/models/Expense";

export interface OnboardingState {
  showOnboarding: boolean;
  firstName: string;
}

export async function getOnboardingState(userId: string): Promise<OnboardingState> {
  await connectToDatabase();
  const userObjId = new mongoose.Types.ObjectId(userId);

  const user = await User.findById(userObjId)
    .select("onboardingCompletedAt name")
    .lean();

  const firstName = user?.name ? user.name.trim().split(" ")[0] : "there";

  if (user?.onboardingCompletedAt) {
    return { showOnboarding: false, firstName };
  }

  // Check in parallel if the user already has any income or expense
  const [hasIncome, hasExpense] = await Promise.all([
    Income.exists({ userId: userObjId }),
    Expense.exists({ userId: userObjId }),
  ]);

  if (hasIncome || hasExpense) {
    // Lazy backfill: user already has existing data, silently mark completed
    await User.updateOne(
      { _id: userObjId, onboardingCompletedAt: { $exists: false } },
      { $set: { onboardingCompletedAt: new Date() } }
    );
    return { showOnboarding: false, firstName };
  }

  return { showOnboarding: true, firstName };
}
