import { z } from "zod";

export const updateProfileImageSchema = {
  body: z.object({
    imageBase64: z
      .string()
      .regex(/^data:image\/(png|jpe?g|webp);base64,/, "Image must be PNG, JPG, or WEBP")
      .max(3_000_000, "Image must be smaller than 3MB")
  })
};
