import mongoose, { Document, Schema, Types } from "mongoose";

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled"
}

export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  paymentMethod: 'online' | 'cod';
  paymentStatus: 'pending' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING
    },
    shippingAddress: { type: String, required: true },
    paymentMethod: { type: String, enum: ['online', 'cod'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' }
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
