import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { demo } from "../../../packages/domain/seed";
import { findRoute } from "../../../packages/routing";
export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    destinationId?: string;
    accessible?: boolean;
    origin?: string;
  };
  const destination = demo.tenants.find(
    (tenant) => tenant.id === body.destinationId,
  );
  if (!destination)
    return NextResponse.json(
      { error: "Destination not found" },
      { status: 404 },
    );
  const route = findRoute(
    demo.nodes,
    demo.edges,
    body.origin || "n-g-start",
    destination.nodeId,
    Boolean(body.accessible),
    demo.floors,
  );
  if (!route)
    return NextResponse.json({ error: "No route available" }, { status: 422 });
  return NextResponse.json({ id: randomUUID(), destination, route });
}
