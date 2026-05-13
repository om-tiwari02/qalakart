import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  userId: Types.ObjectId;
  rating?: number;
  delivery?: string;
  creatorName?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true },
    images: [{ type: String }],
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, default: 0 },
    delivery: { type: String },
    creatorName: { type: String },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });

export const Product = mongoose.model<IProduct>("Product", productSchema);
