import mongoose, { Schema, Model } from "mongoose";
import { IExpense, EXPENSE_CATEGORIES, PAYMENT_METHODS, EXPENSE_SOURCES } from "@/types";

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    category: {
      type: String,
      enum: {
        values: EXPENSE_CATEGORIES,
        message: "{VALUE} is not a valid expense category",
      },
      required: [true, "Category is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    month: {
      type: String,
      required: [true, "Month (YYYY-MM) is required"],
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: PAYMENT_METHODS,
        message: "{VALUE} is not a valid payment method",
      },
      required: false,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      enum: {
        values: EXPENSE_SOURCES,
        message: "{VALUE} is not a valid expense source",
      },
      default: "manual",
      required: [true, "Source is required"],
    },
    waMessageId: {
      type: String,
      required: false,
    },
    waIndex: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user + month queries and date queries
ExpenseSchema.index({ userId: 1, month: 1 });
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index(
  { waMessageId: 1, waIndex: 1 },
  { unique: true, partialFilterExpression: { waMessageId: { $type: "string" } } }
);
ExpenseSchema.index(
  { userId: 1, waMessageId: 1 },
  { partialFilterExpression: { waMessageId: { $type: "string" } } }
);

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
