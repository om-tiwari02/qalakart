import type { Request, Response } from "express";
import { getAiResponse } from "./ai.service.js";

export async function aiChatController(req: Request, res: Response) {
  const content = await getAiResponse(req.body.message, req.body.imageBase64);
  return res.status(200).json({ success: true, data: { content } });
}
