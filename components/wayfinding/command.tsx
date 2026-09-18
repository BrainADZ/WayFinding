"use client";

import React, { useEffect, useMemo, useState } from "react";
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

import {
  categoryName,
  floorName,
  iconFor,
  Logo,
  MapCanvas,
  Toast,
} from "./shared";

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  color,
  onClick,
}: {
  icon: any;
  label: string;
  value: string;
  delta: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="stat-card"
      onClick={onClick}
      style={{ "--stat": color } as React.CSSProperties}
    >
      <span className="stat-icon">
        <Icon />
      </span>
      <small>{label}</small>
      <strong>{value}</strong>
      <em>{delta}</em>
    </button>
  );
}
export function Command({
  data,
  setData,
}: {
  data: Snapshot;
  setData: React.Dispatch<React.SetStateAction<Snapshot>>;
}) {
  const [section, setSection] = useState("Dashboard");
  const [toast, setToast] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const nav = [
    ["Dashboard", BarChart3],
    ["Venue", Home],
    ["Floors & Maps", Layers],
    ["Routing", Navigation],
    ["Tenants & Stores", Store],
    ["Categories", SlidersHorizontal],
    ["Amenities & POIs", MapPin],
    ["Offers & Promotions", Tag],
    ["Events", CalendarDays],
    ["Advertising", Megaphone],
    ["Media Library", Film],
    ["Screens & Devices", Monitor],
    ["Analytics", BarChart3],
    ["Users", Users],
    ["Roles & Permissions", Settings],
    ["Branding", Sparkles],
    ["Languages", Globe],
    ["System Settings", Settings],
    ["Audit Log", Clock3],
  ] as const;
  const publish = (message = "Published changes to Kiosk + Way Go") => {
    setData({ ...data, version: String(Date.now()) });
    setToast(message);
  };
  return (
    <div className="command-shell">
      <aside className="command-sidebar">
        <Logo compact />
        <div className="command-product">
          <strong>Command</strong>
          <span>Mall Wayfinding Management</span>
        </div>
        <div className="sidebar-nav">
          {nav.map(([label, Icon]) => (
            <button
              key={label}
              className={section === label ? "active" : ""}
              onClick={() => setSection(label)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
        <div className="sidebar-help">
          <CircleHelp />
          <b>Need help?</b>
          <span>View guides or contact support.</span>
          <button onClick={() => setToast("Help centre opened")}>
            Open Help Centre
          </button>
        </div>
      </aside>
      <main className="command-main">
        <header className="command-header">
          <div className="command-search">
            <Search size={18} /> Search anything{" "}
            <span>(stores, screens, campaigns, etc.)</span>
          </div>
          <button className="venue-select">
            ▥ Demo Mall <ChevronDown size={15} />
          </button>
          <button className="admin-menu">
            <span>BA</span>
            <b>
              BrainADZ Admin<small>Super Admin</small>
            </b>
            <ChevronDown size={15} />
          </button>
        </header>
        <div className="command-content">
          <div className="command-title">
            <div>
              <p className="eyebrow">
                Riverside Shopping Centre · BrainADZ Way
              </p>
              <h1>{section}</h1>
              <span>
                {section === "Dashboard"
                  ? "Overview of your shopping centre today."
                  : `Manage ${section.toLowerCase()} across Riverside.`}
              </span>
            </div>
            <button className="primary" onClick={() => setShowCreate(true)}>
              <Plus size={18} /> Create new
            </button>
          </div>
          {section === "Dashboard" ? (
            <Dashboard data={data} onNavigate={setSection} />
          ) : (
            <CommandSection
              section={section}
              data={data}
              setData={setData}
              onPublish={publish}
              onToast={setToast}
            />
          )}
        </div>
      </main>
      {showCreate && (
        <CreateModal
          section={section}
          onClose={() => setShowCreate(false)}
          onCreate={(message) => {
            setShowCreate(false);
            setToast(message);
          }}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}

function Dashboard({
  data,
  onNavigate,
}: {
  data: Snapshot;
  onNavigate: (section: string) => void;
}) {
  return (
    <>
      <div className="stats-grid">
        <StatCard
          icon={Monitor}
          label="Kiosks online"
          value="3 / 4"
          delta="↑ 20% vs last week"
          color="#2bc083"
          onClick={() => onNavigate("Screens & Devices")}
        />
        <StatCard
          icon={Search}
          label="Searches today"
          value="1,842"
          delta="↑ 12% vs last week"
          color="#0866ff"
          onClick={() => onNavigate("Analytics")}
        />
        <StatCard
          icon={Navigation}
          label="Routes today"
          value="918"
          delta="↑ 18% vs last week"
          color="#8257e9"
          onClick={() => onNavigate("Analytics")}
        />
        <StatCard
          icon={QrCode}
          label="QR hand-offs"
          value="381"
          delta="↑ 25% vs last week"
          color="#ef8039"
          onClick={() => onNavigate("Analytics")}
        />
        <StatCard
          icon={Play}
          label="Ad plays"
          value="6,220"
          delta="↑ 8% vs last week"
          color="#e25d73"
          onClick={() => onNavigate("Advertising")}
        />
      </div>
      <div className="dashboard-grid">
        <div className="admin-panel usage-panel">
          <div className="panel-title">
            <h2>Usage overview</h2>
            <button>
              Last 7 days <ChevronDown size={15} />
            </button>
          </div>
          <div className="admin-chart">
            <svg viewBox="0 0 760 240" preserveAspectRatio="none">
              <path
                d="M0 200 L110 150 L220 170 L330 100 L440 127 L550 66 L650 108 L760 30"
                fill="none"
                stroke="#0866ff"
                strokeWidth="5"
              />
              <path
                d="M0 220 L110 210 L220 193 L330 172 L440 182 L550 145 L650 156 L760 120"
                fill="none"
                stroke="#27bce7"
                strokeWidth="4"
              />
              <path
                d="M0 230 L110 222 L220 215 L330 204 L440 210 L550 195 L650 198 L760 182"
                fill="none"
                stroke="#e25d73"
                strokeWidth="3"
              />
            </svg>
            <div className="chart-legend">
              <span>
                <i className="blue" /> Searches
              </span>
              <span>
                <i className="cyan" /> Routes
              </span>
              <span>
                <i className="pink" /> Ad plays
              </span>
            </div>
          </div>
        </div>
        <div className="admin-panel">
          <div className="panel-title">
            <h2>Live devices</h2>
            <button onClick={() => onNavigate("Screens & Devices")}>
              View all
            </button>
          </div>
          {data.devices.map((device) => (
            <button
              className="device-row"
              key={device.id}
              onClick={() => onNavigate("Screens & Devices")}
            >
              <i
                className={
                  device.status === "ACTIVE" ? "online-dot" : "offline-dot"
                }
              />
              <b>{device.id.toUpperCase()}</b>
              <span>{device.locationDescription}</span>
              <em
                className={
                  device.status === "ACTIVE"
                    ? "status-online"
                    : "status-offline"
                }
              >
                {device.status === "ACTIVE" ? "Online" : "Maintenance"}
              </em>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
        <div className="admin-panel">
          <div className="panel-title">
            <h2>Top searches</h2>
            <button onClick={() => onNavigate("Analytics")}>View all</button>
          </div>
          {[
            ["Zara", "482"],
            ["Italian food", "421"],
            ["Cinema", "318"],
            ["Shoes", "276"],
            ["Coffee", "198"],
          ].map(([name, value], i) => (
            <button
              className="table-line"
              key={name}
              onClick={() => onNavigate("Analytics")}
            >
              <small>{i + 1}</small>
              <b>{name}</b>
              <span>{value}</span>
            </button>
          ))}
        </div>
        <div className="admin-panel">
          <div className="panel-title">
            <h2>Current ad campaigns</h2>
            <button onClick={() => onNavigate("Advertising")}>View all</button>
          </div>
          {data.campaigns.map((c) => (
            <button
              className="campaign-line"
              key={c.id}
              onClick={() => onNavigate("Advertising")}
            >
              <span className="campaign-swatch" />
              <div>
                <b>{c.name}</b>
                <small>
                  All screens · {c.startDate} – {c.endDate}
                </small>
              </div>
              <em className="status-online">{c.status}</em>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function CommandSection({
  section,
  data,
  setData,
  onPublish,
  onToast,
}: {
  section: string;
  data: Snapshot;
  setData: React.Dispatch<React.SetStateAction<Snapshot>>;
  onPublish: (message?: string) => void;
  onToast: (message: string) => void;
}) {
  if (section === "Tenants & Stores")
    return <TenantEditor data={data} setData={setData} onPublish={onPublish} />;
  if (section === "Advertising")
    return (
      <CampaignEditor data={data} setData={setData} onPublish={onPublish} />
    );
  if (section === "Routing")
    return (
      <RoutingEditor data={data} setData={setData} onPublish={onPublish} />
    );
  if (section === "Floors & Maps")
    return <MapEditor data={data} onPublish={onPublish} />;
  if (section === "Screens & Devices")
    return <DeviceEditor data={data} setData={setData} onToast={onToast} />;
  if (section === "Analytics") return <AnalyticsPanel onToast={onToast} />;
  if (section === "Venue")
    return <VenueEditor data={data} setData={setData} onPublish={onPublish} />;
  return <ContentManager section={section} data={data} onToast={onToast} />;
}
function TenantEditor({
  data,
  setData,
  onPublish,
}: {
  data: Snapshot;
  setData: React.Dispatch<React.SetStateAction<Snapshot>>;
  onPublish: (message?: string) => void;
}) {
  const [selected, setSelected] = useState(data.tenants[1]);
  const update = (patch: Partial<Tenant>) => {
    setSelected({ ...selected, ...patch });
    setData({
      ...data,
      tenants: data.tenants.map((t) =>
        t.id === selected.id ? { ...t, ...patch } : t,
      ),
    });
  };
  return (
    <div className="editor-grid">
      <div className="admin-panel tenant-list">
        <div className="filter-line">
          <div className="small-search">
            <Search size={16} /> Search tenants
          </div>
          <button className="outline">
            <SlidersHorizontal size={15} /> Filter
          </button>
        </div>
        {data.tenants.map((t) => (
          <button
            key={t.id}
            className={"tenant-row " + (selected.id === t.id ? "active" : "")}
            onClick={() => setSelected(t)}
          >
            <span className="avatar">{t.name[0]}</span>
            <span>
              <b>{t.name}</b>
              <small>
                {categoryName(t.categoryId, data)} · {floorName(t.floorId)}
              </small>
            </span>
            <em className="status-online">Active</em>
          </button>
        ))}
      </div>
      <div className="admin-panel editor-form">
        <div className="editor-head">
          <div>
            <p className="eyebrow">Edit tenant</p>
            <h2>{selected.name}</h2>
          </div>
          <button
            className="outline"
            onClick={() => onPublish("Tenant preview updated")}
          >
            Preview profile
          </button>
        </div>
        <div className="form-tabs">
          <span className="active">Basics</span>
          <span>Profile</span>
          <span>Products & tags</span>
          <span>Hours</span>
          <span>Media</span>
        </div>
        <label>
          Tenant name
          <input
            value={selected.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </label>
        <div className="form-two">
          <label>
            Category
            <select
              value={selected.categoryId}
              onChange={(e) => update({ categoryId: e.target.value })}
            >
              {data.categories.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Floor & unit
            <input
              value={`${floorName(selected.floorId)} · ${selected.unitNumber}`}
              readOnly
            />
          </label>
        </div>
        <label>
          Short summary
          <textarea
            value={selected.shortSummary}
            onChange={(e) => update({ shortSummary: e.target.value })}
          />
        </label>
        <label>
          Description
          <textarea
            value={selected.description}
            onChange={(e) => update({ description: e.target.value })}
          />
        </label>
        <label>
          Search keywords
          <input
            value={selected.keywords.join(", ")}
            onChange={(e) =>
              update({
                keywords: e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
        <div className="form-actions">
          <button className="outline">Save draft</button>
          <button
            className="primary"
            onClick={() =>
              onPublish("Tenant changes published to Kiosk + Way Go")
            }
          >
            Publish changes
          </button>
        </div>
      </div>
    </div>
  );
}
function CampaignEditor({
  data,
  onPublish,
}: {
  data: Snapshot;
  setData: React.Dispatch<React.SetStateAction<Snapshot>>;
  onPublish: (message?: string) => void;
}) {
  const [campaign, setCampaign] = useState<Campaign>(data.campaigns[0]);
  return (
    <div className="editor-grid campaign-grid">
      <div className="admin-panel campaign-list">
        <div className="panel-title">
          <h2>Campaigns</h2>
          <span>{data.campaigns.length} campaigns</span>
        </div>
        {[
          ...data.campaigns,
          {
            id: "draft-new",
            name: "Festive Market",
            advertiser: "Riverside Centre",
            description: "Seasonal shopping",
            status: "DRAFT",
            startDate: "2026-10-01",
            endDate: "2026-12-31",
            startTime: "10:00",
            endTime: "22:00",
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
            mediaId: "media-fashion",
            duration: 15,
            priority: "NORMAL",
            targetType: "ALL",
            targets: [],
          } as Campaign,
        ].map((c) => (
          <button
            key={c.id}
            className={
              "campaign-select " + (campaign.id === c.id ? "active" : "")
            }
            onClick={() => setCampaign(c)}
          >
            <span className="campaign-swatch" />
            <span>
              <b>{c.name}</b>
              <small>
                {c.startDate} – {c.endDate}
              </small>
            </span>
            <em
              className={
                c.status === "ACTIVE" ? "status-online" : "status-blue"
              }
            >
              {c.status}
            </em>
          </button>
        ))}
      </div>
      <div className="admin-panel editor-form">
        <div className="editor-head">
          <div>
            <p className="eyebrow">Create / edit ad campaign</p>
            <h2>{campaign.name}</h2>
          </div>
          <span className="status-online">Changes saved</span>
        </div>
        <label>
          Campaign name
          <input
            value={campaign.name}
            onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
          />
        </label>
        <label>
          Advertiser
          <input
            value={campaign.advertiser}
            onChange={(e) =>
              setCampaign({ ...campaign, advertiser: e.target.value })
            }
          />
        </label>
        <div className="form-two">
          <label>
            Start date
            <input
              type="date"
              value={campaign.startDate}
              onChange={(e) =>
                setCampaign({ ...campaign, startDate: e.target.value })
              }
            />
          </label>
          <label>
            End date
            <input
              type="date"
              value={campaign.endDate}
              onChange={(e) =>
                setCampaign({ ...campaign, endDate: e.target.value })
              }
            />
          </label>
        </div>
        <div className="form-two">
          <label>
            Target screens
            <select
              value={campaign.targetType}
              onChange={(e) =>
                setCampaign({
                  ...campaign,
                  targetType: e.target.value as Campaign["targetType"],
                })
              }
            >
              <option value="ALL">All screens</option>
              <option value="FLOOR">Specific floor</option>
              <option value="DEVICE">Specific kiosk</option>
              <option value="GROUP">Device group</option>
            </select>
          </label>
          <label>
            Priority
            <select
              value={campaign.priority}
              onChange={(e) =>
                setCampaign({
                  ...campaign,
                  priority: e.target.value as Campaign["priority"],
                })
              }
            >
              <option>LOW</option>
              <option>NORMAL</option>
              <option>HIGH</option>
            </select>
          </label>
        </div>
        <div className="media-preview">
          <img
            src={
              data.media.find((m) => m.id === campaign.mediaId)?.url ||
              data.media[0].url
            }
            alt="Campaign media"
          />
          <div>
            <b>
              {data.media.find((m) => m.id === campaign.mediaId)?.name ||
                "campaign-media.jpg"}
            </b>
            <span>1600 × 900 · Ready for playback</span>
            <button
              className="outline"
              onClick={() => onPublish("Media library opened")}
            >
              Change media
            </button>
          </div>
        </div>
        <div className="form-actions">
          <button
            className="outline"
            onClick={() => onPublish("Campaign saved as draft")}
          >
            Save as draft
          </button>
          <button
            className="primary"
            onClick={() => onPublish("Campaign published to targeted screens")}
          >
            Publish campaign
          </button>
        </div>
      </div>
    </div>
  );
}
function RoutingEditor({
  data,
  setData,
  onPublish,
}: {
  data: Snapshot;
  setData: React.Dispatch<React.SetStateAction<Snapshot>>;
  onPublish: (message?: string) => void;
}) {
  const [closed, setClosed] = useState(false);
  const [activeFloor, setActiveFloor] = useState("g");
  const [zoom, setZoom] = useState(1);
  const issues = validateGraph(data.nodes, data.edges);
  return (
    <div className="routing-grid">
      <div className="admin-panel map-admin">
        <div className="panel-title">
          <h2>Route graph validation</h2>
          <button className="outline" onClick={() => onPublish()}>
            Publish map
          </button>
        </div>
        <MapCanvas
          data={data}
          floorId={activeFloor}
          onFloorChange={setActiveFloor}
          onZoom={setZoom}
          zoom={zoom}
        />
        <div className="validation">
          <Check size={17} />{" "}
          {issues.length
            ? issues.join(" · ")
            : `Graph healthy · ${data.nodes.length} nodes · ${data.edges.filter((e) => e.active).length} active edges · 3 floors connected`}
        </div>
      </div>
      <div className="admin-panel closure-admin">
        <div className="panel-title">
          <h2>Closures & detours</h2>
          <span>Live preview</span>
        </div>
        <div className={"closure-card " + (closed ? "closed" : "")}>
          <div>
            <b>e2 · Main corridor</b>
            <span>Ground Floor · 120 m · Accessible path</span>
          </div>
          <button
            className={closed ? "status-offline" : "status-online"}
            onClick={() => {
              setClosed(!closed);
              setData({
                ...data,
                edges: data.edges.map((e) =>
                  e.id === "e2" ? { ...e, active: closed } : e,
                ),
              });
            }}
          >
            {closed ? "Closed" : "Open"}
          </button>
        </div>
        {closed && (
          <div className="notice">
            <WifiOff size={17} /> Routes recalculate around this closure.
            <button
              onClick={() => onPublish("Detour published to Kiosk + Way Go")}
            >
              Publish detour
            </button>
          </div>
        )}
        <div className="connector-list">
          <div>
            <span>↕</span> Lift <b>G → 1 → 2</b>
          </div>
          <div>
            <span>↕</span> Escalator <b>G → 1 → 2</b>
          </div>
          <div>
            <span>♿</span> Accessible paths <b>Enabled</b>
          </div>
        </div>
      </div>
    </div>
  );
}
function MapEditor({
  data,
  onPublish,
}: {
  data: Snapshot;
  onPublish: (message?: string) => void;
}) {
  const [floor, setFloor] = useState("g");
  const [zoom, setZoom] = useState(1);
  return (
    <div className="admin-panel map-editor">
      <div className="panel-title">
        <h2>Floors & maps</h2>
        <div>
          <select value={floor} onChange={(e) => setFloor(e.target.value)}>
            {data.floors.map((f) => (
              <option value={f.id} key={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <button className="primary" onClick={() => onPublish()}>
            Publish map
          </button>
        </div>
      </div>
      <MapCanvas
        data={data}
        floorId={floor}
        onFloorChange={setFloor}
        onZoom={setZoom}
        zoom={zoom}
      />
      <div className="map-tools">
        <button onClick={() => onPublish("Map feature tool ready")}>
          <MapPin /> Place POI
        </button>
        <button onClick={() => onPublish("Tenant polygon tool ready")}>
          <Store /> Assign tenant
        </button>
        <button onClick={() => onPublish("Route node tool ready")}>
          <Navigation /> Add route node
        </button>
        <button onClick={() => onPublish("Map validation complete")}>
          <Check /> Validate map
        </button>
      </div>
    </div>
  );
}
function DeviceEditor({
  data,
  setData,
  onToast,
}: {
  data: Snapshot;
  setData: React.Dispatch<React.SetStateAction<Snapshot>>;
  onToast: (message: string) => void;
}) {
  return (
    <div className="admin-panel device-admin">
      <div className="panel-title">
        <h2>Screens & devices</h2>
        <button
          className="outline"
          onClick={() => onToast("Heartbeat sync requested for all screens")}
        >
          <Wifi size={16} /> Sync all
        </button>
      </div>
      {data.devices.map((d) => (
        <div className="device-detail" key={d.id}>
          <i className={d.status === "ACTIVE" ? "online-dot" : "offline-dot"} />
          <div>
            <b>{d.name}</b>
            <span>
              {floorName(d.floorId)} · {d.locationDescription}
            </span>
          </div>
          <span>
            <small>Last heartbeat</small>
            <b>2 min ago</b>
          </span>
          <span>
            <small>Content sync</small>
            <b>{data.version.slice(0, 10)}</b>
          </span>
          <button
            className={
              d.status === "ACTIVE" ? "status-online" : "status-offline"
            }
            onClick={() => {
              setData({
                ...data,
                devices: data.devices.map((x) =>
                  x.id === d.id
                    ? {
                        ...x,
                        status:
                          x.status === "ACTIVE" ? "MAINTENANCE" : "ACTIVE",
                      }
                    : x,
                ),
              });
              onToast(`${d.id.toUpperCase()} status updated`);
            }}
          >
            {d.status === "ACTIVE" ? "Online" : "Maintenance"}
          </button>
        </div>
      ))}
    </div>
  );
}
function AnalyticsPanel({ onToast }: { onToast: (message: string) => void }) {
  return (
    <div className="analytics-grid">
      <div className="admin-panel analytics-hero">
        <div className="panel-title">
          <h2>Visitor engagement</h2>
          <button
            className="outline"
            onClick={() => onToast("Date filter set to Last 7 days")}
          >
            Last 7 days <ChevronDown />
          </button>
        </div>
        <div className="analytics-kpis">
          <span>
            <b>1,842</b>
            <small>Searches</small>
          </span>
          <span>
            <b>918</b>
            <small>Routes</small>
          </span>
          <span>
            <b>381</b>
            <small>QR rate 41%</small>
          </span>
          <span>
            <b>6,220</b>
            <small>Ad plays</small>
          </span>
        </div>
        <div className="big-chart">
          <svg viewBox="0 0 900 260" preserveAspectRatio="none">
            <path
              d="M0 210 C110 190 170 200 260 135 S420 205 520 90 S700 138 900 32"
              fill="none"
              stroke="#0866ff"
              strokeWidth="6"
            />
            <path
              d="M0 234 C120 219 180 220 280 185 S420 226 520 160 S700 188 900 100"
              fill="none"
              stroke="#27bce7"
              strokeWidth="5"
            />
          </svg>
        </div>
      </div>
      <div className="admin-panel">
        <div className="panel-title">
          <h2>Zero-result searches</h2>
          <button onClick={() => onToast("Export prepared")}>Export</button>
        </div>
        {["vegan bakery", "sports watch", "accessible cinema"].map((x, i) => (
          <div className="analytics-line" key={x}>
            <b>{x}</b>
            <span>{[38, 24, 12][i]} searches</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function VenueEditor({
  data,
  setData,
  onPublish,
}: {
  data: Snapshot;
  setData: React.Dispatch<React.SetStateAction<Snapshot>>;
  onPublish: (message?: string) => void;
}) {
  const [venue, setVenue] = useState(data.venue);
  return (
    <div className="admin-panel editor-form venue-form">
      <div className="editor-head">
        <div>
          <p className="eyebrow">Property settings</p>
          <h2>Venue profile</h2>
        </div>
        <button
          className="primary"
          onClick={() => {
            setData({ ...data, venue });
            onPublish("Venue settings published");
          }}
        >
          Publish venue
        </button>
      </div>
      <label>
        Centre name
        <input
          value={venue.name}
          onChange={(e) => setVenue({ ...venue, name: e.target.value })}
        />
      </label>
      <label>
        Address
        <input
          value={venue.address}
          onChange={(e) => setVenue({ ...venue, address: e.target.value })}
        />
      </label>
      <label>
        Visitor-facing description
        <textarea
          value={venue.description}
          onChange={(e) => setVenue({ ...venue, description: e.target.value })}
        />
      </label>
      <div className="brand-preview">
        <span style={{ background: venue.brandColor }} />
        <div>
          <b>BrainADZ Way</b>
          <small>Accent colour preview</small>
        </div>
      </div>
    </div>
  );
}
function ContentManager({
  section,
  data,
  onToast,
}: {
  section: string;
  data: Snapshot;
  onToast: (message: string) => void;
}) {
  const labels =
    section === "Categories"
      ? data.categories.map((x) => x.name)
      : section === "Amenities & POIs"
        ? data.pois.map((x) => x.name)
        : section === "Offers & Promotions"
          ? data.offers.map((x) => x.title)
          : section === "Events"
            ? ["Winter light festival", "Kids craft weekend"]
            : section === "Media Library"
              ? data.media.map((x) => x.name)
              : section === "Users"
                ? ["BrainADZ Admin", "Mall Manager", "Content Editor"]
                : section === "Roles & Permissions"
                  ? ["Super Admin", "Mall Admin", "Content Manager", "Analyst"]
                  : section === "Branding"
                    ? [
                        "Logo and identity",
                        "Accent colours",
                        "Visitor language",
                      ]
                    : section === "Languages"
                      ? [
                          "English · Active",
                          "Hindi · Ready to publish",
                          "Arabic · Planned",
                        ]
                      : section === "System Settings"
                        ? [
                            "Idle timeout · 10 seconds",
                            "Default language · English",
                            "Offline cache · Enabled",
                          ]
                        : [
                            "Tenant edits",
                            "Map published",
                            "Campaign activated",
                          ];
  return (
    <div className="admin-panel content-manager">
      <div className="panel-title">
        <h2>{section}</h2>
        <button
          className="primary"
          onClick={() => onToast(`${section} create form opened`)}
        >
          <Plus size={16} /> Add new
        </button>
      </div>
      <div className="content-cards">
        {labels.map((label, i) => (
          <button
            className="content-card"
            key={label}
            onClick={() => onToast(`${label} opened for editing`)}
          >
            <span className="content-card-icon">{iconFor(section)}</span>
            <div>
              <b>{label}</b>
              <small>
                {section === "Categories"
                  ? "Directory category"
                  : section === "Amenities & POIs"
                    ? "Mapped point of interest"
                    : section === "Audit Log"
                      ? "Published action"
                      : "Connected to Riverside Shopping Centre"}
              </small>
            </div>
            <ChevronRight />
          </button>
        ))}
      </div>
    </div>
  );
}
function CreateModal({
  section,
  onClose,
  onCreate,
}: {
  section: string;
  onClose: () => void;
  onCreate: (message: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <div className="modal">
      <div className="create-card">
        <button className="modal-close" onClick={onClose}>
          <X />
        </button>
        <p className="eyebrow">Create new</p>
        <h2>{section}</h2>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`New ${section.toLowerCase()} name`}
        />
        <div className="form-actions">
          <button className="outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="primary"
            onClick={() => onCreate(`${value || "New item"} saved as draft`)}
          >
            Save draft
          </button>
        </div>
      </div>
    </div>
  );
}
