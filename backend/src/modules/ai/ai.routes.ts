import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { aiChatController } from "./ai.controller.js";
import { aiChatSchema } from "./ai.schema.js";

export const aiRouter = Router();

aiRouter.post("/chat", validate(aiChatSchema), aiChatController);
