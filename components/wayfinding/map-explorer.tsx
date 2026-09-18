"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Accessibility,
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Bell,
  Check,
  ChevronDown,
  Clock3,
  CornerUpLeft,
  CornerUpRight,
  Globe,
  MapPin,
  Menu,
  Navigation,
  Phone,
  QrCode,
  Search,
  Share2,
  SlidersHorizontal,
  Store,
  X,
} from "lucide-react";
import { isOpen, type Snapshot } from "../../packages/domain";
import { findRoute } from "../../packages/routing";
import { search } from "../../packages/search";
import { Logo } from "./shared";
import { mapPlaces, placeColor, type MapPlace } from "./explorer-model";
import { PlaceIcon } from "./place-icon";
import { ExplorerMap } from "./explorer-map";
import { RouteQRModal } from "./route-qr-modal";

type Panel = "search" | "details" | "plan" | "steps";
type SearchTab = "Categories" | "Popular" | "Amenities";

function StepIcon({ text, connector }: { text: string; connector: boolean }) {
  const Icon = connector
    ? ArrowUpDown
    : text.includes("arrived")
      ? MapPin
      : text.includes("left")
        ? CornerUpLeft
        : text.includes("right")
          ? CornerUpRight
          : ArrowUp;
  return <Icon size={22} aria-hidden="true" />;
}

export function MapExplorer({
  data,
  onReturnToAd,
}: {
  data: Snapshot;
  onReturnToAd: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const places = useMemo(() => mapPlaces(data), [data]);
  const [panel, setPanel] = useState<Panel>("search");
  const [selectedId, setSelectedId] = useState<string>();
  const [floorId, setFloorId] = useState(data.floors[0]?.id ?? "g");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SearchTab>("Popular");
  const [category, setCategory] = useState("");
  const [floorFilter, setFloorFilter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [originId, setOriginId] = useState("start");
  const [accessible, setAccessible] = useState(false);
  const [step, setStep] = useState(0);
  const [utility, setUtility] = useState<
    "menu" | "language" | "notifications" | "offers" | null
  >(null);
  const [now, setNow] = useState<Date | null>(null);
  const [message, setMessage] = useState("");
  const [showRouteQR, setShowRouteQR] = useState(false);
  const selected = places.find((place) => place.id === selectedId);
  const startNode = data.devices[0]?.routeStartNode ?? data.nodes[0]?.id ?? "";
  const origin =
    originId === "start"
      ? undefined
      : places.find((place) => place.id === originId);
  const originNodeId = origin?.nodeId ?? startNode;
  const routing = panel === "plan" || panel === "steps";
  const route = useMemo(
    () =>
      routing && selected
        ? findRoute(
            data.nodes,
            data.edges,
            originNodeId,
            selected.nodeId,
            accessible,
            data.floors,
          )
        : null,
    [routing, selected, data, originNodeId, accessible],
  );
  const activeStep = panel === "steps" ? route?.steps[step] : undefined;
  const floorName = (id: string) =>
    data.floors.find((floor) => floor.id === id)?.name ?? id;
  const matches = useMemo(() => {
    const ids = search(data, query, category, floorFilter).map(
      (result) => result.id,
    );
    return ids
      .map((id) => places.find((place) => place.id === id))
      .filter(
        (place): place is MapPlace =>
          !!place && (tab !== "Amenities" || place.kind === "poi"),
      );
  }, [data, query, category, floorFilter, tab, places]);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3500);
    return () => clearTimeout(timer);
  }, [message]);
  useEffect(() => {
    if (panel === "search") searchInput.current?.focus();
  }, [panel]);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const typing = (event.target as HTMLElement).matches(
        "input, textarea, select",
      );
      if (
        (event.key === "k" && (event.ctrlKey || event.metaKey)) ||
        (event.key === "/" && !typing)
      ) {
        event.preventDefault();
        setPanel("search");
        setUtility(null);
      }
      if (event.key === "Escape") {
        if (showRouteQR) {
          setShowRouteQR(false);
          return;
        }
        setPanel("search");
        setSelectedId(undefined);
        setUtility(null);
        searchTrigger.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showRouteQR]);
  useEffect(() => {
    if (panel === "steps")
      document
        .querySelector('.explorer-step[aria-current="step"]')
        ?.scrollIntoView({ block: "nearest" });
  }, [panel, step]);

  function selectPlace(place: MapPlace) {
    setSelectedId(place.id);
    setFloorId(place.floorId);
    setPanel("details");
    setStep(0);
    setUtility(null);
  }
  function closePanel() {
    setPanel("search");
    setSelectedId(undefined);
    searchTrigger.current?.focus();
  }
  function changeStep(index: number) {
    if (!route?.steps[index]) return;
    setStep(index);
    setFloorId(route.steps[index].floorId);
  }
  function openSearch() {
    setPanel("search");
    searchInput.current?.focus();
    setSelectedId(undefined);
    setUtility(null);
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await root.current?.requestFullscreen();
    } catch {
      setMessage("Fullscreen is not available in this browser.");
    }
  }
  async function share() {
    if (!selected) return;
    const url = `${location.origin}/?place=${encodeURIComponent(selected.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Place link copied.");
    } catch {
      setMessage(
        "Link could not be copied. Use the browser address bar to share this page.",
      );
    }
  }
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("place");
    const place = places.find((item) => item.id === id);
    if (place) selectPlace(place);
  }, [places]);

  const tenantOpen =
    selected?.tenant && now
      ? isOpen(selected.tenant, now, data.venue.timezone)
      : null;
  const availability = selected?.tenant
    ? tenantOpen === null
      ? "Hours below"
      : tenantOpen
        ? "Open now"
        : "Closed"
    : "Amenity";

  return (
    <div className="map-experience" ref={root}>
      <header className="explorer-header">
        <Logo />
        <div className="explorer-venue">
          <strong>{data.venue.name}</strong>
          <span>Open today · 10:00 AM – 10:00 PM</span>
        </div>
        <div className="explorer-header-tools">
          <span className="explorer-clock">
            <Clock3 size={16} />
            {now
              ? new Intl.DateTimeFormat("en-US", {
                  timeZone: data.venue.timezone,
                  hour: "numeric",
                  minute: "2-digit",
                }).format(now)
              : "--:--"}
          </span>
          <button
            ref={searchTrigger}
            type="button"
            className={`explorer-icon-button ${panel === "search" ? "active" : ""}`}
            aria-label="Search the mall"
            aria-expanded={panel === "search"}
            aria-controls="mall-search-panel"
            onClick={openSearch}
          >
            <Search size={21} />
          </button>
          <button
            type="button"
            className="explorer-icon-button"
            aria-label="Notifications"
            aria-expanded={utility === "notifications"}
            onClick={() =>
              setUtility(utility === "notifications" ? null : "notifications")
            }
          >
            <Bell size={19} />
          </button>
          <button
            type="button"
            className="explorer-language"
            aria-label="Language"
            aria-expanded={utility === "language"}
            onClick={() =>
              setUtility(utility === "language" ? null : "language")
            }
          >
            <Globe size={17} /> EN <ChevronDown size={14} />
          </button>
          <button
            type="button"
            className="explorer-icon-button"
            aria-label="Menu"
            aria-expanded={utility === "menu"}
            onClick={() => setUtility(utility === "menu" ? null : "menu")}
          >
            <Menu size={23} />
          </button>
        </div>
        {utility && (
          <div className="explorer-utility">
            <button
              className="explorer-utility-close"
              aria-label="Close menu"
              onClick={() => setUtility(null)}
            >
              <X size={16} />
            </button>
            {utility === "menu" && (
              <>
                <h3>Explore Riverside</h3>
                <button onClick={openSearch}>
                  <Search size={18} /> Search the directory
                </button>
                <button
                  onClick={() => {
                    setTab("Amenities");
                    setCategory("");
                    setQuery("");
                    setPanel("search");
                    setUtility(null);
                  }}
                >
                  <Accessibility size={18} /> Amenities
                </button>
                <button onClick={() => setUtility("offers")}>
                  <Store size={18} /> Offers & promotions
                </button>
                <button onClick={onReturnToAd}>
                  <ArrowLeft size={18} /> Back to welcome screen
                </button>
              </>
            )}
            {utility === "language" && (
              <>
                <h3>Language</h3>
                <p>
                  English <Check size={16} />
                </p>
              </>
            )}
            {utility === "notifications" && (
              <>
                <h3>Visitor information</h3>
                <p>{data.venue.description}</p>
                <small>{data.venue.address}</small>
              </>
            )}
            {utility === "offers" && (
              <>
                <h3>Offers & promotions</h3>
                {data.offers
                  .filter((offer) => offer.status === "ACTIVE")
                  .map((offer) => (
                    <button
                      key={offer.id}
                      onClick={() => {
                        const place = places.find(
                          (item) => item.id === offer.tenantId,
                        );
                        if (place) selectPlace(place);
                      }}
                    >
                      <span>
                        <b>{offer.title}</b>
                        <small>{offer.description}</small>
                      </span>
                      <ArrowRight size={18} />
                    </button>
                  ))}
                {!data.offers.some((offer) => offer.status === "ACTIVE") && (
                  <p>No current offers.</p>
                )}
              </>
            )}
          </div>
        )}
      </header>
      <main className="explorer-workspace">
        <ExplorerMap
          data={data}
          places={places}
          floorId={floorId}
          onFloorChange={setFloorId}
          selectedId={selectedId}
          onSelect={selectPlace}
          route={route}
          stepIndex={panel === "steps" ? step : null}
          focusNodeId={activeStep?.nodeId}
          panelOpen={true}
          onFullscreen={fullscreen}
        />
        {routing && (
          <button
            className="explorer-exit-route"
            aria-label="Close directions"
            onClick={closePanel}
          >
            <X size={22} />
          </button>
        )}

        {panel === "search" && (
          <div
            id="mall-search-panel"
            className="explorer-panel explorer-search-panel"
            role="region"
            aria-label="Search the mall"
          >
            <div className="explorer-search-line">
              <div>
                <Search size={19} />
                <input
                  ref={searchInput}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search the mall..."
                  aria-label="Search stores and amenities"
                />
                {query && (
                  <button
                    aria-label="Clear search"
                    onClick={() => {
                      setQuery("");
                      searchInput.current?.focus();
                    }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <button
                className="explorer-round-button"
                aria-label="Search filters"
                aria-expanded={filtersOpen}
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <SlidersHorizontal size={19} />
              </button>
            </div>
            <div
              className="explorer-search-tabs"
              role="tablist"
              aria-label="Browse places"
            >
              {(["Categories", "Popular", "Amenities"] as const).map((item) => (
                <button
                  key={item}
                  role="tab"
                  aria-selected={tab === item}
                  onClick={() => {
                    setTab(item);
                    setCategory("");
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
            {filtersOpen && (
              <div className="explorer-filters">
                <label>
                  Floor
                  <select
                    aria-label="Filter by floor"
                    value={floorFilter}
                    onChange={(event) => setFloorFilter(event.target.value)}
                  >
                    <option value="">All floors</option>
                    {data.floors.map((floor) => (
                      <option key={floor.id} value={floor.id}>
                        {floor.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={() => {
                    setFloorFilter("");
                    setCategory("");
                    setQuery("");
                  }}
                >
                  Reset filters
                </button>
              </div>
            )}
            {tab === "Categories" && (
              <div className="explorer-category-list">
                <button
                  className={!category ? "selected" : ""}
                  onClick={() => setCategory("")}
                >
                  All stores
                </button>
                {data.categories.map((item) => (
                  <button
                    key={item.id}
                    className={category === item.id ? "selected" : ""}
                    onClick={() => setCategory(item.id)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
            {!query && !category && tab === "Popular" && (
              <div className="explorer-featured-places">
                {places
                  .filter(
                    (place) =>
                      place.kind === "tenant" &&
                      (!floorFilter || place.floorId === floorFilter),
                  )
                  .slice(0, 3)
                  .map((place) => (
                    <button key={place.id} onClick={() => selectPlace(place)}>
                      <span>
                        <PlaceIcon place={place} size={30} />
                      </span>
                      <b>{place.name}</b>
                      <small>{floorName(place.floorId)}</small>
                    </button>
                  ))}
              </div>
            )}
            <div className="explorer-results-title">
              <span>
                {query
                  ? `Results for “${query}”`
                  : tab === "Amenities"
                    ? "Amenities"
                    : "Directory"}
              </span>
              <small>{matches.length} places</small>
            </div>
            <div className="explorer-search-results">
              {matches.map((place) => (
                <button
                  key={place.id}
                  className="explorer-search-result"
                  onClick={() => selectPlace(place)}
                >
                  <span
                    className="explorer-place-icon"
                    style={{ color: placeColor(place) }}
                  >
                    <PlaceIcon place={place} />
                  </span>
                  <span>
                    <b>{place.name}</b>
                    <small>
                      {floorName(place.floorId)} · {place.category}
                    </small>
                  </span>
                  <ArrowRight size={16} />
                </button>
              ))}
              {matches.length === 0 && (
                <div className="explorer-empty">
                  <Search size={25} />
                  <b>No places found</b>
                  <p>
                    Try a store name, “Italian food”, “ATM”, or a different
                    floor.
                  </p>
                  <button
                    onClick={() => {
                      setQuery("");
                      setCategory("");
                      setFloorFilter("");
                      setTab("Popular");
                    }}
                  >
                    Show all places
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {panel === "details" && selected && (
          <aside
            className="explorer-panel explorer-details-panel"
            aria-label={`${selected.name} details`}
          >
            <div className="explorer-card-actions">
              <span
                className="explorer-place-icon"
                style={{ color: placeColor(selected) }}
              >
                <PlaceIcon place={selected} size={26} />
              </span>
              <div>
                <button aria-label="Share place" onClick={share}>
                  <Share2 size={16} />
                </button>
                <button aria-label="Close place details" onClick={closePanel}>
                  <X size={17} />
                </button>
              </div>
            </div>
            <h1>{selected.name}</h1>
            <div className="explorer-place-meta">
              <span>{floorName(selected.floorId)}</span>
              <span
                className={
                  tenantOpen
                    ? "explorer-open"
                    : selected.tenant
                      ? "explorer-closed"
                      : ""
                }
              >
                {availability}
              </span>
            </div>
            <button
              className="explorer-primary explorer-directions-button"
              onClick={() => {
                setOriginId("start");
                setAccessible(false);
                setStep(0);
                setPanel("plan");
              }}
            >
              Directions
            </button>
            {selected.tenant && (
              <section className="explorer-place-hours">
                <h3>Hours</h3>
                <details>
                  <summary>
                    <span
                      className={
                        tenantOpen ? "explorer-open" : "explorer-closed"
                      }
                    >
                      {availability}
                    </span>{" "}
                    · {selected.tenant.openingTime} –{" "}
                    {selected.tenant.closingTime}
                    <ChevronDown size={14} />
                  </summary>
                  <p>Daily opening hours · {data.venue.timezone}</p>
                </details>
              </section>
            )}
            <section>
              <h3>Categories</h3>
              <div className="explorer-tags">
                <span>{selected.category}</span>
                {selected.kind === "poi" && <span>Amenities</span>}
                {selected.tenant?.productTypes.slice(0, 2).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </section>
            <p className="explorer-description">{selected.description}</p>
            {selected.poi?.accessible && (
              <p className="explorer-accessibility-note">
                <Accessibility size={16} /> Step-free access available
              </p>
            )}
            {selected.tenant && (
              <div className="explorer-contact-links">
                {selected.tenant.phone && (
                  <a href={`tel:${selected.tenant.phone.replace(/\s/g, "")}`}>
                    <Phone size={15} />
                    {selected.tenant.phone}
                  </a>
                )}
                {selected.tenant.website && (
                  <a
                    href={selected.tenant.website}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Visit store website"
                  >
                    <Globe size={18} />
                  </a>
                )}
              </div>
            )}
          </aside>
        )}

        {panel === "plan" && selected && (
          <aside
            className="explorer-panel explorer-route-panel"
            aria-label="Directions planner"
          >
            <div className="explorer-panel-heading">
              <button
                aria-label="Back to place details"
                onClick={() => setPanel("details")}
              >
                <ArrowLeft size={21} />
              </button>
              <h2>Directions</h2>
              <label className="explorer-accessible-toggle">
                Accessible
                <input
                  type="checkbox"
                  checked={accessible}
                  onChange={(event) => setAccessible(event.target.checked)}
                />
                <span />
              </label>
            </div>
            <div className="explorer-route-fields">
              <div className="explorer-endpoint-symbols">
                <span />
                <i />
                <MapPin size={17} />
              </div>
              <div>
                <label>
                  <span className="sr-only">Starting point</span>
                  <select
                    aria-label="Starting point"
                    value={originId}
                    onChange={(event) => setOriginId(event.target.value)}
                  >
                    <option value="start">You are here · Main Entrance</option>
                    {places.map((place) => (
                      <option key={place.id} value={place.id}>
                        {place.name} · {floorName(place.floorId)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="sr-only">Destination</span>
                  <select
                    aria-label="Destination"
                    value={selected.id}
                    onChange={(event) => {
                      const place = places.find(
                        (item) => item.id === event.target.value,
                      );
                      if (place) {
                        setSelectedId(place.id);
                        setFloorId(place.floorId);
                      }
                    }}
                  >
                    {places.map((place) => (
                      <option key={place.id} value={place.id}>
                        {place.name} · {floorName(place.floorId)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                aria-label="Swap start and destination"
                onClick={() => {
                  const reverse =
                    origin ??
                    places.find((place) => place.nodeId === startNode);
                  if (!reverse) {
                    setMessage("Choose a starting place to swap endpoints.");
                    return;
                  }
                  setOriginId(selected.id);
                  setSelectedId(reverse.id);
                  setFloorId(reverse.floorId);
                }}
              >
                <ArrowDownUp size={21} />
              </button>
            </div>
            {route ? (
              <div className="explorer-route-summary">
                <div>
                  <strong>
                    <Navigation size={18} />
                    {route.minutes} {route.minutes === 1 ? "minute" : "minutes"}
                  </strong>
                  <button
                    className="explorer-primary"
                    onClick={() => {
                      setStep(0);
                      setFloorId(route.steps[0]?.floorId ?? selected.floorId);
                      setPanel("steps");
                      setShowRouteQR(true);
                    }}
                  >
                    Start
                  </button>
                </div>
                <p>
                  To {selected.name} · {route.distance} m
                </p>
                <span>
                  <Accessibility size={14} />
                  {accessible
                    ? "Use lifts · Step-free route"
                    : "Fastest available route"}
                </span>
              </div>
            ) : (
              <div className="explorer-empty" role="status">
                <Navigation size={26} />
                <b>No route available</b>
                <p>
                  Try another starting point or change the accessible-route
                  setting.
                </p>
              </div>
            )}
          </aside>
        )}

        {panel === "steps" && selected && route && (
          <aside
            className="explorer-panel explorer-guidance-panel"
            aria-label="Step-by-step directions"
          >
            <div className="explorer-panel-heading">
              <button
                className="explorer-back-label"
                onClick={() => {
                  setPanel("plan");
                  setStep(0);
                }}
              >
                <ArrowLeft size={20} /> Back
              </button>
              <button
                className="explorer-guidance-close"
                aria-label="Close directions panel"
                onClick={closePanel}
              >
                <X size={19} />
              </button>
            </div>
            <button
              type="button"
              className="explorer-reopen-qr"
              onClick={() => setShowRouteQR(true)}
            >
              <QrCode size={17} /> Send route to phone
            </button>
            <div className="explorer-guidance-summary">
              <span>Directions to {selected.name}</span>
              <h2>
                {route.minutes} {route.minutes === 1 ? "minute" : "minutes"}{" "}
                total
              </h2>
              <div
                className="explorer-progress"
                role="progressbar"
                aria-label="Route progress"
                aria-valuemin={0}
                aria-valuemax={route.steps.length}
                aria-valuenow={step + 1}
              >
                <div
                  style={{
                    width: `${((step + 1) / route.steps.length) * 100}%`,
                  }}
                />
                <span />
                <MapPin size={15} />
              </div>
            </div>
            <div className="explorer-step-list">
              <h3>{origin?.name ?? "You are here · Main Entrance"}</h3>
              {route.steps.map((item, index) => (
                <button
                  key={`${item.nodeId}-${index}`}
                  className="explorer-step"
                  aria-current={step === index ? "step" : undefined}
                  onClick={() => changeStep(index)}
                >
                  <StepIcon text={item.text} connector={item.connector} />
                  <span>
                    <b>{item.text}</b>
                    <small>
                      {item.distance
                        ? `${Math.round(item.distance)} m · ${floorName(item.floorId)}`
                        : "Destination reached"}
                    </small>
                  </span>
                </button>
              ))}
              <h3>{selected.name}</h3>
            </div>
            <div className="explorer-step-controls">
              <button
                aria-label="Previous direction"
                disabled={step === 0}
                onClick={() => changeStep(step - 1)}
              >
                <ArrowLeft size={22} />
              </button>
              {step === route.steps.length - 1 ? (
                <button className="explorer-primary" onClick={closePanel}>
                  <Check size={18} /> Done
                </button>
              ) : (
                <button
                  aria-label="Next direction"
                  onClick={() => changeStep(step + 1)}
                >
                  <ArrowRight size={22} />
                </button>
              )}
            </div>
          </aside>
        )}
        {message && (
          <div className="explorer-toast" role="status">
            {message}
          </div>
        )}
        {showRouteQR && selected && route && (
          <RouteQRModal
            route={route}
            destination={selected}
            originNodeId={originNodeId}
            accessible={accessible}
            onClose={() => setShowRouteQR(false)}
          />
        )}
      </main>
    </div>
  );
}
