import jwt from "jsonwebtoken";
import type { User, UserRole } from "./types";
import { AUTH_TOKEN_TTL_SECONDS } from "./constants";

export interface TokenPayload {
  sub: string;
  role: UserRole;
  email: string;
  name: string;
  department: string;
  iat?: number;
  exp?: number;
}

const AUTH_SECRET = process.env.AUTH_SECRET || "karmic-canteen-demo-secret";

export const createSessionToken = (user: User) => {
  const payload: TokenPayload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    department: user.department,
  };
  return jwt.sign(payload, AUTH_SECRET, {
    expiresIn: AUTH_TOKEN_TTL_SECONDS,
  });
};

export const verifyAuthToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, AUTH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
};
