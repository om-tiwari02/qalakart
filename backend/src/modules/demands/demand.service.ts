import { Demand, IDemand } from "./demand.model.js";

export async function createDemand(userId: string, data: Partial<IDemand>) {
  return Demand.create({ ...data, userId });
}

export async function getDemands(filter: any = {}) {
  return Demand.find(filter).sort({ createdAt: -1 }).populate("userId", "firstName lastName").exec();
}

export async function getDemandById(id: string) {
  const demand = await Demand.findById(id).populate("userId", "firstName lastName").exec();
  if (!demand) {
    const err = new Error("Demand not found") as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }
  return demand;
}

export async function deleteDemand(id: string, userId: string) {
  const demand = await Demand.findOneAndDelete({ _id: id, userId }).exec();
  if (!demand) {
    const err = new Error("Demand not found or unauthorized") as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }
  return demand;
}
