import { NextRequest, NextResponse } from "next/server";
import { schemas } from "../../../../packages/domain";
import { demo } from "../../../../packages/domain/seed";
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const current = demo.tenants.find((tenant) => tenant.id === id);
  if (!current)
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  const parsed = schemas.tenants.safeParse({
    ...current,
    ...(await request.json()),
  });
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid tenant data" }, { status: 400 });
  Object.assign(current, parsed.data);
  demo.version = String(Date.now());
  return NextResponse.json({
    ok: true,
    tenant: current,
    version: demo.version,
  });
}
