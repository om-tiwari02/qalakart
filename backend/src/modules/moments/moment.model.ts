import mongoose, { Document, Schema, Types } from "mongoose";

export interface IComment {
  userId: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IMoment extends Document {
  userId: Types.ObjectId;
  imageUrl: string;
  caption: string;
  likes: Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const momentSchema = new Schema<IMoment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    imageUrl: { type: String, required: true },
    caption: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema]
  },
  { timestamps: true }
);

export const Moment = mongoose.model<IMoment>("Moment", momentSchema);
