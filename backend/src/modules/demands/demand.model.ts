import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDemand extends Document {
  userId: Types.ObjectId;
  productName: string;
  description: string;
  category?: string;
  quantity: number;
  status: "open" | "accepted" | "fulfilled" | "closed";
  images: string[];
  creatorId?: Types.ObjectId;
  price?: number;
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
      enum: ["open", "accepted", "fulfilled", "closed"],
      default: "open"
    },
    images: [{ type: String }],
    creatorId: { type: Schema.Types.ObjectId, ref: "User" },
    price: { type: Number, min: 0 }
  },
  { timestamps: true }
);

export const Demand = mongoose.model<IDemand>("Demand", demandSchema);
