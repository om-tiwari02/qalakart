import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type UserJwt = {
  sub: string;
  email: string;
  role: "buyer" | "creator" | "admin";
};

export function signAccess(user: UserJwt) {
  const secret: Secret = env.JWT_ACCESS_SECRET;
  return jwt.sign(user, secret, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]
  });
}

export function signRefresh(user: Pick<UserJwt, "sub">) {
  const secret: Secret = env.JWT_REFRESH_SECRET;
  return jwt.sign(user, secret, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]
  });
}

export function verifyAccess(token: string): UserJwt {
  const secret: Secret = env.JWT_ACCESS_SECRET;
  return jwt.verify(token, secret) as UserJwt;
}

export function verifyRefresh(token: string): Pick<UserJwt, "sub"> {
  const secret: Secret = env.JWT_REFRESH_SECRET;
  return jwt.verify(token, secret) as Pick<UserJwt, "sub">;
}

