import type { Snapshot } from "./index";
const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=900&q=80`;
export const demo: Snapshot = {
  version: "2026.09.16.1",
  venue: {
    id: "riverside",
    name: "Riverside Shopping Centre",
    timezone: "Asia/Kolkata",
    address: "River Road, Bengaluru",
    description: "Find, explore and enjoy your visit.",
    brandColor: "#0866ff",
  },
  floors: [
    {
      id: "g",
      name: "Ground Floor",
      level: 0,
      width: 1000,
      height: 700,
      metresPerUnit: 2,
    },
    {
      id: "l1",
      name: "Level 1",
      level: 1,
      width: 1000,
      height: 700,
      metresPerUnit: 2,
    },
    {
      id: "l2",
      name: "Level 2",
      level: 2,
      width: 1000,
      height: 700,
      metresPerUnit: 2,
    },
  ],
  categories: [
    { id: "fashion", name: "Fashion", icon: "ShoppingBag", color: "#f7d9e8" },
    { id: "dining", name: "Dining", icon: "Utensils", color: "#ffe6d9" },
    {
      id: "entertainment",
      name: "Entertainment",
      icon: "Clapperboard",
      color: "#e7defa",
    },
    { id: "beauty", name: "Beauty", icon: "Sparkles", color: "#d8f2e7" },
    {
      id: "electronics",
      name: "Electronics",
      icon: "Laptop",
      color: "#dceafe",
    },
    { id: "services", name: "Services", icon: "Settings", color: "#e6efff" },
    { id: "cinema", name: "Cinema", icon: "Film", color: "#e5ddfc" },
  ],
  nodes: [],
  edges: [],
  features: [],
  pois: [],
  campaigns: [
    {
      id: "camp-summer",
      name: "Summer Shopping Fest",
      advertiser: "Riverside Centre",
      description: "Big brands. Bigger happiness.",
      status: "ACTIVE",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      startTime: "00:00",
      endTime: "23:59",
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      mediaId: "media-fashion",
      duration: 15,
      priority: "NORMAL",
      targetType: "ALL",
      targets: [],
    },
  ],
  devices: [
    {
      id: "k-001",
      name: "Kiosk 001 · Main Entrance",
      floorId: "g",
      locationDescription: "Ground Floor Main Entrance",
      routeStartNode: "n-g-start",
      deviceGroup: "default",
      screenOrientation: "PORTRAIT",
      status: "ACTIVE",
      idleTimeout: 10,
      defaultLanguage: "en",
    },
    {
      id: "k-002",
      name: "Kiosk 002 · Food Court",
      floorId: "g",
      locationDescription: "Ground Floor Food Court",
      routeStartNode: "n-g-food",
      deviceGroup: "default",
      screenOrientation: "PORTRAIT",
      status: "ACTIVE",
      idleTimeout: 10,
      defaultLanguage: "en",
    },
    {
      id: "k-003",
      name: "Kiosk 003 · Cinema Lobby",
      floorId: "l1",
      locationDescription: "Level 1 Cinema Lobby",
      routeStartNode: "n-l1-cinema",
      deviceGroup: "default",
      screenOrientation: "PORTRAIT",
      status: "ACTIVE",
      idleTimeout: 10,
      defaultLanguage: "en",
    },
    {
      id: "k-004",
      name: "Kiosk 004 · Parking Lobby",
      floorId: "g",
      locationDescription: "Ground Floor Parking Lobby",
      routeStartNode: "n-g-parking",
      deviceGroup: "default",
      screenOrientation: "PORTRAIT",
      status: "MAINTENANCE",
      idleTimeout: 10,
      defaultLanguage: "en",
    },
  ],
  offers: [],
  events: [],
  media: [
    {
      id: "media-fashion",
      name: "summer-shopping-fest.jpg",
      url: img("1529139574466-a303027c1d8b"),
      mimeType: "image/jpeg",
      size: 1_200_000,
      width: 1600,
      height: 900,
      duration: 0,
    },
    {
      id: "media-oliva",
      name: "oliva-kitchen.jpg",
      url: img("1517248135467-4c7edcad34c4"),
      mimeType: "image/jpeg",
      size: 1_100_000,
      width: 1600,
      height: 1000,
      duration: 0,
    },
  ],
  tenants: [],
};
const addNode = (
  id: string,
  floorId: string,
  x: number,
  y: number,
  label: string,
  type:
    | "corridor"
    | "entrance"
    | "tenant"
    | "lift"
    | "escalator"
    | "stairs"
    | "poi",
) => demo.nodes.push({ id, floorId, x, y, label, type });
const addEdge = (
  id: string,
  a: string,
  b: string,
  d: number,
  type:
    | "corridor"
    | "entrance"
    | "ramp"
    | "stairs"
    | "escalator"
    | "lift"
    | "travelator",
  accessible = true,
) =>
  demo.edges.push({
    id,
    fromNode: a,
    toNode: b,
    distance: d,
    type,
    weight: 1,
    direction: "BOTH",
    active: true,
    accessible,
    restricted: false,
    estimatedTime: d * 9,
    reason: "",
  });
[
  ["n-g-start", 90, 340, "Main Entrance", "entrance"],
  ["n-g-food", 500, 560, "Food Court", "poi"],
  ["n-g-lift", 500, 320, "Lift", "lift"],
  ["n-g-esc", 650, 320, "Escalator", "escalator"],
  ["n-g-z1", 270, 150, "Zara", "tenant"],
  ["n-g-oliva", 760, 520, "Oliva", "tenant"],
  ["n-g-parking", 120, 600, "Parking Lobby", "entrance"],
].forEach((x) =>
  addNode(
    x[0] as string,
    "g",
    x[1] as number,
    x[2] as number,
    x[3] as string,
    x[4] as any,
  ),
);
[
  ["n-l1-cinema", 700, 180, "Cinema Lobby", "poi"],
  ["n-l1-lift", 500, 320, "Lift", "lift"],
  ["n-l1-esc", 650, 320, "Escalator", "escalator"],
  ["n-l1-uniqlo", 280, 160, "North & Co.", "tenant"],
].forEach((x) =>
  addNode(
    x[0] as string,
    "l1",
    x[1] as number,
    x[2] as number,
    x[3] as string,
    x[4] as any,
  ),
);
[
  ["n-l2-lift", 500, 320, "Lift", "lift"],
  ["n-l2-esc", 650, 320, "Escalator", "escalator"],
  ["n-l2-atelier", 780, 180, "Atelier Home", "tenant"],
].forEach((x) =>
  addNode(
    x[0] as string,
    "l2",
    x[1] as number,
    x[2] as number,
    x[3] as string,
    x[4] as any,
  ),
);
[
  ["e1", "n-g-start", "n-g-z1", 70, "corridor"],
  ["e2", "n-g-start", "n-g-food", 120, "corridor"],
  ["e3", "n-g-food", "n-g-oliva", 80, "corridor"],
  ["e4", "n-g-food", "n-g-lift", 55, "corridor"],
  ["e5", "n-g-lift", "n-l1-lift", 40, "lift"],
  ["e6", "n-g-lift", "n-g-esc", 30, "corridor"],
  ["e7", "n-g-esc", "n-l1-esc", 40, "escalator"],
  ["e8", "n-l1-lift", "n-l1-cinema", 60, "corridor"],
  ["e9", "n-l1-esc", "n-l1-uniqlo", 80, "corridor"],
  ["e10", "n-l1-lift", "n-l2-lift", 40, "lift"],
  ["e11", "n-l1-esc", "n-l2-esc", 40, "escalator"],
  ["e12", "n-l2-lift", "n-l2-atelier", 80, "corridor"],
  ["e13", "n-g-start", "n-g-parking", 100, "corridor"],
].forEach((x) => addEdge(...(x as [string, string, string, number, any])));
const tenants = [
  [
    "zara",
    "Zara",
    "fashion",
    "g",
    "G-14",
    "n-g-z1",
    "Fashion retail · women, men and kids",
    "Fashion, Shoes, Accessories",
  ],
  [
    "oliva",
    "Oliva Italian Kitchen",
    "dining",
    "g",
    "G-28",
    "n-g-oliva",
    "Italian restaurant · pizza, pasta and family dining",
    "Italian, Pizza, Pasta, Vegetarian",
  ],
  [
    "north",
    "North & Co.",
    "fashion",
    "l1",
    "L1-08",
    "n-l1-uniqlo",
    "Everyday essentials, denim and modern basics",
    "Apparel, Denim, Kids",
  ],
  [
    "atelier",
    "Atelier Home",
    "services",
    "l2",
    "L2-04",
    "n-l2-atelier",
    "Homeware, décor and considered living",
    "Home, Lifestyle, Gifts",
  ],
];
for (const [id, name, cat, floor, unit, node, summary, types] of tenants) {
  const f = demo.floors.find((x) => x.id === floor)!;
  const n = demo.nodes.find((x) => x.id === node)!;
  const color = demo.categories.find((x) => x.id === cat)?.color || "#dceafe";
  demo.tenants.push({
    id,
    name,
    tradingName: name,
    categoryId: cat,
    floorId: floor,
    unitNumber: unit,
    nodeId: node,
    featureId: `feature-${id}`,
    shortSummary: summary,
    description:
      name === "Oliva Italian Kitchen"
        ? "A warm neighbourhood kitchen serving handmade pasta, wood-fired pizza and seasonal plates for the whole family."
        : "A considered destination for quality products, thoughtful service and an easy visit.",
    keywords: types.toLowerCase().split(", "),
    productTypes: types.split(", "),
    services:
      cat === "dining"
        ? ["Dine-in", "Takeaway", "Vegetarian options"]
        : ["Click & collect", "Gift cards"],
    heroImage:
      name === "Oliva Italian Kitchen"
        ? demo.media[1].url
        : img("1441986300917-64674bd600d"),
    logo: "",
    gallery: [],
    openingTime: "10:00",
    closingTime: "22:00",
    phone: "+91 80 4000 1200",
    website: "https://example.com",
    accessibilityNotes: "Step-free entrance available via the lift.",
    status: "ACTIVE",
  });
  demo.features.push({
    id: `feature-${id}`,
    floorId: floor,
    label: name,
    points: [
      [n.x - 80, n.y - 50],
      [n.x + 80, n.y - 50],
      [n.x + 80, n.y + 50],
      [n.x - 80, n.y + 50],
    ],
    color,
  });
}
demo.offers = [
  {
    id: "offer-oliva",
    tenantId: "oliva",
    title: "Weekend special · 20% off pasta",
    description: "Enjoy 20% off selected pasta dishes this weekend.",
    image: demo.media[1].url,
    start: "2026-01-01",
    end: "2026-12-31",
    terms: "Selected dishes only.",
    status: "ACTIVE",
  },
];
demo.pois = [
  {
    id: "poi-washroom",
    name: "Washrooms",
    type: "Washroom",
    floorId: "g",
    nodeId: "n-g-food",
    accessible: true,
    description: "Accessible washrooms near the Food Court.",
    status: "ACTIVE",
  },
  {
    id: "poi-atm",
    name: "ATM",
    type: "ATM",
    floorId: "g",
    nodeId: "n-g-start",
    accessible: true,
    description: "24 hour cash point near Main Entrance.",
    status: "ACTIVE",
  },
  {
    id: "poi-info",
    name: "Information Desk",
    type: "Information",
    floorId: "g",
    nodeId: "n-g-start",
    accessible: true,
    description: "Ask our team for help.",
    status: "ACTIVE",
  },
];
