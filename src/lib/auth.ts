import type { User } from "./types";
import { SESSION_COOKIE_NAME } from "./constants";
import { cookies, headers } from "next/headers";
import { getUserById } from "./store";
import { verifyAuthToken } from "./session";

export const getTokenFromCookies = async (): Promise<string | undefined> => {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value;
};

export const getTokenFromHeaders = async (): Promise<string | undefined> => {
  const headerStore = await headers();
  const header = headerStore.get("authorization");
  if (!header) return undefined;
  const [scheme, value] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer") {
    return undefined;
  }
  return value;
};

export const getSessionUser = async (): Promise<User | null> => {
  const token =
    (await getTokenFromCookies()) ??
    (await getTokenFromHeaders());
  if (!token) return null;
  const payload = verifyAuthToken(token);
  if (!payload) return null;
  const user = getUserById(payload.sub);
  if (!user) return null;
  return user;
};

export const serializeUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
});

export { createSessionToken, verifyAuthToken } from "./session";
export type { TokenPayload } from "./session";
