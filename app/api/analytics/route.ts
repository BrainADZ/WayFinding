import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json(
    { accepted: true, id: randomUUID() },
    { status: 202 },
  );
}
