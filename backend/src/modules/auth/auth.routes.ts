import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import {
  googleLoginController,
  loginController,
  logoutController,
  refreshController,
  registerController,
  verifyLoginOtpController
} from "./auth.controller.js";
import { googleLoginSchema, loginSchema, registerSchema, verifyLoginOtpSchema } from "./auth.schema.js";

export const authRouter = Router();

authRouter.post("/register", validate({ body: registerSchema }), registerController);
authRouter.post("/login", validate({ body: loginSchema }), loginController);
authRouter.post("/login/verify-otp", validate({ body: verifyLoginOtpSchema }), verifyLoginOtpController);
authRouter.post("/google", validate({ body: googleLoginSchema }), googleLoginController);
authRouter.post("/refresh", refreshController);
authRouter.post("/logout", logoutController);

