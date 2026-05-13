import type { Request, Response } from "express";
import { createDemand, deleteDemand, getDemandById, getDemands } from "./demand.service.js";

export async function createDemandController(req: Request, res: Response) {
  const userId = req.user!._id;
  const demand = await createDemand(userId, req.body);
  return res.status(201).json({ success: true, data: demand });
}

export async function listDemandsController(req: Request, res: Response) {
  const demands = await getDemands(req.query);
  return res.status(200).json({ success: true, data: demands });
}

export async function getDemandController(req: Request, res: Response) {
  const demand = await getDemandById(req.params.id);
  return res.status(200).json({ success: true, data: demand });
}

export async function deleteDemandController(req: Request, res: Response) {
  const userId = req.user!._id;
  await deleteDemand(req.params.id, userId);
  return res.status(200).json({ success: true, data: { ok: true } });
}
