import type { Request, Response } from "express";
import { addComment, createMoment, getMoments, toggleLike } from "./moment.service.js";

export async function createMomentController(req: Request, res: Response) {
  const userId = req.user!._id;
  const moment = await createMoment(userId, req.body);
  return res.status(201).json({ success: true, data: moment });
}

export async function listMomentsController(_req: Request, res: Response) {
  const moments = await getMoments();
  return res.status(200).json({ success: true, data: moments });
}

export async function toggleLikeController(req: Request, res: Response) {
  const userId = req.user!._id;
  const moment = await toggleLike(req.params.id, userId);
  return res.status(200).json({ success: true, data: moment });
}

export async function addCommentController(req: Request, res: Response) {
  const userId = req.user!._id;
  const { text } = req.body;
  const moment = await addComment(req.params.id, userId, text);
  return res.status(200).json({ success: true, data: moment });
}
