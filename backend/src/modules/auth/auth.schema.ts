import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["buyer", "creator"]).default("buyer")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const verifyLoginOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "Enter the six-digit code")
});

export const googleLoginSchema = z.object({
  credential: z.string().min(1)
});

