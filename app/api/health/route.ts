import { NextResponse } from "next/server";
import { demo } from "../../../packages/domain/seed";
export function GET() {
  return NextResponse.json({ ok: true, version: demo.version });
}
