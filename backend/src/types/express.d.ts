import type { UserJwt } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: UserJwt;
    }
  }
}

export {};

