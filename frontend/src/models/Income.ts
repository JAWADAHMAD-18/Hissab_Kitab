import mongoose, { Schema, Model } from "mongoose";
import { IIncome, INCOME_SOURCES } from "@/types";

const IncomeSchema = new Schema<IIncome>(
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
    source: {
      type: String,
      enum: {
        values: INCOME_SOURCES,
        message: "{VALUE} is not a valid income source",
      },
      required: [true, "Source is required"],
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
    recurring: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user + month queries
IncomeSchema.index({ userId: 1, month: 1 });
IncomeSchema.index({ userId: 1, date: -1 });

const Income: Model<IIncome> =
  mongoose.models.Income || mongoose.model<IIncome>("Income", IncomeSchema);

export default Income;
