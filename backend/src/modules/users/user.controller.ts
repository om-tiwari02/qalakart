import type { Request, Response } from "express";
import { saveProfileImage } from "./user.service.js";

export async function updateProfileImageController(req: Request, res: Response) {
  const userId = req.user!.sub;
  const data = await saveProfileImage(userId, req.body.imageBase64);
  return res.status(200).json({ success: true, data });
}
