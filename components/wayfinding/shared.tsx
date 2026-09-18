"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  ExternalLink,
  Film,
  Globe,
  Heart,
  Home,
  Info,
  Layers,
  LocateFixed,
  MapPin,
  Maximize2,
  Megaphone,
  Menu,
  Monitor,
  Navigation,
  Phone,
  Play,
  Plus,
  QrCode,
  Search,
  Send,
  Settings,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Store,
  Tag,
  Trash2,
  Utensils,
  Users,
  Wifi,
  WifiOff,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { demo } from "../../packages/domain/seed";
import type {
  Campaign,
  Floor,
  Route,
  Snapshot,
  Tenant,
} from "../../packages/domain";
import { findRoute, validateGraph } from "../../packages/routing";
import { search as runSearch } from "../../packages/search";
import { idleTransition } from "../../packages/advertising";

export const floorName = (id: string) =>
  demo.floors.find((f) => f.id === id)?.name || id;
export const categoryName = (id: string, data: Snapshot) =>
  data.categories.find((c) => c.id === id)?.name || "Directory";
export const cloneData = (): Snapshot => JSON.parse(JSON.stringify(demo));
export const iconFor = (name: string) =>
  ({
    Fashion: "🛍️",
    Dining: "🍴",
    Entertainment: "🎬",
    Beauty: "✦",
    Electronics: "▣",
    Services: "⚙",
    Cinema: "🎞️",
    "Home & Lifestyle": "⌂",
    Kids: "●",
    Amenities: "♿",
  })[name] || "●";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={"logo " + (compact ? "compact" : "")}>
      <Image
        src="/logo.png"
        alt="Way Ezy - Find Explore Enjoy"
        width={1263}
        height={401}
        priority
      />
    </div>
  );
}
export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [message]);
  return (
    <div className="toast">
      <Check size={17} />
      {message}
    </div>
  );
}

export function MapCanvas({
  data,
  floorId,
  selectedId,
  route,
  zoom = 1,
  onFloorChange,
  onZoom,
  onSelect,
  onExpand,
}: {
  data: Snapshot;
  floorId: string;
  selectedId?: string;
  route?: Route | null;
  zoom?: number;
  onFloorChange: (id: string) => void;
  onZoom: (value: number) => void;
  onSelect?: (tenant: Tenant) => void;
  onExpand?: () => void;
}) {
  const floor = data.floors.find((f) => f.id === floorId) || data.floors[0];
  const features = data.features.filter((f) => f.floorId === floor.id);
  const routeNodes = route?.nodes.filter((n) => n.floorId === floor.id) || [];
  const selected = data.tenants.find((t) => t.id === selectedId);
  const selectedNode =
    selected && data.nodes.find((n) => n.id === selected.nodeId);
  return (
    <div className={"map-canvas " + (zoom > 1 ? "zoomed" : "")}>
      <div className="map-surface" style={{ transform: `scale(${zoom})` }}>
        <svg
          viewBox={`0 0 ${floor.width} ${floor.height}`}
          role="img"
          aria-label={`${floor.name} mall map`}
        >
          <defs>
            <linearGradient id="mapBg" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#f9fbfd" />
              <stop offset="1" stopColor="#eaf1f7" />
            </linearGradient>
            <filter id="shadow">
              <feDropShadow
                dx="0"
                dy="10"
                stdDeviation="10"
                floodColor="#56708c"
                floodOpacity=".15"
              />
            </filter>
          </defs>
          <rect width="1000" height="700" rx="42" fill="url(#mapBg)" />
          <path
            d="M80 350H920M500 60V640M145 160H855M145 540H855"
            stroke="#d5dee8"
            strokeWidth="76"
            strokeLinecap="round"
          />
          <path
            d="M80 350H920M500 60V640M145 160H855M145 540H855"
            stroke="#fff"
            strokeWidth="60"
            strokeLinecap="round"
          />
          <circle
            cx="500"
            cy="350"
            r="124"
            fill="#f2f8fb"
            stroke="#d9e5ee"
            strokeWidth="8"
          />
          <circle
            cx="500"
            cy="350"
            r="74"
            fill="#d9f1e8"
            stroke="#78c4a8"
            strokeWidth="7"
          />
          <circle cx="500" cy="350" r="20" fill="#59ae89" />
          {features.map((feature) => (
            <g
              key={feature.id}
              className={
                "map-feature " +
                (feature.id === selected?.featureId ? "selected" : "")
              }
              onClick={() => {
                const t = data.tenants.find((x) => x.featureId === feature.id);
                if (t && onSelect) onSelect(t);
              }}
            >
              <polygon
                points={feature.points.map((p) => p.join(",")).join(" ")}
                fill={feature.color}
                stroke="#fff"
                strokeWidth="7"
                filter="url(#shadow)"
              />
              <text
                x={feature.points[0][0] + 14}
                y={feature.points[0][1] + 32}
                className="map-store-label"
              >
                {feature.label}
              </text>
            </g>
          ))}
          <text x="445" y="362" className="map-atria">
            ATRIUM
          </text>
          <text x="430" y="615" className="map-small-label">
            FOOD COURT
          </text>
          <text x="110" y="82" className="map-small-label">
            NORTH ENTRY
          </text>
          {[
            ["n-g-lift", "LIFT"],
            ["n-g-esc", "ESC"],
            ["n-g-food", "FOOD"],
            ["n-g-parking", "PARK"],
          ].map(([id, label]) => {
            const n = data.nodes.find((x) => x.id === id);
            if (!n || n.floorId !== floor.id) return null;
            return (
              <g key={id}>
                <circle cx={n.x} cy={n.y} r="23" className="map-poi" />
                <text x={n.x - 18} y={n.y + 43} className="map-poi-label">
                  {label}
                </text>
              </g>
            );
          })}
          {routeNodes.length > 1 && (
            <polyline
              points={routeNodes.map((n) => `${n.x},${n.y}`).join(" ")}
              className="map-route"
            />
          )}
          {floor.id === "g" && (
            <g>
              <circle cx="90" cy="340" r="22" className="map-here" />
              <circle cx="90" cy="340" r="38" className="map-here-ring" />
              <text x="123" y="333" className="map-here-label">
                YOU ARE HERE
              </text>
            </g>
          )}
          {selectedNode && selectedNode.floorId === floor.id && (
            <g>
              <circle
                cx={selectedNode.x}
                cy={selectedNode.y}
                r="25"
                className="map-destination"
              />
              <circle
                cx={selectedNode.x}
                cy={selectedNode.y}
                r="43"
                className="map-destination-ring"
              />
            </g>
          )}
        </svg>
      </div>
      <div className="map-topbar">
        <div className="floor-switcher">
          {data.floors.map((f) => (
            <button
              className={f.id === floor.id ? "active" : ""}
              key={f.id}
              onClick={() => onFloorChange(f.id)}
            >
              {f.level === 0 ? "G" : f.level}
            </button>
          ))}
        </div>
        <button
          className="map-floor-select"
          onClick={() =>
            onFloorChange(
              data.floors[
                (data.floors.findIndex((f) => f.id === floor.id) + 1) %
                  data.floors.length
              ].id,
            )
          }
        >
          {floor.name}
          <ChevronDown size={16} />
        </button>
      </div>
      <div className="map-actions">
        <button
          aria-label="Zoom in"
          onClick={() => onZoom(Math.min(1.3, zoom + 0.1))}
        >
          <ZoomIn size={18} />
        </button>
        <button
          aria-label="Zoom out"
          onClick={() => onZoom(Math.max(0.85, zoom - 0.1))}
        >
          <ZoomOut size={18} />
        </button>
        {onExpand && (
          <button aria-label="Expand map" onClick={onExpand}>
            <Maximize2 size={17} />
          </button>
        )}
      </div>
      <div className="map-legend">
        <span>
          <i className="legend-here" /> You are here
        </span>
        <span>
          <i className="legend-route" /> Route
        </span>
        <span>
          <i className="legend-dest" /> Destination
        </span>
      </div>
      {route && (
        <div className="map-route-pill">
          <Navigation size={16} />
          <strong>{route.minutes} min</strong>
          <span>{route.distance} m</span>
        </div>
      )}
    </div>
  );
}

export function QRModal({
  route,
  tenant,
  onClose,
}: {
  route: Route;
  tenant: Tenant;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const deepLink = `${origin}/go?destination=${encodeURIComponent(tenant.id)}&route=${encodeURIComponent(route.nodes[0]?.id || "n-g-start")}`;
  useEffect(() => {
    QRCode.toDataURL(deepLink, {
      width: 240,
      margin: 1,
      color: { dark: "#102447", light: "#ffffff" },
    }).then(setUrl);
  }, [deepLink]);
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="qr-card">
        <button className="modal-close" onClick={onClose} aria-label="Close QR">
          <X />
        </button>
        <div className="qr-icon">
          <QrCode />
        </div>
        <p className="eyebrow">Continue on your phone</p>
        <h2>Keep your directions with you</h2>
        {url ? (
          <img src={url} alt="QR code for this route" className="qr-image" />
        ) : (
          <div className="qr-loading">Generating secure route…</div>
        )}
        <strong>{tenant.name}</strong>
        <span>
          {route.minutes} min · {route.distance} m · {floorName(tenant.floorId)}
        </span>
        <small>Scan to open Way Go in your browser. No app required.</small>
        <code>{deepLink}</code>
      </div>
    </div>
  );
}

export function ProfilePanel({
  data,
  tenant,
  onClose,
  onDirections,
  onSendPhone,
}: {
  data: Snapshot;
  tenant: Tenant;
  onClose: () => void;
  onDirections: () => void;
  onSendPhone: () => void;
}) {
  const offer = data.offers.find((o) => o.tenantId === tenant.id);
  return (
    <aside className="profile-panel">
      <button
        className="profile-close"
        onClick={onClose}
        aria-label="Close profile"
      >
        <X />
      </button>
      <img src={tenant.heroImage} alt="" className="profile-hero" />
      <div className="profile-body">
        <div className="profile-heading">
          <div className="tenant-mark">
            {iconFor(categoryName(tenant.categoryId, data))}
          </div>
          <div>
            <h2>{tenant.name}</h2>
            <span>
              {categoryName(tenant.categoryId, data)} ·{" "}
              {floorName(tenant.floorId)} · {tenant.unitNumber}
            </span>
          </div>
          <Heart className="heart" />
        </div>
        <div className="open-now">
          <span>●</span> Open now{" "}
          <b>
            {tenant.openingTime} – {tenant.closingTime}
          </b>
        </div>
        <p className="profile-description">{tenant.description}</p>
        <p className="eyebrow">Known for</p>
        <div className="tag-row">
          {tenant.productTypes.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        {offer && (
          <div className="offer-card">
            <div className="offer-icon">
              <Tag />
            </div>
            <div>
              <strong>{offer.title}</strong>
              <span>{offer.description}</span>
            </div>
            <ChevronRight />
          </div>
        )}
        <div className="profile-actions">
          <button className="primary" onClick={onDirections}>
            <Navigation size={18} /> Get directions
          </button>
          <button className="outline" onClick={onSendPhone}>
            <Send size={18} /> Send to phone
          </button>
          <button
            className="outline"
            onClick={() => window.open(tenant.website, "_blank")}
          >
            <Globe size={18} /> Website
          </button>
        </div>
      </div>
    </aside>
  );
}

export function RouteView({
  data,
  tenant,
  route,
  accessible,
  setAccessible,
  onBack,
  onHome,
}: {
  data: Snapshot;
  tenant: Tenant;
  route: Route;
  accessible: boolean;
  setAccessible: (v: boolean) => void;
  onBack: () => void;
  onHome: () => void;
}) {
  const [activeFloor, setActiveFloor] = useState(route.floorIds[0]);
  const [zoom, setZoom] = useState(1);
  const [qr, setQr] = useState(false);
  const reroute = (value: boolean) => {
    setAccessible(value);
    setActiveFloor(route.floorIds[0]);
  };
  return (
    <div className="route-view">
      <div className="route-header">
        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={17} /> Back to profile
        </button>
        <div>
          <p className="eyebrow">Your route to</p>
          <h1>{tenant.name}</h1>
          <span>
            {floorName(tenant.floorId)} · {tenant.unitNumber}
          </span>
        </div>
        <button className="outline" onClick={onHome}>
          <Home size={17} /> Start over
        </button>
      </div>
      <div className="route-layout">
        <div className="route-map-wrap">
          <MapCanvas
            data={data}
            floorId={activeFloor}
            selectedId={tenant.id}
            route={route}
            zoom={zoom}
            onFloorChange={setActiveFloor}
            onZoom={setZoom}
          />
          <div className="route-floor-tabs">
            {route.floorIds.map((id) => (
              <button
                className={activeFloor === id ? "active" : ""}
                key={id}
                onClick={() => setActiveFloor(id)}
              >
                {floorName(id)}
              </button>
            ))}
          </div>
        </div>
        <aside className="route-card">
          <div className="route-metrics">
            <div>
              <strong>{route.minutes} min</strong>
              <span>walking time</span>
            </div>
            <div>
              <strong>{route.distance} m</strong>
              <span>distance</span>
            </div>
            <div>
              <strong>{route.floorIds.length}</strong>
              <span>floor{route.floorIds.length === 1 ? "" : "s"}</span>
            </div>
          </div>
          <button
            className={"route-mode " + (accessible ? "selected" : "")}
            onClick={() => reroute(!accessible)}
          >
            <Accessibility size={21} />
            <span>
              <b>{accessible ? "Accessible route" : "Standard route"}</b>
              <small>
                {accessible
                  ? "Lift and step-free paths selected"
                  : "Fastest walking path"}
              </small>
            </span>
            <i className="toggle" />
          </button>
          <div className="steps">
            <p className="eyebrow">Step-by-step directions</p>
            {route.steps.map((step, i) => (
              <div
                className={"route-step " + (step.connector ? "connector" : "")}
                key={`${step.nodeId}-${i}`}
              >
                <span>{step.connector ? "↕" : i + 1}</span>
                <div>
                  <strong>{step.text}</strong>
                  <small>
                    {step.distance ? `${Math.round(step.distance)} m` : ""}
                  </small>
                </div>
              </div>
            ))}
          </div>
          <button className="primary route-send" onClick={() => setQr(true)}>
            <QrCode size={18} /> Send to phone
          </button>
          <button className="outline wide" onClick={() => setQr(true)}>
            Show QR code
          </button>
        </aside>
      </div>
      {qr && (
        <QRModal route={route} tenant={tenant} onClose={() => setQr(false)} />
      )}
    </div>
  );
}
