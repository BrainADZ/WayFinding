import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminToken,
  isAdmin,
  validAdminCredentials,
} from "../../../../packages/admin-auth";
export function GET(request: NextRequest) {
  return NextResponse.json({
    authenticated: isAdmin(request),
    configured: !!adminToken(),
  });
}
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (
    !validAdminCredentials(
      String(body.email ?? ""),
      String(body.password ?? ""),
    )
  )
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, adminToken()!, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 28800,
  });
  return response;
}
export function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
