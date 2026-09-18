import { NextRequest, NextResponse } from "next/server";
import { schemas } from "../../../packages/domain";
import { demo } from "../../../packages/domain/seed";
export async function POST(request: NextRequest) {
  const parsed = schemas.campaigns.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid campaign data" },
      { status: 400 },
    );
  demo.campaigns.push(parsed.data);
  demo.version = String(Date.now());
  return NextResponse.json(parsed.data, { status: 201 });
}
