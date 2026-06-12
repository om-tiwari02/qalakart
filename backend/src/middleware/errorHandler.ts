import type { NextFunction, Request, Response } from "express";

type AppError = Error & { statusCode?: number; code?: string; fields?: Record<string, string[]> };

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  console.error("APP ERROR:", err);
  const status = err.statusCode ?? 500;
  const code = err.code ?? "INTERNAL_ERROR";
  const message = status >= 500 && !err.code ? "Internal server error" : err.message;

  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(err.fields ? { fields: err.fields } : {})
    }
  });
}

