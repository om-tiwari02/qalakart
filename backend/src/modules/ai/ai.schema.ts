import { z } from "zod";

export const aiChatSchema = {
  body: z.object({
    message: z.string().max(2000).optional().default(""),
    imageBase64: z.string().max(2_500_000).nullable().optional()
  })
};
