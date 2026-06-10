import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { validate } from "../../middleware/validate.js";
import { updateProfileImageController } from "./user.controller.js";
import { updateProfileImageSchema } from "./user.schema.js";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.patch("/me/profile-image", validate(updateProfileImageSchema), updateProfileImageController);
