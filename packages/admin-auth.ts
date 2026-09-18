import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "way_admin_session";
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");

export function adminToken() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret ? digest(secret) : null;
}

export function validAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword || !process.env.ADMIN_SESSION_SECRET)
    return false;
  const supplied = Buffer.from(digest(password));
  const expected = Buffer.from(digest(expectedPassword));
  return (
    email.trim().toLowerCase() === expectedEmail.toLowerCase() &&
    timingSafeEqual(supplied, expected)
  );
}

export function isAdmin(request: NextRequest) {
  const token = adminToken();
  return !!token && request.cookies.get(ADMIN_COOKIE)?.value === token;
}
