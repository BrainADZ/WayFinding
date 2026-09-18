import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Snapshot, Tenant } from "./domain";
import { demo } from "./domain/seed";
import { createReferenceSnapshot } from "../components/wayfinding/reference-layout";

export type BrandInput = {
  name: string;
  floorId: string;
  categoryId: string;
  unitNumber: string;
};
type SavedBrand = BrandInput & { id: string };
type Overrides = { removed: string[]; custom: SavedBrand[] };
const filePath = () =>
  process.env.BRAND_DATA_FILE ??
  path.join(process.cwd(), ".data", "brands.json");

async function readOverrides(): Promise<Overrides> {
  try {
    return JSON.parse(
      await readFile(/* turbopackIgnore: true */ filePath(), "utf8"),
    );
  } catch {
    return { removed: [], custom: [] };
  }
}
async function saveOverrides(value: Overrides) {
  await mkdir(path.dirname(filePath()), { recursive: true });
  await writeFile(filePath(), JSON.stringify(value, null, 2), "utf8");
}
const slots: Record<string, [number, number][]> = {
  g: [
    [520, 760],
    [575, 720],
    [625, 675],
    [680, 620],
  ],
  l1: [
    [260, 160],
    [390, 170],
    [540, 210],
    [650, 360],
  ],
  l2: [
    [220, 130],
    [360, 150],
    [520, 185],
    [680, 340],
  ],
  l3: [
    [225, 125],
    [390, 150],
    [550, 205],
    [680, 385],
  ],
};

export async function managedSnapshot(): Promise<Snapshot> {
  const data = createReferenceSnapshot(structuredClone(demo));
  const overrides = await readOverrides();
  for (const id of overrides.removed) {
    const tenant = data.tenants.find((item) => item.id === id);
    if (!tenant) continue;
    data.tenants = data.tenants.filter((item) => item.id !== id);
    data.nodes = data.nodes.filter((item) => item.id !== tenant.nodeId);
    data.features = data.features.filter(
      (item) => item.id !== tenant.featureId,
    );
    data.edges = data.edges.filter(
      (item) =>
        item.fromNode !== tenant.nodeId && item.toNode !== tenant.nodeId,
    );
  }
  const template = data.tenants[0];
  for (const [index, brand] of overrides.custom.entries()) {
    const positions = slots[brand.floorId] ?? slots.g;
    const [x, y] = positions[index % positions.length];
    const nodeId = `admin-node-${brand.id}`;
    const featureId = `admin-feature-${brand.id}`;
    const tenant: Tenant = {
      ...template,
      id: brand.id,
      name: brand.name,
      tradingName: brand.name,
      floorId: brand.floorId,
      categoryId: brand.categoryId,
      unitNumber: brand.unitNumber,
      nodeId,
      featureId,
      shortSummary: `${brand.name} at Riverside Shopping Centre`,
      description: `${brand.name} store. Visit the directory for current hours and services.`,
      keywords: [brand.name.toLowerCase()],
      productTypes: [],
      services: [],
      heroImage: "",
      logo: "",
      gallery: [],
      phone: "",
      website: "",
      status: "ACTIVE",
    };
    data.tenants.push(tenant);
    data.nodes.push({
      id: nodeId,
      floorId: brand.floorId,
      x,
      y,
      label: brand.name,
      type: "tenant",
    });
    data.features.push({
      id: featureId,
      floorId: brand.floorId,
      label: brand.name,
      points: [
        [x - 22, y - 18],
        [x + 22, y - 18],
        [x + 22, y + 18],
        [x - 22, y + 18],
      ],
      color: "#f7f7f7",
    });
    const nearest = data.nodes
      .filter(
        (node) =>
          node.floorId === brand.floorId &&
          node.id !== nodeId &&
          ["corridor", "lift", "escalator"].includes(node.type),
      )
      .sort(
        (a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y),
      )[0];
    if (nearest)
      data.edges.push({
        id: `admin-edge-${brand.id}`,
        fromNode: nodeId,
        toNode: nearest.id,
        distance: Math.max(
          1,
          Math.round(Math.hypot(nearest.x - x, nearest.y - y) * 0.3),
        ),
        type: "corridor",
        weight: 1,
        direction: "BOTH",
        active: true,
        accessible: true,
        restricted: false,
        estimatedTime: 20,
        reason: "",
      });
  }
  data.version = String(Date.now());
  return data;
}

export async function addBrand(input: BrandInput) {
  const overrides = await readOverrides();
  const base =
    input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "brand";
  const brand = { ...input, id: `admin-${base}-${Date.now().toString(36)}` };
  overrides.custom.push(brand);
  await saveOverrides(overrides);
  return brand;
}
export async function removeBrand(id: string) {
  const overrides = await readOverrides();
  overrides.custom = overrides.custom.filter((item) => item.id !== id);
  if (!id.startsWith("admin-") && !overrides.removed.includes(id))
    overrides.removed.push(id);
  await saveOverrides(overrides);
}
