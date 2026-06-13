import { z } from "zod";

export const createMomentSchema = z.object({
  body: z.object({
    imageUrl: z.string().url("Invalid Image URL"),
    caption: z.string().min(3, "Caption must be at least 3 characters"),
  }),
});

export const addCommentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Moment ID"),
  }),
  body: z.object({
    text: z.string().min(1, "Comment cannot be empty"),
  }),
});

export const momentIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Moment ID"),
  }),
});
