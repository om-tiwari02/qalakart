import type { NextFunction, Request, Response } from "express";
import { verifyAccess } from "../utils/jwt.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    const err = new Error("Unauthorized") as Error & { statusCode?: number; code?: string };
    err.statusCode = 401;
    err.code = "UNAUTHORIZED";
    throw err;
  }

  const token = header.slice("Bearer ".length);
  try {
    req.user = verifyAccess(token);
    next();
  } catch (caught) {
    const isExpired = caught instanceof Error && caught.name === "TokenExpiredError";
    const err = new Error(isExpired ? "Token expired" : "Invalid token") as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 401;
    err.code = isExpired ? "TOKEN_EXPIRED" : "TOKEN_INVALID";
    throw err;
  }
}

