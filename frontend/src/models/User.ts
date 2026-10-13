import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "@/types";

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    whatsappNumber: {
      type: String,
      required: false,
      trim: true,
    },
    whatsappVerified: {
      type: Boolean,
      default: false,
    },
    whatsappVerificationCode: {
      type: String,
      required: false,
      select: false,
    },
    whatsappVerificationExpiry: {
      type: Date,
      required: false,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ whatsappNumber: 1 }, { sparse: true });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
