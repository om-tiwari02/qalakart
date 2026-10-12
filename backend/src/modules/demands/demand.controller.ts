import type { Request, Response } from "express";
import { createDemand, deleteDemand, getDemandById, getDemands, acceptDemand } from "./demand.service.js";

export async function createDemandController(req: Request, res: Response) {
  const userId = req.user!.sub;
  const demand = await createDemand(userId, req.body);
  return res.status(201).json({ success: true, data: demand });
}

export async function listDemandsController(req: Request, res: Response) {
  const demands = await getDemands(req.query);
  return res.status(200).json({ success: true, data: demands });
}

export async function getDemandController(req: Request, res: Response) {
  const demand = await getDemandById(req.params['id'] as string);
  return res.status(200).json({ success: true, data: demand });
}

export async function deleteDemandController(req: Request, res: Response) {
  const userId = req.user!.sub;
  await deleteDemand(req.params['id'] as string, userId);
  return res.status(200).json({ success: true, data: { ok: true } });
}

export async function acceptDemandController(req: Request, res: Response) {
  const creatorId = req.user!.sub;
  const id = req.params['id'];
  const { price } = req.body;
  const demand = await acceptDemand(id as string, creatorId, price);
  return res.status(200).json({ success: true, data: demand });
}
