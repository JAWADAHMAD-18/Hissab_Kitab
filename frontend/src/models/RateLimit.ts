import mongoose, { Schema, Model, Types } from "mongoose";

export interface IRateLimit {
  _id?: Types.ObjectId | string;
  key: string;
  count: number;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const RateLimitSchema = new Schema<IRateLimit>(
  {
    key: {
      type: String,
      required: [true, "key is required"],
      unique: true,
      index: true,
    },
    count: {
      type: Number,
      required: true,
      default: 1,
    },
    expiresAt: {
      type: Date,
      required: [true, "expiresAt is required"],
    },
  },
  {
    timestamps: true,
  }
);

RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RateLimit: Model<IRateLimit> =
  mongoose.models.RateLimit ||
  mongoose.model<IRateLimit>("RateLimit", RateLimitSchema);

export default RateLimit;
