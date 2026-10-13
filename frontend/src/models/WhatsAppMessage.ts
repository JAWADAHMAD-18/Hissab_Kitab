import mongoose, { Schema, Model, Types } from "mongoose";

export interface IWhatsAppMessage {
  _id?: Types.ObjectId | string;
  messageId: string;
  userId?: Types.ObjectId | string;
  from: string;
  type: string;
  status: "processing" | "done";
  entryCount: number;
  summaryLines: string[];
  deletePendingUntil?: Date;
  deletedAt?: Date;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const WhatsAppMessageSchema = new Schema<IWhatsAppMessage>(
  {
    messageId: {
      type: String,
      required: [true, "messageId is required"],
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    from: {
      type: String,
      required: [true, "from is required"],
    },
    type: {
      type: String,
      required: [true, "type is required"],
    },
    status: {
      type: String,
      enum: ["processing", "done"],
      default: "processing",
    },
    entryCount: {
      type: Number,
      default: 0,
    },
    summaryLines: {
      type: [String],
      default: [],
    },
    deletePendingUntil: {
      type: Date,
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
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

WhatsAppMessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
WhatsAppMessageSchema.index({ userId: 1, createdAt: -1 });

const WhatsAppMessage: Model<IWhatsAppMessage> =
  mongoose.models.WhatsAppMessage ||
  mongoose.model<IWhatsAppMessage>("WhatsAppMessage", WhatsAppMessageSchema);

export default WhatsAppMessage;
