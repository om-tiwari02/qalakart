import type { Request, Response } from "express";

import { env } from "../../config/env.js";
import { verifyRefresh } from "../../utils/jwt.js";
import { cookies, login, logout, refreshSession, register } from "./auth.service.js";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(cookies.REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/v1/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export async function registerController(req: Request, res: Response) {
  const { user, accessToken, refreshToken } = await register(req.body);
  setRefreshCookie(res, refreshToken);
  return res.status(201).json({
    success: true,
    data: {
      accessToken,
      user: { id: String(user._id), email: user.email, role: user.role }
    }
  });
}

export async function loginController(req: Request, res: Response) {
  const { user, accessToken, refreshToken } = await login(req.body);
  setRefreshCookie(res, refreshToken);
  return res.status(200).json({
    success: true,
    data: {
      accessToken,
      user: { id: String(user._id), email: user.email, role: user.role }
    }
  });
}

export async function refreshController(req: Request, res: Response) {
  const presented = req.cookies?.[cookies.REFRESH_COOKIE_NAME];
  if (!presented) {
    const err = new Error("Refresh token missing") as Error & { statusCode?: number; code?: string };
    err.statusCode = 401;
    err.code = "REFRESH_TOKEN_INVALID";
    throw err;
  }

  const payload = verifyRefresh(presented);
  const { user, accessToken, refreshToken } = await refreshSession({
    userId: payload.sub,
    presentedRefreshToken: presented
  });

  setRefreshCookie(res, refreshToken);
  return res.status(200).json({
    success: true,
    data: {
      accessToken,
      user: { id: String(user._id), email: user.email, role: user.role }
    }
  });
}

export async function logoutController(req: Request, res: Response) {
  const presented = req.cookies?.[cookies.REFRESH_COOKIE_NAME];
  if (presented) {
    try {
      const payload = verifyRefresh(presented);
      await logout(payload.sub);
    } catch {
      // ignore
    }
  }

  res.clearCookie(cookies.REFRESH_COOKIE_NAME, { path: "/api/v1/auth/refresh" });
  return res.status(200).json({ success: true, data: { ok: true } });
}

