import type { Request, Response } from "express";

import { env } from "../../config/env.js";
import { verifyRefresh } from "../../utils/jwt.js";
import { cookies, googleLogin, login, logout, refreshSession, register, requestLoginOtp, verifyLoginOtp } from "./auth.service.js";

function serializeUser(user: {
  _id: unknown;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
}) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return {
    id: String(user._id),
    email: user.email,
    role: user.role,
    name: name || user.email.split("@")[0],
    profileImage: user.profileImage || ""
  };
}

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
  const { user } = await register(req.body);
  const result = await requestLoginOtp(user.email);
  return res.status(202).json({
    success: true,
    data: {
      otpRequired: true,
      email: result.email,
      expiresInSeconds: result.expiresInSeconds
    }
  });
}

export async function loginController(req: Request, res: Response) {
  const result = await login(req.body);
  return res.status(202).json({
    success: true,
    data: {
      otpRequired: true,
      email: result.email,
      expiresInSeconds: result.expiresInSeconds
    }
  });
}

export async function verifyLoginOtpController(req: Request, res: Response) {
  const { user, accessToken, refreshToken } = await verifyLoginOtp(req.body);
  setRefreshCookie(res, refreshToken);
  return res.status(200).json({
    success: true,
    data: {
      accessToken,
      user: serializeUser(user)
    }
  });
}

export async function googleLoginController(req: Request, res: Response) {
  const { user } = await googleLogin(req.body.credential);
  const result = await requestLoginOtp(user.email);
  return res.status(202).json({
    success: true,
    data: {
      otpRequired: true,
      email: result.email,
      expiresInSeconds: result.expiresInSeconds
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
      user: serializeUser(user)
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

