import mongoose, { Schema, Model } from "mongoose";
import { IBudget, BUDGET_CATEGORIES } from "@/types";

export { BUDGET_TOTAL, BUDGET_CATEGORIES } from "@/types";

const BudgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: true,
    },
    category: {
      type: String,
      enum: {
        values: BUDGET_CATEGORIES,
        message: "{VALUE} is not a valid budget category",
      },
      required: [true, "Category is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    scope: {
      type: String,
      enum: {
        values: ["from", "only"],
        message: "{VALUE} is not a valid budget scope",
      },
      required: [true, "Scope is required"],
    },
    month: {
      type: String,
      required: [true, "Month (YYYY-MM) is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index preventing duplicate budget definitions
BudgetSchema.index(
  { userId: 1, category: 1, scope: 1, month: 1 },
  { unique: true }
);

const Budget: Model<IBudget> =
  mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);

export default Budget;
