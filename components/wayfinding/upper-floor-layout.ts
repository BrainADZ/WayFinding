import type { Snapshot, RouteEdge } from "../../packages/domain";

type Store = {
  id: string;
  name: string;
  x: number;
  y: number;
  category: string;
  color: string;
  left?: boolean;
  floorId: string;
};
const positions: [number, number, boolean?][] = [
  [190, 108],
  [330, 100],
  [475, 77],
  [610, 148],
  [305, 205],
  [435, 225],
  [210, 269],
  [610, 345],
  [758, 290],
  [772, 364],
  [760, 438],
  [590, 440],
  [574, 515],
  [738, 553],
  [740, 634],
  [605, 606],
  [606, 700],
  [680, 751],
  [535, 790],
  [592, 843],
  [453, 854],
  [475, 917],
  [225, 125],
  [275, 185],
  [390, 88],
  [525, 125],
  [545, 205],
  [665, 255],
  [690, 315],
  [700, 385],
  [680, 455],
  [655, 525],
  [700, 590],
  [655, 665],
  [635, 720],
  [565, 755],
  [505, 815],
  [430, 895],
  [530, 880],
  [615, 790],
];
const first = [
  ["Apple", "electronics"],
  ["Pandora", "services"],
  ["Croma", "electronics"],
  ["Gap", "fashion"],
  ["LensCrafters", "services"],
  ["Skechers", "fashion"],
  ["Only", "fashion"],
  ["Superdry", "fashion"],
  ["KFC", "dining"],
  ["Theobroma", "dining"],
  ["Biba", "fashion"],
  ["Diesel", "fashion"],
  ["Fabindia", "services"],
  ["Costa Coffee", "dining"],
  ["U.S. Polo Assn.", "fashion"],
  ["JBL", "electronics"],
  ["Westside", "fashion"],
  ["Bata", "fashion"],
  ["Nykaa", "beauty"],
  ["Dunkin'", "dining"],
  ["Asics", "fashion"],
  ["Pepperfry", "services"],
  ["Zudio", "fashion"],
  ["The Body Shop", "beauty"],
  ["Jack & Jones", "fashion"],
  ["Imagine", "electronics"],
  ["Aurelia", "fashion"],
  ["Pizza Hut", "dining"],
  ["Forest Essentials", "beauty"],
  ["Van Heusen", "fashion"],
  ["Colorbar", "beauty"],
  ["Wow Momo", "dining"],
  ["Allen Solly", "fashion"],
  ["Hamleys", "services"],
  ["Mochi", "fashion"],
  ["Chai Point", "dining"],
  ["Reliance Digital", "electronics"],
  ["Mothercare", "fashion"],
  ["Tanishq", "services"],
  ["Home Stop", "services"],
];
const second = [
  ["Mobile Snap", "electronics"],
  ["Blue Ruby", "services"],
  ["Microsoft", "electronics"],
  ["American Eagle Outfitters", "fashion"],
  ["Shefield & Sons", "services"],
  ["One Tooth", "services"],
  ["Mendocino", "fashion"],
  ["Banana Republic", "fashion"],
  ["New York Fries", "dining"],
  ["Purdy's Chocolates", "dining"],
  ["Cleo", "fashion"],
  ["Michael Kors", "fashion"],
  ["The Bombay Company", "services"],
  ["Tim Hortons", "dining"],
  ["Hugo Boss", "fashion"],
  ["Telus", "electronics"],
  ["Holt Renfrew", "fashion"],
  ["Ardene", "fashion"],
  ["Victoria's Secret", "fashion"],
  ["Treats", "dining"],
  ["Reebok", "fashion"],
  ["Royal Doulton", "services"],
  ["Roots", "fashion"],
  ["Watch It!", "services"],
  ["Urban Kids", "fashion"],
  ["Momo", "dining"],
  ["Pink", "fashion"],
  ["Sbarro", "dining"],
  ["Northern Reflections", "fashion"],
  ["Scenic Rush", "services"],
  ["Boathouse", "fashion"],
  ["Naturalizer", "fashion"],
  ["Q Nails", "beauty"],
  ["Hugo Boss Kids", "fashion"],
  ["Apple Store", "electronics"],
  ["Lens Factory", "services"],
  ["Bath & Body", "beauty"],
  ["Foot Locker", "fashion"],
  ["Peoples Jewellers", "services"],
  ["Freshii", "dining"],
];
const third = [
  ["Samsung", "electronics"],
  ["Swarovski", "services"],
  ["Sony", "electronics"],
  ["Levi's", "fashion"],
  ["Miniso", "services"],
  ["Puma", "fashion"],
  ["Mango", "fashion"],
  ["Uniqlo", "fashion"],
  ["Burger King", "dining"],
  ["Lindt", "dining"],
  ["Vero Moda", "fashion"],
  ["Calvin Klein", "fashion"],
  ["Muji", "services"],
  ["Starbucks", "dining"],
  ["Tommy Jeans", "fashion"],
  ["Bose", "electronics"],
  ["Marks & Spencer", "fashion"],
  ["Crocs", "fashion"],
  ["MAC Cosmetics", "beauty"],
  ["Baskin Robbins", "dining"],
  ["New Balance", "fashion"],
  ["Home Centre", "services"],
  ["Under Armour", "fashion"],
  ["Titan Eye+", "services"],
  ["OnePlus", "electronics"],
  ["Forever New", "fashion"],
  ["Health & Glow", "beauty"],
  ["Taco Bell", "dining"],
  ["Rare Rabbit", "fashion"],
  ["Aldo", "fashion"],
  ["Sephora Studio", "beauty"],
  ["Third Wave Coffee", "dining"],
  ["Celio", "fashion"],
  ["Crossword", "services"],
  ["Steve Madden", "fashion"],
  ["Keventers", "dining"],
  ["Vijay Sales", "electronics"],
  ["Mother's Recipe", "dining"],
  ["CaratLane", "services"],
  ["Urban Ladder", "services"],
];
const colors: Record<string, string> = {
  fashion: "#b55787",
  dining: "#ef741d",
  services: "#466d93",
  electronics: "#2672d6",
  beauty: "#18a4cc",
};
export const upperStores: Store[] = [first, second, third].flatMap(
  (brands, f) =>
    brands.map(([name, category], i) => ({
      id: `l${f + 1}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      category,
      color: colors[category],
      x: positions[i][0],
      y: positions[i][1],
      left: [1, 2, 4, 5, 7, 11, 12, 15, 18].includes(i),
      floorId: `l${f + 1}`,
    })),
);
export const upperAnchors = {
  l1: ["MASSIMO DUTTI", "PANTALOONS", "SHOPPERS STOP"],
  l2: ["bloomingdale's", "H&M", "NORDSTROM"],
  l3: ["ADIDAS", "NIKE", "LIFESTYLE"],
} as const;

export function addUpperFloors(data: Snapshot, corridor: [number, number][]) {
  if (!data.floors.some((f) => f.id === "l3"))
    data.floors.push({
      id: "l3",
      name: "Level 3",
      level: 3,
      width: 960,
      height: 1020,
      metresPerUnit: 0.3,
    });
  const connect = (
    fromNode: string,
    toNode: string,
    type: RouteEdge["type"] = "corridor",
  ) => {
    const a = data.nodes.find((n) => n.id === fromNode)!,
      b = data.nodes.find((n) => n.id === toNode)!;
    const distance =
      type === "corridor"
        ? Math.max(1, Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 0.3))
        : 5;
    data.edges.push({
      id: `upper-${fromNode}-${toNode}`,
      fromNode,
      toNode,
      type,
      distance,
      estimatedTime:
        type === "corridor" ? distance / 1.2 : type === "lift" ? 35 : 20,
      weight: 1,
      direction: "BOTH",
      accessible: !["stairs", "escalator"].includes(type),
      active: true,
      restricted: false,
      reason: "Illustrative multi-floor route",
    });
  };
  const attach = (id: string, floor: string) => {
    const node = data.nodes.find((n) => n.id === id)!;
    const nearest = corridor.reduce(
      (best, p, i) =>
        Math.hypot(p[0] - node.x, p[1] - node.y) <
        Math.hypot(corridor[best][0] - node.x, corridor[best][1] - node.y)
          ? i
          : best,
      0,
    );
    connect(id, `${floor}-c-${nearest}`);
  };
  for (const floorId of ["l1", "l2", "l3"]) {
    Object.assign(
      data.floors.find((f) => f.id === floorId)!,
      { width: 960, height: 1020, metresPerUnit: 0.3 },
    );
    data.edges = data.edges.filter(
      (e) =>
        !(
          data.nodes.find((n) => n.id === e.fromNode)?.floorId === floorId &&
          data.nodes.find((n) => n.id === e.toNode)?.floorId === floorId
        ),
    );
    data.features = data.features.filter((f) => f.floorId !== floorId);
    for (const [type, x, y] of [
      ["lift", 650, 320],
      ["esc", 675, 490],
    ] as const) {
      const id = `n-${floorId}-${type}`,
        node = data.nodes.find((n) => n.id === id);
      if (node) Object.assign(node, { x, y });
      else
        data.nodes.push({
          id,
          floorId,
          x,
          y,
          type: type === "esc" ? "escalator" : "lift",
          label: type === "esc" ? "Escalator" : "Lift",
        });
    }
    const atelier = data.nodes.find((n) => n.id === "n-l2-atelier");
    if (atelier) Object.assign(atelier, { x: 755, y: 695 });
    if (floorId === "l1") {
      const north = data.nodes.find((n) => n.id === "n-l1-uniqlo");
      const cinema = data.nodes.find((n) => n.id === "n-l1-cinema");
      if (north) Object.assign(north, { x: 755, y: 695 });
      if (cinema) Object.assign(cinema, { x: 700, y: 810 });
    }
    corridor.forEach(([x, y], i) =>
      data.nodes.push({
        id: `${floorId}-c-${i}`,
        floorId,
        x,
        y,
        label: "Mall corridor",
        type: "corridor",
      }),
    );
    corridor
      .slice(1)
      .forEach((_, i) => connect(`${floorId}-c-${i}`, `${floorId}-c-${i + 1}`));
    const anchors = upperAnchors[floorId as keyof typeof upperAnchors];
    const stores = [
      ...upperStores.filter((s) => s.floorId === floorId),
      ...anchors.map((name, i) => ({
        id: `${floorId}-anchor-${i}`,
        name,
        category: "fashion",
        x: [556, 735, 385][i],
        y: [78, 203, 748][i],
      })),
    ];
    for (const store of stores) {
      const id = `ref-${store.id}`;
      data.nodes.push({
        id,
        floorId,
        x: store.x,
        y: store.y,
        type: "tenant",
        label: store.name,
      });
      data.tenants.push({
        ...data.tenants[0],
        id,
        floorId,
        name: store.name,
        tradingName: store.name,
        nodeId: id,
        featureId: id,
        categoryId: store.category,
        unitNumber: store.id,
        shortSummary: "Reference floor preview",
        description:
          "Illustrative store placement and hours. Verify the venue plan before using these demo directions on site.",
        keywords: [store.name.toLowerCase()],
        productTypes: [],
        services: [],
        heroImage: "",
        phone: "",
        website: "",
      });
    }
    for (const node of data.nodes.filter(
      (n) => n.floorId === floorId && !n.id.startsWith(`${floorId}-c-`),
    ))
      attach(node.id, floorId);
    for (const tenant of data.tenants.filter((t) => t.floorId === floorId)) {
      const n = data.nodes.find((n) => n.id === tenant.nodeId)!;
      data.features.push({
        id: tenant.featureId,
        floorId,
        label: tenant.name,
        color: "#f7f7f7",
        points: [
          [n.x - 20, n.y - 15],
          [n.x + 20, n.y - 15],
          [n.x + 20, n.y + 15],
          [n.x - 20, n.y + 15],
        ],
      });
    }
  }
  connect("n-l2-lift", "n-l3-lift", "lift");
  connect("n-l2-esc", "n-l3-esc", "escalator");
  for (const floor of data.floors) {
    const id = `n-${floor.id}-stairs`;
    data.nodes.push({
      id,
      floorId: floor.id,
      x: 600,
      y: 575,
      type: "stairs",
      label: "Stairs",
    });
    if (["l1", "l2", "l3"].includes(floor.id)) attach(id, floor.id);
    else connect(id, floor.id === "g" ? "ref-c-17" : `n-${floor.id}-lift`);
  }
  const floors = [...data.floors].sort((a, b) => a.level - b.level);
  floors
    .slice(1)
    .forEach((floor, i) =>
      connect(`n-${floors[i].id}-stairs`, `n-${floor.id}-stairs`, "stairs"),
    );
  return data;
}
