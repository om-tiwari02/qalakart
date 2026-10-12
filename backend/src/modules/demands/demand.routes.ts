import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { validate } from "../../middleware/validate.js";
import {
  createDemandController,
  deleteDemandController,
  getDemandController,
  listDemandsController,
  acceptDemandController
} from "./demand.controller.js";
import { createDemandSchema, getDemandSchema, acceptDemandSchema } from "./demand.schema.js";

export const demandRouter = Router();

demandRouter.get("/", listDemandsController);
demandRouter.get("/:id", validate(getDemandSchema), getDemandController);

demandRouter.use(requireAuth);

demandRouter.post("/", validate(createDemandSchema), createDemandController);
demandRouter.delete("/:id", validate(getDemandSchema), deleteDemandController);
demandRouter.post("/:id/accept", validate(acceptDemandSchema), acceptDemandController);
