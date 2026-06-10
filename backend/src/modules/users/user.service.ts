import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "./user.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.resolve(__dirname, "../../../uploads/profiles");

const mimeToExt: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp"
};

export async function saveProfileImage(userId: string, imageBase64: string) {
  const match = imageBase64.match(/^data:(image\/(?:png|jpe?g|webp));base64,(.+)$/);
  if (!match) {
    const err = new Error("Invalid image format") as Error & { statusCode?: number; code?: string };
    err.statusCode = 400;
    err.code = "INVALID_IMAGE";
    throw err;
  }

  const mime = match[1]!;
  const payload = match[2]!;
  const ext = mimeToExt[mime]!;
  const buffer = Buffer.from(payload, "base64");

  if (buffer.length > 2_000_000) {
    const err = new Error("Image must be smaller than 2MB") as Error & { statusCode?: number; code?: string };
    err.statusCode = 400;
    err.code = "IMAGE_TOO_LARGE";
    throw err;
  }

  await fs.mkdir(uploadRoot, { recursive: true });

  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${safeUserId}-${Date.now()}.${ext}`;
  await fs.writeFile(path.join(uploadRoot, filename), buffer);

  const profileImage = `/uploads/profiles/${filename}`;

  if (!userId.startsWith("dev:")) {
    await User.findByIdAndUpdate(userId, { $set: { profileImage } }).exec();
  }

  return { profileImage };
}
