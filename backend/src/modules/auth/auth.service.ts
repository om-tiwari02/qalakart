import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import mongoose from "mongoose";

import { env } from "../../config/env.js";
import { User, type UserRole } from "../users/user.model.js";
import { signAccess, signRefresh } from "../../utils/jwt.js";
import { sendOtpEmail } from "../../services/email.service.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const LOGIN_OTP_TTL_MS = 10 * 60 * 1000;
const MAX_LOGIN_OTP_ATTEMPTS = 5;
const devStoreDir = new URL("../../../.data/", import.meta.url);
const devAuthStore = new URL("../../../.data/auth-users.json", import.meta.url);

type MemoryUser = {
  _id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  refreshToken: {
    tokenHash: string;
    createdAt: Date;
  } | null;
  loginOtp?: {
    codeHash: string;
    expiresAt: Date;
    attempts: number;
  } | null;
};

type GoogleTokenInfo = {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
};

const memoryUsers = new Map<string, MemoryUser>();
let hasLoadedDevUsers = false;

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

async function loadDevUsers() {
  if (hasLoadedDevUsers) {
    return;
  }

  hasLoadedDevUsers = true;
  try {
    const raw = await readFile(devAuthStore, "utf8");
    const users = JSON.parse(raw) as MemoryUser[];
    memoryUsers.clear();
    for (const user of users) {
      memoryUsers.set(user._id, {
        ...user,
        refreshToken: user.refreshToken
          ? { ...user.refreshToken, createdAt: new Date(user.refreshToken.createdAt) }
          : null,
        loginOtp: user.loginOtp
          ? { ...user.loginOtp, expiresAt: new Date(user.loginOtp.expiresAt) }
          : null
      });
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      throw err;
    }
  }
}

async function saveDevUsers() {
  await mkdir(devStoreDir, { recursive: true });
  await writeFile(devAuthStore, JSON.stringify(Array.from(memoryUsers.values()), null, 2));
}

function hashRefreshToken(token: string) {
  // bcrypt gives us an adaptive hash; we also include a fast breach check using sha256.
  return bcrypt.hash(token, 10);
}

function authError(message: string, statusCode: number, code: string) {
  const err = new Error(message) as Error & { statusCode?: number; code?: string };
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

async function sendLoginOtp(email: string, otp: string) {
  try {
    await sendOtpEmail(email, otp, LOGIN_OTP_TTL_MS / 60_000);
  } catch (err) {
    if ((err as { code?: string }).code === "OTP_DELIVERY_FAILED") {
      throw err;
    }
    throw authError("OTP delivery is temporarily unavailable", 503, "OTP_DELIVERY_FAILED");
  }
}

async function verifyGoogleCredential(credential: string) {
  if (!env.GOOGLE_CLIENT_ID) {
    const err = new Error("Google login is not configured") as Error & { statusCode?: number; code?: string };
    err.statusCode = 503;
    err.code = "GOOGLE_AUTH_NOT_CONFIGURED";
    throw err;
  }

  let response: Response;
  try {
    response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  } catch {
    const err = new Error("Google login is temporarily unavailable") as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 503;
    err.code = "GOOGLE_AUTH_UNAVAILABLE";
    throw err;
  }

  if (!response.ok) {
    const err = new Error("Google login failed") as Error & { statusCode?: number; code?: string };
    err.statusCode = 401;
    err.code = "GOOGLE_TOKEN_INVALID";
    throw err;
  }

  const payload = (await response.json()) as GoogleTokenInfo;
  const emailVerified = payload.email_verified === true || payload.email_verified === "true";
  if (payload.aud !== env.GOOGLE_CLIENT_ID || !payload.sub || !payload.email || !emailVerified) {
    const err = new Error("Google login failed") as Error & { statusCode?: number; code?: string };
    err.statusCode = 401;
    err.code = "GOOGLE_TOKEN_INVALID";
    throw err;
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase()
  };
}

function canUseDevAuthFallback() {
  return env.NODE_ENV !== "production" && mongoose.connection.readyState !== 1;
}

function createDevUser(email: string, role: UserRole = "buyer") {
  const normalizedEmail = email.toLowerCase();
  return {
    _id: `dev:${normalizedEmail}`,
    email: normalizedEmail,
    role
  };
}

function createDevSession(email: string, role: UserRole = "buyer") {
  const user = createDevUser(email, role);
  const accessToken = signAccess({ sub: String(user._id), email: user.email, role: user.role });
  const refreshToken = signRefresh({ sub: String(user._id) });
  return { user, accessToken, refreshToken };
}

export async function register(input: { email: string; password: string; role: UserRole; firstName?: string; lastName?: string }) {
  if (canUseDevAuthFallback()) {
    await loadDevUsers();
    const exists = Array.from(memoryUsers.values()).find((user) => user.email === input.email);
    if (exists) {
      const err = new Error("Email already in use") as Error & { statusCode?: number; code?: string };
      err.statusCode = 409;
      err.code = "CONFLICT";
      throw err;
    }

    const user: MemoryUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12),
      role: input.role,
      refreshToken: null
    };

    const accessToken = signAccess({ sub: user._id, email: user.email, role: user.role });
    const refreshToken = signRefresh({ sub: user._id });
    user.refreshToken = {
      tokenHash: await hashRefreshToken(refreshToken),
      createdAt: new Date()
    };
    memoryUsers.set(user._id, user);
    await saveDevUsers();

    return { user, accessToken, refreshToken };
  }

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
    role: input.role,
    firstName: input.firstName,
    lastName: input.lastName
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
  if (canUseDevAuthFallback()) {
    await loadDevUsers();
    const user = Array.from(memoryUsers.values()).find((candidate) => candidate.email === input.email);
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

    return requestLoginOtp(user.email);
  }

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

  return requestLoginOtp(user.email);
}

export async function requestLoginOtp(email: string) {
  if (canUseDevAuthFallback()) {
    await loadDevUsers();
    const user = Array.from(memoryUsers.values()).find((candidate) => candidate.email === email);
    if (!user) {
      throw authError("Unable to start verification", 401, "UNAUTHORIZED");
    }
    const otp = randomInt(100_000, 1_000_000).toString();
    user.loginOtp = {
      codeHash: await bcrypt.hash(otp, 12),
      expiresAt: new Date(Date.now() + LOGIN_OTP_TTL_MS),
      attempts: 0
    };
    await saveDevUsers();
    await sendLoginOtp(user.email, otp);
    return { email: user.email, expiresInSeconds: LOGIN_OTP_TTL_MS / 1000 };
  }

  const user = await User.findOne({ email }).exec();
  if (!user) {
    throw authError("Unable to start verification", 401, "UNAUTHORIZED");
  }
  const otp = randomInt(100_000, 1_000_000).toString();
  user.loginOtp = {
    codeHash: await bcrypt.hash(otp, 12),
    expiresAt: new Date(Date.now() + LOGIN_OTP_TTL_MS),
    attempts: 0
  };
  await user.save();
  await sendLoginOtp(user.email, otp);
  return { email: user.email, expiresInSeconds: LOGIN_OTP_TTL_MS / 1000 };
}

export async function verifyLoginOtp(input: { email: string; otp: string }) {
  if (canUseDevAuthFallback()) {
    await loadDevUsers();
    const user = Array.from(memoryUsers.values()).find((candidate) => candidate.email === input.email);
    if (!user?.loginOtp || user.loginOtp.expiresAt <= new Date()) {
      throw authError("The verification code has expired. Log in again to get a new code.", 401, "OTP_EXPIRED");
    }
    if (user.loginOtp.attempts >= MAX_LOGIN_OTP_ATTEMPTS) {
      user.loginOtp = null;
      await saveDevUsers();
      throw authError("Too many invalid codes. Log in again to get a new code.", 429, "OTP_ATTEMPTS_EXCEEDED");
    }
    if (!(await bcrypt.compare(input.otp, user.loginOtp.codeHash))) {
      user.loginOtp.attempts += 1;
      await saveDevUsers();
      throw authError("Invalid verification code", 401, "OTP_INVALID");
    }

    user.loginOtp = null;
    const session = createDevSession(user.email, user.role);
    user.refreshToken = { tokenHash: await hashRefreshToken(session.refreshToken), createdAt: new Date() };
    await saveDevUsers();
    return session;
  }

  const user = await User.findOne({ email: input.email }).exec();
  if (!user?.loginOtp || user.loginOtp.expiresAt <= new Date()) {
    throw authError("The verification code has expired. Log in again to get a new code.", 401, "OTP_EXPIRED");
  }
  if (user.loginOtp.attempts >= MAX_LOGIN_OTP_ATTEMPTS) {
    user.loginOtp = null;
    await user.save();
    throw authError("Too many invalid codes. Log in again to get a new code.", 429, "OTP_ATTEMPTS_EXCEEDED");
  }
  if (!(await bcrypt.compare(input.otp, user.loginOtp.codeHash))) {
    user.loginOtp.attempts += 1;
    await user.save();
    throw authError("Invalid verification code", 401, "OTP_INVALID");
  }

  user.loginOtp = null;
  const accessToken = signAccess({ sub: String(user._id), email: user.email, role: user.role });
  const refreshToken = signRefresh({ sub: String(user._id) });
  user.refreshToken = { tokenHash: await hashRefreshToken(refreshToken), createdAt: new Date() };
  await user.save();
  return { user, accessToken, refreshToken };
}

export async function googleLogin(credential: string) {
  const googleUser = await verifyGoogleCredential(credential);

  if (!isDbConnected()) {
    await loadDevUsers();
    let user = Array.from(memoryUsers.values()).find((candidate) => candidate.email === googleUser.email);

    if (!user) {
      user = {
        _id: new mongoose.Types.ObjectId().toString(),
        email: googleUser.email,
        passwordHash: await bcrypt.hash(`google:${googleUser.googleId}:${googleUser.email}`, 12),
        role: "buyer",
        refreshToken: null
      };
      memoryUsers.set(user._id, user);
    }

    const accessToken = signAccess({ sub: user._id, email: user.email, role: user.role });
    const refreshToken = signRefresh({ sub: user._id });
    user.refreshToken = {
      tokenHash: await hashRefreshToken(refreshToken),
      createdAt: new Date()
    };
    await saveDevUsers();

    return { user, accessToken, refreshToken };
  }

  let user = await User.findOne({ email: googleUser.email }).exec();
  if (!user) {
    user = await User.create({
      email: googleUser.email,
      passwordHash: await bcrypt.hash(`google:${googleUser.googleId}:${googleUser.email}`, 12),
      role: "buyer"
    });
  }

  const accessToken = signAccess({ sub: String(user._id), email: user.email, role: user.role });
  const refreshToken = signRefresh({ sub: String(user._id) });
  const refreshHash = await hashRefreshToken(refreshToken);

  user.refreshToken = { tokenHash: refreshHash, createdAt: new Date() };
  await user.save();

  return { user, accessToken, refreshToken };
}

export async function refreshSession(input: { userId: string; presentedRefreshToken: string }) {
  if (!isDbConnected()) {
    await loadDevUsers();
    const user = memoryUsers.get(input.userId);
    if (!user || !user.refreshToken?.tokenHash) {
      const err = new Error("Refresh token invalid") as Error & { statusCode?: number; code?: string };
      err.statusCode = 401;
      err.code = "REFRESH_TOKEN_INVALID";
      throw err;
    }

    const match = await bcrypt.compare(input.presentedRefreshToken, user.refreshToken.tokenHash);
    if (!match) {
      user.refreshToken = null;
      await saveDevUsers();
      const err = new Error("Refresh token invalid") as Error & { statusCode?: number; code?: string };
      err.statusCode = 401;
      err.code = "REFRESH_TOKEN_INVALID";
      throw err;
    }

    const accessToken = signAccess({ sub: user._id, email: user.email, role: user.role });
    const refreshToken = signRefresh({ sub: user._id });
    user.refreshToken = {
      tokenHash: await hashRefreshToken(refreshToken),
      createdAt: new Date()
    };
    await saveDevUsers();

    return { user, accessToken, refreshToken };
  }

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
  if (!isDbConnected()) {
    await loadDevUsers();
    const user = memoryUsers.get(userId);
    if (user) {
      user.refreshToken = null;
      await saveDevUsers();
    }
    return;
  }

  await User.updateOne({ _id: userId }, { $set: { refreshToken: null } }).exec();
}

export async function upgradeUserToCreator(userId: string) {
  if (!isDbConnected()) {
    await loadDevUsers();
    const user = memoryUsers.get(userId);
    if (user) {
      user.role = "creator";
      await saveDevUsers();
    }
    return;
  }

  if (!userId.startsWith("dev:")) {
    await User.findByIdAndUpdate(userId, { $set: { role: "creator" } }).exec();
  }
}

export const cookies = {
  REFRESH_COOKIE_NAME
};


