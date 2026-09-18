import { z } from "zod";
export const roles = [
  "SUPER_ADMIN",
  "MALL_ADMIN",
  "CONTENT_MANAGER",
  "ADVERTISING_MANAGER",
  "ANALYST",
  "DEVICE_OPERATOR",
] as const;
export type Role = (typeof roles)[number];
export const permissions: Record<Role, string[]> = {
  SUPER_ADMIN: ["*"],
  MALL_ADMIN: [
    "venue",
    "floors",
    "features",
    "nodes",
    "edges",
    "tenants",
    "categories",
    "pois",
    "offers",
    "events",
    "campaigns",
    "media",
    "devices",
    "settings",
    "analytics",
    "audit",
  ],
  CONTENT_MANAGER: ["tenants", "categories", "offers", "events"],
  ADVERTISING_MANAGER: ["campaigns", "media"],
  ANALYST: ["analytics"],
  DEVICE_OPERATOR: ["devices"],
};
export function can(role: Role, resource: string) {
  return (
    permissions[role]?.includes("*") ||
    permissions[role]?.includes(resource) ||
    false
  );
}
const id = z.string().min(1).max(100);
const label = z.string().min(1).max(160);
const mediaPath = z
  .string()
  .max(500)
  .refine(
    (s) => s === "" || /^\/media\/[\w.-]+$/.test(s),
    "Choose an uploaded media asset",
  );
export const schemas = {
  venue: z.object({
    id,
    name: label,
    timezone: z.string().default("Asia/Kolkata"),
    address: z.string().max(500),
    description: z.string().max(1500),
    brandColor: z.string().regex(/^#[a-fA-F0-9]{6}$/),
  }),
  floors: z.object({
    id,
    name: label,
    level: z.number().int().min(-10).max(100),
    width: z.number().positive().max(10000),
    height: z.number().positive().max(10000),
    metresPerUnit: z.number().positive().max(100),
  }),
  categories: z.object({
    id,
    name: label,
    icon: label,
    color: z.string().regex(/^#[a-fA-F0-9]{6}$/),
  }),
  tenants: z.object({
    id,
    name: label,
    tradingName: z.string().max(160),
    categoryId: id,
    subcategory: z.string().max(120).optional(),
    floorId: id,
    unitNumber: label,
    nodeId: id,
    featureId: id,
    shortSummary: z.string().max(300),
    description: z.string().max(2500),
    keywords: z.array(z.string().max(100)).max(40),
    productTypes: z.array(z.string().max(100)).max(30),
    services: z.array(z.string().max(100)).max(20),
    heroImage: mediaPath,
    logo: mediaPath,
    gallery: z.array(mediaPath).max(12),
    openingTime: z.string().regex(/^\d{2}:\d{2}$/),
    closingTime: z.string().regex(/^\d{2}:\d{2}$/),
    phone: z.string().max(40),
    website: z
      .string()
      .max(400)
      .refine((s) => !s || /^https:\/\//.test(s)),
    accessibilityNotes: z.string().max(500),
    status: z.enum(["ACTIVE", "COMING_SOON", "TEMPORARILY_CLOSED", "HIDDEN"]),
  }),
  nodes: z.object({
    id,
    floorId: id,
    x: z.number().min(0).max(10000),
    y: z.number().min(0).max(10000),
    label: label,
    type: z.enum([
      "corridor",
      "entrance",
      "tenant",
      "lift",
      "escalator",
      "stairs",
      "poi",
    ]),
  }),
  edges: z.object({
    id,
    fromNode: id,
    toNode: id,
    distance: z.number().positive().max(10000),
    type: z.enum([
      "corridor",
      "entrance",
      "ramp",
      "stairs",
      "escalator",
      "lift",
      "travelator",
    ]),
    weight: z.number().positive().max(100),
    direction: z.enum(["BOTH", "FORWARD"]),
    active: z.boolean(),
    accessible: z.boolean(),
    restricted: z.boolean(),
    estimatedTime: z.number().positive().max(10000),
    reason: z.string().max(300),
  }),
  features: z.object({
    id,
    floorId: id,
    label: label,
    points: z
      .array(
        z.tuple([z.number().min(0).max(10000), z.number().min(0).max(10000)]),
      )
      .min(3)
      .max(50),
    color: z.string().regex(/^#[a-fA-F0-9]{6}$/),
  }),
  pois: z.object({
    id,
    name: label,
    type: label,
    floorId: id,
    nodeId: id,
    accessible: z.boolean(),
    description: z.string().max(500),
    status: z.enum(["ACTIVE", "HIDDEN"]),
  }),
  offers: z.object({
    id,
    tenantId: id,
    title: label,
    description: z.string().max(1000),
    image: mediaPath,
    start: z.string(),
    end: z.string(),
    terms: z.string().max(600),
    status: z.enum(["ACTIVE", "DRAFT", "PAUSED"]),
  }),
  events: z.object({
    id,
    title: label,
    description: z.string().max(1500),
    image: mediaPath,
    start: z.string(),
    end: z.string(),
    destinationId: id,
    status: z.enum(["ACTIVE", "DRAFT", "PAUSED"]),
  }),
  campaigns: z.object({
    id,
    name: label,
    advertiser: label,
    description: z.string().max(1000),
    status: z.enum(["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "COMPLETED"]),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
    mediaId: id,
    duration: z.number().min(5).max(300),
    priority: z.enum(["LOW", "NORMAL", "HIGH"]),
    targetType: z.enum(["ALL", "FLOOR", "DEVICE", "GROUP"]),
    targets: z.array(z.string()).max(100),
  }),
  devices: z.object({
    id,
    name: label,
    floorId: id,
    locationDescription: label,
    routeStartNode: id,
    deviceGroup: label,
    screenOrientation: z.enum(["PORTRAIT", "LANDSCAPE"]),
    status: z.enum(["ACTIVE", "MAINTENANCE"]),
    idleTimeout: z.number().int().min(10).max(600),
    defaultLanguage: z.string().default("en"),
  }),
  settings: z.object({ id, value: z.string().max(2000) }),
  users: z.object({
    id,
    name: label,
    email: z.email(),
    role: z.enum(roles),
    active: z.boolean(),
    password: z.string().min(12).max(200).optional(),
  }),
};
export type Venue = z.infer<typeof schemas.venue>;
export type Floor = z.infer<typeof schemas.floors>;
export type Tenant = z.infer<typeof schemas.tenants>;
export type RouteNode = z.infer<typeof schemas.nodes>;
export type RouteEdge = z.infer<typeof schemas.edges>;
export type Feature = z.infer<typeof schemas.features>;
export type Campaign = z.infer<typeof schemas.campaigns>;
export type Device = z.infer<typeof schemas.devices>;
export type Poi = z.infer<typeof schemas.pois>;
export type Category = z.infer<typeof schemas.categories>;
export type Offer = z.infer<typeof schemas.offers>;
export type Event = z.infer<typeof schemas.events>;
export interface Media {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  duration: number;
}
export interface Snapshot {
  venue: Venue;
  floors: Floor[];
  tenants: Tenant[];
  categories: Category[];
  nodes: RouteNode[];
  edges: RouteEdge[];
  features: Feature[];
  pois: Poi[];
  campaigns: Campaign[];
  devices: Device[];
  offers: Offer[];
  events: Event[];
  media: Media[];
  version: string;
}
export interface RouteStep {
  text: string;
  floorId: string;
  nodeId: string;
  distance: number;
  connector: boolean;
}
export interface Route {
  nodes: RouteNode[];
  edges: RouteEdge[];
  distance: number;
  minutes: number;
  steps: RouteStep[];
  floorIds: string[];
}
export type Destination = {
  id: string;
  name: string;
  floorId: string;
  nodeId: string;
};
export interface AnalyticsEvent {
  id: string;
  type: string;
  deviceId: string;
  destinationId?: string;
  query?: string;
  campaignId?: string;
  duration?: number;
  timestamp: string;
}
export const eventNames = [
  "session_started",
  "session_reset",
  "search_started",
  "search_submitted",
  "search_result_clicked",
  "search_no_result",
  "category_opened",
  "tenant_profile_viewed",
  "amenity_selected",
  "route_requested",
  "route_generated",
  "route_failed",
  "accessible_route_selected",
  "qr_displayed",
  "qr_opened",
  "ad_started",
  "ad_completed",
  "ad_tapped",
  "kiosk_heartbeat",
  "content_sync",
] as const;
export function isOpen(
  t: Tenant,
  time = new Date(),
  timezone = "Asia/Kolkata",
) {
  const hhmm = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(time);
  return (
    t.status === "ACTIVE" &&
    (t.openingTime <= t.closingTime
      ? hhmm >= t.openingTime && hhmm < t.closingTime
      : hhmm >= t.openingTime || hhmm < t.closingTime)
  );
}
