import mongoose, { Schema, Model, Types } from "mongoose";

export interface IPasswordResetToken {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  tokenHash: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: true,
    },
    tokenHash: {
      type: String,
      required: [true, "tokenHash is required"],
      unique: true,
      index: true,
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

PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetToken: Model<IPasswordResetToken> =
  mongoose.models.PasswordResetToken ||
  mongoose.model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema);

export default PasswordResetToken;
