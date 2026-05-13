import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDemand extends Document {
  userId: Types.ObjectId;
  productName: string;
  description: string;
  category?: string;
  quantity: number;
  status: "open" | "fulfilled" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const demandSchema = new Schema<IDemand>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productName: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    quantity: { type: Number, required: true, default: 1 },
    status: {
      type: String,
      enum: ["open", "fulfilled", "closed"],
      default: "open"
    }
  },
  { timestamps: true }
);

export const Demand = mongoose.model<IDemand>("Demand", demandSchema);
