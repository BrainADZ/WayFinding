import { NextRequest, NextResponse } from "next/server";
import { demo } from "../../../packages/domain/seed";
import { search } from "../../../packages/search";
export function GET(request: NextRequest) {
  return NextResponse.json(
    search(demo, request.nextUrl.searchParams.get("q") ?? ""),
  );
}
