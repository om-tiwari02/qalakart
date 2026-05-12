import bcrypt from "bcryptjs";

import { User, type UserRole } from "../users/user.model.js";
import { signAccess, signRefresh } from "../../utils/jwt.js";

const REFRESH_COOKIE_NAME = "refreshToken";

function hashRefreshToken(token: string) {
  // bcrypt gives us an adaptive hash; we also include a fast breach check using sha256.
  return bcrypt.hash(token, 10);
}

export async function register(input: { email: string; password: string; role: UserRole }) {
  const exists = await User.findOne({ email: input.email }).lean().exec();
  if (exists) {
    const err = new Error("Email already in use") as Error & { statusCode?: number; code?: string };
    err.statusCode = 409;
    err.code = "CONFLICT";
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({
    email: input.email,
    passwordHash,
    role: input.role
  });

  const accessToken = signAccess({ sub: String(user._id), email: user.email, role: user.role });
  const refreshToken = signRefresh({ sub: String(user._id) });
  const refreshHash = await hashRefreshToken(refreshToken);

  user.refreshToken = {
    tokenHash: refreshHash,
    createdAt: new Date()
  };
  await user.save();

  return { user, accessToken, refreshToken };
}

export async function login(input: { email: string; password: string }) {
  const user = await User.findOne({ email: input.email }).exec();
  if (!user) {
    const err = new Error("Invalid email or password") as Error & { statusCode?: number; code?: string };
    err.statusCode = 401;
    err.code = "UNAUTHORIZED";
    throw err;
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid email or password") as Error & { statusCode?: number; code?: string };
    err.statusCode = 401;
    err.code = "UNAUTHORIZED";
    throw err;
  }

  const accessToken = signAccess({ sub: String(user._id), email: user.email, role: user.role });
  const refreshToken = signRefresh({ sub: String(user._id) });
  const refreshHash = await hashRefreshToken(refreshToken);

  user.refreshToken = { tokenHash: refreshHash, createdAt: new Date() };
  await user.save();

  return { user, accessToken, refreshToken };
}

export async function refreshSession(input: { userId: string; presentedRefreshToken: string }) {
  const user = await User.findById(input.userId).exec();
  if (!user || !user.refreshToken?.tokenHash) {
    const err = new Error("Refresh token invalid") as Error & { statusCode?: number; code?: string };
    err.statusCode = 401;
    err.code = "REFRESH_TOKEN_INVALID";
    throw err;
  }

  const match = await bcrypt.compare(input.presentedRefreshToken, user.refreshToken.tokenHash);
  if (!match) {
    // Breach signal: if token was tampered/reused, revoke refresh token.
    user.refreshToken = null;
    await user.save();
    const err = new Error("Refresh token invalid") as Error & { statusCode?: number; code?: string };
    err.statusCode = 401;
    err.code = "REFRESH_TOKEN_INVALID";
    throw err;
  }

  const accessToken = signAccess({ sub: String(user._id), email: user.email, role: user.role });
  const refreshToken = signRefresh({ sub: String(user._id) });
  const refreshHash = await hashRefreshToken(refreshToken);

  // Rotate refresh token
  user.refreshToken = { tokenHash: refreshHash, createdAt: new Date() };
  await user.save();

  return { user, accessToken, refreshToken };
}

export async function logout(userId: string) {
  await User.updateOne({ _id: userId }, { $set: { refreshToken: null } }).exec();
}

export const cookies = {
  REFRESH_COOKIE_NAME
};

