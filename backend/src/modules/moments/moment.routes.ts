import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { validate } from "../../middleware/validate.js";
import {
  addCommentController,
  createMomentController,
  listMomentsController,
  toggleLikeController
} from "./moment.controller.js";
import { addCommentSchema, createMomentSchema, momentIdSchema } from "./moment.schema.js";

export const momentRouter = Router();

momentRouter.get("/", listMomentsController);

momentRouter.use(requireAuth);

momentRouter.post("/", validate(createMomentSchema), createMomentController);
momentRouter.post("/:id/like", validate(momentIdSchema), toggleLikeController);
momentRouter.post("/:id/comment", validate(addCommentSchema), addCommentController);
