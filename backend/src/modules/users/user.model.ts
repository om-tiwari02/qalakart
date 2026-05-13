import mongoose, { Schema } from "mongoose";

export type UserRole = "buyer" | "creator" | "admin";

const refreshTokenSchema = new Schema(
  {
    tokenHash: { type: String, required: true },
    createdAt: { type: Date, required: true, default: () => new Date() }
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    profileImage: { type: String, required: false },
    bio: { type: String, required: false },
    role: { type: String, required: true, enum: ["buyer", "creator", "admin"], default: "buyer" },
    refreshToken: { type: refreshTokenSchema, required: false, default: null }
  },
  { timestamps: true }
);

export type UserSchema = mongoose.InferSchemaType<typeof userSchema>;
export type UserDoc = mongoose.HydratedDocument<UserSchema>;

export const User =
  (mongoose.models["User"] as mongoose.Model<UserSchema> | undefined) ??
  mongoose.model<UserSchema>("User", userSchema);

