import type { Snapshot } from "../../packages/domain";
import { addUpperFloors } from "./upper-floor-layout";

// Hand-traced presentation geometry from the supplied reference, not a surveyed map.
export const referenceOutline =
  "M193 57L375 54L532 23L593 40L669 151L728 107L819 226L758 273L827 366L825 449L758 578L684 806L579 797L495 937L361 888L451 641L491 617L551 465Q581 371 529 312Q475 259 398 269L319 287Q223 301 151 246Q111 223 123 176L153 119Z";
export const corridor: [number, number][] = [
  [170, 195],
  [203, 151],
  [280, 149],
  [352, 150],
  [402, 123],
  [449, 126],
  [492, 136],
  [535, 152],
  [580, 178],
  [620, 213],
  [646, 257],
  [667, 307],
  [688, 360],
  [704, 415],
  [701, 472],
  [680, 515],
  [650, 552],
  [630, 601],
  [608, 657],
  [578, 715],
  [521, 724],
  [490, 779],
  [461, 837],
  [435, 900],
];
export const referenceStores: {
  id: string;
  name: string;
  x: number;
  y: number;
  category: string;
  color: string;
  left?: boolean;
}[] = [
  {
    id: "lacoste",
    name: "Lacoste",
    x: 182,
    y: 108,
    category: "fashion",
    color: "#b55787",
  },
  {
    id: "goodys",
    name: "Goody's",
    x: 348,
    y: 100,
    category: "dining",
    color: "#d55a09",
    left: true,
  },
  {
    id: "bluenotes",
    name: "Bluenotes",
    x: 478,
    y: 75,
    category: "fashion",
    color: "#b55787",
    left: true,
  },
  {
    id: "chanel",
    name: "Chanel",
    x: 638,
    y: 146,
    category: "fashion",
    color: "#ff7926",
    left: true,
  },
  {
    id: "scotiabank",
    name: "Scotiabank",
    x: 348,
    y: 170,
    category: "services",
    color: "#36a640",
    left: true,
  },
  {
    id: "grooming",
    name: "1847 Executive Grooming",
    x: 182,
    y: 211,
    category: "beauty",
    color: "#446d94",
    left: true,
  },
  {
    id: "stitch-it",
    name: "Stitch It",
    x: 226,
    y: 240,
    category: "services",
    color: "#446d94",
  },
  {
    id: "eponymo",
    name: "Eponymo",
    x: 423,
    y: 220,
    category: "fashion",
    color: "#b55787",
    left: true,
  },
  {
    id: "little-burgundy",
    name: "Little Burgundy",
    x: 507,
    y: 247,
    category: "fashion",
    color: "#18a4cc",
  },
  {
    id: "lamour",
    name: "L'Amour Nails",
    x: 744,
    y: 291,
    category: "beauty",
    color: "#446d94",
  },
  {
    id: "total-image",
    name: "Total Image",
    x: 759,
    y: 345,
    category: "beauty",
    color: "#446d94",
  },
  {
    id: "perfumes",
    name: "Perfumes 4 U",
    x: 594,
    y: 362,
    category: "beauty",
    color: "#446d94",
  },
  {
    id: "koodo",
    name: "Koodo Mobile",
    x: 606,
    y: 399,
    category: "electronics",
    color: "#2672d6",
  },
  {
    id: "kids-footlocker",
    name: "Kids Footlocker",
    x: 775,
    y: 398,
    category: "fashion",
    color: "#ff7926",
  },
  {
    id: "loccitane",
    name: "L'Occitane",
    x: 773,
    y: 438,
    category: "beauty",
    color: "#446d94",
  },
  {
    id: "soft-moc",
    name: "Soft Moc",
    x: 601,
    y: 446,
    category: "fashion",
    color: "#ff7926",
  },
  {
    id: "tommy",
    name: "Tommy Hilfiger",
    x: 575,
    y: 514,
    category: "fashion",
    color: "#b55787",
    left: true,
  },
  {
    id: "attrattivo",
    name: "Attrattivo",
    x: 755,
    y: 525,
    category: "fashion",
    color: "#ff7926",
  },
  {
    id: "planta",
    name: "Planta",
    x: 735,
    y: 561,
    category: "dining",
    color: "#d55a09",
  },
  {
    id: "marciano",
    name: "Marciano",
    x: 624,
    y: 607,
    category: "fashion",
    color: "#ff7926",
    left: true,
  },
  {
    id: "spring",
    name: "Spring",
    x: 688,
    y: 631,
    category: "fashion",
    color: "#ff7926",
  },
  {
    id: "bench",
    name: "Bench",
    x: 600,
    y: 671,
    category: "fashion",
    color: "#b55787",
  },
  {
    id: "bath-body",
    name: "Bath & Body Works",
    x: 649,
    y: 740,
    category: "beauty",
    color: "#f4c33c",
  },
  {
    id: "michael-hill",
    name: "Michael Hill",
    x: 434,
    y: 744,
    category: "services",
    color: "#446d94",
  },
  {
    id: "gymboree",
    name: "Gymboree",
    x: 519,
    y: 789,
    category: "fashion",
    color: "#18a4cc",
  },
  {
    id: "fossil",
    name: "Fossil",
    x: 411,
    y: 806,
    category: "services",
    color: "#446d94",
  },
  {
    id: "foot-locker",
    name: "Foot Locker",
    x: 398,
    y: 842,
    category: "fashion",
    color: "#ff7926",
  },
  {
    id: "peoples",
    name: "Peoples",
    x: 473,
    y: 918,
    category: "services",
    color: "#446d94",
  },
];

export function createReferenceSnapshot(source: Snapshot): Snapshot {
  const data = structuredClone(source);
  const ground = data.floors.find((f) => f.id === "g")!;
  ground.width = 960;
  ground.height = 1020;
  ground.metresPerUnit = 0.3;
  const positions: Record<string, [number, number]> = {
    "n-g-start": [428, 884],
    "n-g-z1": [565, 86],
    "n-g-food": [630, 601],
    "n-g-oliva": [712, 587],
    "n-g-lift": [650, 320],
    "n-g-esc": [675, 490],
    "n-g-parking": [410, 942],
  };
  for (const node of data.nodes)
    if (positions[node.id]) [node.x, node.y] = positions[node.id];
  data.features = data.features.filter((f) => f.floorId !== "g");
  data.edges = data.edges.filter(
    (e) =>
      !(
        data.nodes.find((n) => n.id === e.fromNode)?.floorId === "g" &&
        data.nodes.find((n) => n.id === e.toNode)?.floorId === "g"
      ),
  );
  corridor.forEach(([x, y], i) =>
    data.nodes.push({
      id: `ref-c-${i}`,
      floorId: "g",
      x,
      y,
      label: "Mall corridor",
      type: "corridor",
    }),
  );
  const connect = (a: string, b: string) => {
    const from = data.nodes.find((n) => n.id === a)!,
      to = data.nodes.find((n) => n.id === b)!;
    const distance = Math.max(
      1,
      Math.round(Math.hypot(from.x - to.x, from.y - to.y) * 0.3),
    );
    data.edges.push({
      id: `ref-${a}-${b}`,
      fromNode: a,
      toNode: b,
      distance,
      type: "corridor",
      weight: 1,
      direction: "BOTH",
      active: true,
      accessible: true,
      restricted: false,
      estimatedTime: distance / 1.2,
      reason: "Illustrative reference-layout route",
    });
  };
  corridor.slice(1).forEach((_, i) => connect(`ref-c-${i}`, `ref-c-${i + 1}`));
  const template = data.tenants[0];
  for (const store of referenceStores) {
    const id = `ref-${store.id}`;
    data.nodes.push({
      id,
      floorId: "g",
      x: store.x,
      y: store.y,
      label: store.name,
      type: "tenant",
    });
    data.tenants.push({
      ...template,
      id,
      name: store.name,
      tradingName: store.name,
      categoryId: store.category,
      floorId: "g",
      nodeId: id,
      featureId: id,
      unitNumber: store.id,
      shortSummary: "Reference map preview",
      description:
        "Store placement recreated from the supplied reference. Hours and route measurements are illustrative; verify against the venue floor plan before public use.",
      keywords: [store.name.toLowerCase()],
      productTypes: [],
      services: [],
      heroImage: "",
      phone: "",
      website: "",
    });
  }
  // Attach each entrance to the closest point in the continuous corridor graph.
  for (const node of data.nodes.filter(
    (n) => n.floorId === "g" && !n.id.startsWith("ref-c-"),
  )) {
    const nearest = corridor.reduce(
      (best, p, i) =>
        Math.hypot(p[0] - node.x, p[1] - node.y) <
        Math.hypot(corridor[best][0] - node.x, corridor[best][1] - node.y)
          ? i
          : best,
      0,
    );
    connect(node.id, `ref-c-${nearest}`);
  }
  for (const tenant of data.tenants.filter((t) => t.floorId === "g")) {
    const node = data.nodes.find((n) => n.id === tenant.nodeId)!;
    data.features.push({
      id: tenant.featureId,
      floorId: "g",
      label: tenant.name,
      points: [
        [node.x - 21, node.y - 16],
        [node.x + 22, node.y - 23],
        [node.x + 30, node.y + 13],
        [node.x - 14, node.y + 22],
      ],
      color: "#f7f7f7",
    });
  }
  return addUpperFloors(data, corridor);
}
