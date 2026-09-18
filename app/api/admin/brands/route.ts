import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "../../../../packages/admin-auth";
import {
  addBrand,
  managedSnapshot,
  removeBrand,
} from "../../../../packages/brand-store";
const input = z.object({
  name: z.string().trim().min(2).max(80),
  floorId: z.enum(["g", "l1", "l2", "l3"]),
  categoryId: z.enum([
    "fashion",
    "dining",
    "entertainment",
    "beauty",
    "electronics",
    "services",
  ]),
  unitNumber: z.string().trim().min(1).max(30),
});
const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return unauthorized();
  const data = await managedSnapshot();
  return NextResponse.json({
    brands: data.tenants
      .map(({ id, name, floorId, categoryId, unitNumber }) => ({
        id,
        name,
        floorId,
        categoryId,
        unitNumber,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    floors: data.floors,
    categories: data.categories,
  });
}
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return unauthorized();
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Please complete all brand fields" },
      { status: 400 },
    );
  return NextResponse.json(
    { brand: await addBrand(parsed.data) },
    { status: 201 },
  );
}
export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) return unauthorized();
  const id = new URL(request.url).searchParams.get("id");
  if (!id)
    return NextResponse.json(
      { error: "Brand id is required" },
      { status: 400 },
    );
  await removeBrand(id);
  return NextResponse.json({ ok: true });
}
