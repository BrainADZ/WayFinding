import { NextResponse } from "next/server";
import { managedSnapshot } from "../../../packages/brand-store";
export async function GET() {
  return NextResponse.json(await managedSnapshot());
}
