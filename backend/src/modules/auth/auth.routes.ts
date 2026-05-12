import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { loginController, logoutController, refreshController, registerController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

export const authRouter = Router();

authRouter.post("/register", validate({ body: registerSchema }), registerController);
authRouter.post("/login", validate({ body: loginSchema }), loginController);
authRouter.post("/refresh", refreshController);
authRouter.post("/logout", logoutController);

