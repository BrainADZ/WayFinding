"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpDown, Expand, LocateFixed, Minus, Plus } from "lucide-react";
import type { Route, Snapshot } from "../../packages/domain";
import { placeColor, type MapPlace } from "./explorer-model";
import { PlaceIcon } from "./place-icon";
import { ReferenceFloor } from "./reference-floor";
import { upperStores } from "./upper-floor-layout";
import { referenceStores } from "./reference-layout";

// Apply the same site projection to geometry, markers, routes and camera targets.
function originalProject(x: number, y: number) {
  const angle = (-20 * Math.PI) / 180;
  return {
    x: 750 + (x - 500) * Math.cos(angle) - (y - 350) * Math.sin(angle),
    y: 500 + (x - 500) * Math.sin(angle) + (y - 350) * Math.cos(angle),
  };
}

export function ExplorerMap({
  data,
  places,
  floorId,
  onFloorChange,
  selectedId,
  onSelect,
  route,
  stepIndex,
  panelOpen,
  focusNodeId,
  onFullscreen,
  performanceMode = false,
}: {
  data: Snapshot;
  places: MapPlace[];
  floorId: string;
  onFloorChange: (id: string) => void;
  selectedId?: string;
  onSelect: (place: MapPlace) => void;
  route: Route | null;
  stepIndex: number | null;
  panelOpen: boolean;
  focusNodeId?: string;
  onFullscreen: () => void;
  performanceMode?: boolean;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    cx: number;
    cy: number;
    moved: boolean;
  } | null>(null);
  const [camera, setCamera] = useState({ x: 750, y: 500, zoom: 1 });
  const cameraRef = useRef(camera);
  const wheelCommit = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [size, setSize] = useState({ width: 1440, height: 850 });
  const arrowId = `route-arrow-${useId().replace(/:/g, "")}`;
  const isReference = ["g", "l1", "l2", "l3"].includes(floorId);
  const [connectorId, setConnectorId] = useState<string>();
  useEffect(() => setConnectorId(undefined), [floorId]);
  const project = (x: number, y: number) =>
    isReference ? { x, y } : originalProject(x, y);
  const baseWidth = isReference
    ? Math.max(960, (1060 * size.width) / size.height)
    : 1500;
  const width = baseWidth / camera.zoom;
  function previewCamera(next: typeof camera) {
    cameraRef.current = next;
    const nextWidth = baseWidth / next.zoom;
    const nextHeight = (nextWidth * size.height) / size.width;
    svg.current?.setAttribute(
      "viewBox",
      `${next.x - nextWidth / 2} ${next.y - nextHeight / 2} ${nextWidth} ${nextHeight}`,
    );
  }
  function commitCamera(next: typeof camera) {
    previewCamera(next);
    setCamera(next);
  }
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);
  useEffect(
    () => () => {
      if (wheelCommit.current) clearTimeout(wheelCommit.current);
    },
    [],
  );
  useEffect(() => {
    setCamera({
      x: isReference ? 470 : 750,
      y: isReference ? 510 : 500,
      zoom: 1,
    });
  }, [isReference, floorId]);
  const height = (width * size.height) / size.width;
  const floor =
    data.floors.find((item) => item.id === floorId) ?? data.floors[0];
  const features = data.features.filter((item) => item.floorId === floorId);
  const floorNodes = data.nodes.filter((node) => node.floorId === floorId);
  const byId = new Map(data.nodes.map((node) => [node.id, node]));
  const selected = places.find((item) => item.id === selectedId);

  useEffect(() => {
    if (!svg.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(svg.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = data.nodes.find(
      (item) =>
        item.id === (focusNodeId ?? selected?.nodeId) &&
        item.floorId === floorId,
    );
    if (!node) return;
    const point = project(node.x, node.y);
    if (isReference && !focusNodeId && size.width > 720) {
      setCamera({ x: panelOpen ? 310 : 470, y: 510, zoom: 1 });
      return;
    }
    const zoom = focusNodeId ? 1.8 : isReference ? 1.05 : 1.25;
    setCamera({
      x: point.x - (panelOpen && size.width > 720 ? 210 / zoom : 0),
      y: point.y + (panelOpen && size.width <= 720 ? 160 / zoom : 0),
      zoom,
    });
  }, [
    focusNodeId,
    selected?.nodeId,
    floorId,
    data.nodes,
    panelOpen,
    size.width,
  ]);

  function zoomBy(amount: number) {
    const next = {
      ...cameraRef.current,
      zoom: Math.max(0.55, Math.min(3.5, cameraRef.current.zoom + amount)),
    };
    previewCamera(next);
    if (wheelCommit.current) clearTimeout(wheelCommit.current);
    wheelCommit.current = setTimeout(
      () => setCamera({ ...cameraRef.current }),
      80,
    );
  }

  return (
    <div className="explorer-map">
      <svg
        ref={svg}
        className="explorer-map-svg"
        viewBox={`${camera.x - width / 2} ${camera.y - height / 2} ${width} ${height}`}
        aria-label={`${floor?.name ?? "Mall"} interactive map`}
        role="group"
        onPointerDown={(event) => {
          if (
            event.button !== 0 ||
            (event.target as Element).closest('[role="button"]')
          )
            return;
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            cx: cameraRef.current.x,
            cy: cameraRef.current.y,
            moved: false,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          const dx = event.clientX - drag.current.x,
            dy = event.clientY - drag.current.y;
          drag.current.moved = Math.abs(dx) + Math.abs(dy) > 4;
          const { cx, cy } = drag.current;
          const nextWidth = baseWidth / cameraRef.current.zoom;
          const nextHeight = (nextWidth * size.height) / size.width;
          previewCamera({
            ...cameraRef.current,
            x: cx - (dx * nextWidth) / size.width,
            y: cy - (dy * nextHeight) / size.height,
          });
        }}
        onPointerUp={() => {
          setCamera({ ...cameraRef.current });
          drag.current = null;
        }}
        onPointerCancel={() => {
          setCamera({ ...cameraRef.current });
          drag.current = null;
        }}
        onWheel={(event) => zoomBy(event.deltaY < 0 ? 0.12 : -0.12)}
      >
        <defs>
          <pattern
            id="site-parking"
            width="30"
            height="42"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 0H28V34H0"
              fill="none"
              stroke="#f8f7f3"
              strokeWidth="2"
            />
          </pattern>
          <marker
            id={arrowId}
            markerWidth="5"
            markerHeight="5"
            refX="2.5"
            refY="2.5"
            orient="auto"
          >
            <path
              d="M1 1L3.5 2.5L1 4"
              fill="none"
              stroke="white"
              strokeWidth="1"
            />
          </marker>
          <filter id="site-shadow">
            <feDropShadow dx="0" dy="7" stdDeviation="5" floodOpacity=".12" />
          </filter>
        </defs>
        <rect x="-5000" y="-5000" width="10000" height="10000" fill="#f7f6f1" />
        {isReference && (
          <ReferenceFloor
            selectedId={selectedId}
            floorId={floorId}
            performanceMode={performanceMode}
          />
        )}
        <g
          transform={
            isReference ? undefined : "translate(250 150) rotate(-20 500 350)"
          }
        >
          {!isReference && (
            <>
              <g className="site-surroundings" aria-hidden="true">
                <path
                  d="M-700 -110H1700M-700 830H1700M-180 -700V1600M1210 -700V1600"
                  fill="none"
                  stroke="#c5c9c7"
                  strokeWidth="37"
                />
                <path
                  d="M-700 -110H1700M-700 830H1700M-180 -700V1600M1210 -700V1600"
                  fill="none"
                  stroke="#eeefed"
                  strokeWidth="30"
                />
                <path
                  d="M-700 -110H1700M-700 830H1700"
                  stroke="#fff"
                  strokeDasharray="15 8"
                />
                <rect
                  x="-160"
                  y="-85"
                  width="120"
                  height="760"
                  rx="28"
                  fill="#e0dfd9"
                />
                <rect
                  x="1015"
                  y="5"
                  width="160"
                  height="680"
                  rx="30"
                  fill="#deddd7"
                />
                <rect
                  x="1015"
                  y="5"
                  width="160"
                  height="680"
                  rx="30"
                  fill="url(#site-parking)"
                />
                <path
                  d="M-130 320L-55 360L-62 465L-124 507L-150 455Z"
                  fill="#99cfdd"
                />
                <path d="M380 -290H930V-170H380Z" fill="#dce9c8" />
                <path
                  d="M-550 50H-290V240H-550ZM-550 400H-290V690H-550ZM1300 230H1630V720H1300Z"
                  fill="#e9e9e6"
                  stroke="#d8d9d4"
                />
                <text x="210" y="-100" className="site-street">
                  RIVER ROAD
                </text>
                <text x="610" y="840" className="site-street">
                  RIVERSIDE AVENUE
                </text>
                <text
                  x="1094"
                  y="350"
                  transform="rotate(90 1094 350)"
                  className="site-parking-label"
                >
                  P · PARKING
                </text>
              </g>
              <rect
                x="10"
                y="18"
                width="980"
                height="680"
                rx="100"
                fill="#dad8d0"
              />
              <rect
                x="10"
                y="5"
                width="980"
                height="680"
                rx="100"
                fill="#eeefed"
                stroke="#d8d6ce"
                strokeWidth="5"
                filter="url(#site-shadow)"
              />
              <g aria-hidden="true">
                {Array.from({ length: 12 }, (_, index) => (
                  <g key={index}>
                    <rect
                      x={70 + index * 72}
                      y="40"
                      width="70"
                      height="58"
                      fill="#fafaf9"
                      stroke="#dfdfdb"
                    />
                    <rect
                      x={70 + index * 72}
                      y="607"
                      width="70"
                      height="48"
                      fill="#fafaf9"
                      stroke="#dfdfdb"
                    />
                  </g>
                ))}
                <ellipse
                  cx="470"
                  cy="195"
                  rx="108"
                  ry="78"
                  fill="#e5e3dc"
                  stroke="#fff"
                  strokeWidth="14"
                />
                <ellipse cx="470" cy="191" rx="61" ry="46" fill="#d3e6ec" />
                <text x="470" y="205" textAnchor="middle" className="site-zone">
                  ATRIUM
                </text>
                <rect
                  x="250"
                  y="390"
                  width="168"
                  height="102"
                  rx="12"
                  fill="#e8e8e2"
                  stroke="#f7f7f5"
                  strokeWidth="10"
                />
                <text x="333" y="448" textAnchor="middle" className="site-zone">
                  LOUNGE
                </text>
              </g>
              {data.edges
                .filter(
                  (edge) =>
                    edge.active &&
                    byId.get(edge.fromNode)?.floorId === floorId &&
                    byId.get(edge.toNode)?.floorId === floorId,
                )
                .map((edge) => {
                  const a = byId.get(edge.fromNode)!,
                    b = byId.get(edge.toNode)!;
                  return (
                    <g key={edge.id}>
                      <path
                        d={`M${a.x} ${a.y}L${b.x} ${b.y}`}
                        stroke="#dedfdd"
                        strokeWidth="52"
                        strokeLinecap="round"
                      />
                      <path
                        d={`M${a.x} ${a.y}L${b.x} ${b.y}`}
                        stroke="#f9faf9"
                        strokeWidth="39"
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}
              {features.map((feature) => (
                <polygon
                  key={feature.id}
                  points={feature.points
                    .map((point) => point.join(","))
                    .join(" ")}
                  fill={
                    selected?.tenant?.featureId === feature.id
                      ? "#dce7fb"
                      : "#fff"
                  }
                  stroke={
                    selected?.tenant?.featureId === feature.id
                      ? "#8fb2ed"
                      : "#d3d5d2"
                  }
                  strokeWidth="2"
                />
              ))}
            </>
          )}
          {route?.nodes.slice(1).map((node, index) => {
            const previous = route.nodes[index];
            if (node.floorId !== floorId || previous.floorId !== floorId)
              return null;
            return (
              <g key={`route-${index}`} className="explorer-route-line">
                <path
                  d={`M${previous.x} ${previous.y}L${node.x} ${node.y}`}
                  stroke="#fff"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d={`M${previous.x} ${previous.y}L${node.x} ${node.y}`}
                  stroke={stepIndex === index ? "#083aa8" : "#2864ff"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  markerMid={`url(#${arrowId})`}
                />
                <path
                  d={`M${(previous.x + node.x) / 2} ${(previous.y + node.y) / 2}l${(node.x - previous.x) / 100} ${(node.y - previous.y) / 100}`}
                  stroke="transparent"
                  strokeWidth="3"
                  markerEnd={`url(#${arrowId})`}
                />
              </g>
            );
          })}
          {floorNodes
            .filter((node) =>
              ["lift", "escalator", "stairs"].includes(node.type),
            )
            .map((node) => (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                className="site-connector"
                aria-label={`View ${node.type} connections on ${floor?.name}`}
                onClick={() => setConnectorId(node.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setConnectorId(node.id);
                  }
                }}
                transform={`translate(${node.x} ${node.y}) rotate(${isReference ? 0 : 20})`}
              >
                <circle
                  r="18"
                  fill={node.type === "lift" ? "#1c9dd1" : "#657d95"}
                  stroke="white"
                  strokeWidth="3"
                />
                {node.type === "lift" ? (
                  <>
                    <rect
                      x="-11"
                      y="-12"
                      width="22"
                      height="24"
                      rx="3"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <ArrowUpDown
                      x={-8}
                      y={-8}
                      width={16}
                      height={16}
                      color="white"
                    />
                  </>
                ) : (
                  <path
                    d={
                      node.type === "stairs"
                        ? "M-11 9h7V2h7v-7h8"
                        : "M-12 7h6L5 -6h7M-12 12h8L7 0h5"
                    }
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                )}
                <text x="20" y="5" className="site-connector-label">
                  {node.type === "lift"
                    ? "Lift ↕"
                    : node.type === "stairs"
                      ? "Stairs ↕"
                      : "Escalator ↕"}
                </text>
              </g>
            ))}
          {floorId === "g" && (
            <g
              transform={
                isReference
                  ? "translate(428 884)"
                  : "translate(90 340) rotate(20)"
              }
            >
              <circle r="9" fill="#2864ff" stroke="#fff" strokeWidth="4" />
              <text x="-16" y="-27" textAnchor="end" className="site-here">
                YOU ARE HERE
              </text>
            </g>
          )}
        </g>
        {places
          .filter((place) => place.floorId === floorId)
          .map((place) => {
            const node = byId.get(place.nodeId);
            if (!node) return null;
            const neighbours = places.filter(
              (other) => other.nodeId === place.nodeId,
            );
            const offset =
              neighbours.length > 1
                ? (neighbours.findIndex((other) => other.id === place.id) -
                    (neighbours.length - 1) / 2) *
                  66
                : 0;
            const reference = [...referenceStores, ...upperStores].find(
              (s) => `ref-${s.id}` === place.id,
            );
            const color = reference?.color ?? placeColor(place);
            const point = project(node.x, node.y),
              active = selectedId === place.id;
            return (
              <g
                key={place.id}
                role="button"
                tabIndex={0}
                aria-label={`View ${place.name}`}
                className={`site-marker ${active ? "selected" : ""}`}
                transform={`translate(${point.x + offset} ${point.y - (active ? 46 : isReference ? 0 : 22)})`}
                onClick={() => onSelect(place)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(place);
                  }
                }}
              >
                <title>{place.name}</title>
                <circle
                  r={active ? 30 : isReference ? 10 : 17}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={isReference ? 1.5 : 3}
                />
                {(!performanceMode || active) && (
                  <foreignObject
                    x={active ? -16 : isReference ? -7 : -10}
                    y={active ? -16 : isReference ? -7 : -10}
                    width={active ? 32 : isReference ? 14 : 20}
                    height={active ? 32 : isReference ? 14 : 20}
                    pointerEvents="none"
                  >
                    <div className="site-pin-icon">
                      <PlaceIcon
                        place={place}
                        size={active ? 32 : isReference ? 14 : 20}
                      />
                    </div>
                  </foreignObject>
                )}
                {active && (
                  <>
                    <path
                      d="M-8 26L0 36L8 26"
                      fill={color}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <circle
                      cy="46"
                      r="5"
                      fill={color}
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  </>
                )}
                <text
                  x={
                    active ? 42 : reference?.left ? -16 : isReference ? 16 : 25
                  }
                  textAnchor={!active && reference?.left ? "end" : "start"}
                  y="4"
                  style={
                    isReference
                      ? {
                          fontSize: active ? 16 : 12,
                          fill: active ? "#555" : color,
                        }
                      : undefined
                  }
                  fill={color}
                  className="site-store-label"
                >
                  {place.name}
                </text>
              </g>
            );
          })}
        {focusNodeId &&
          (() => {
            const node = byId.get(focusNodeId);
            if (!node || node.floorId !== floorId) return null;
            const point = project(node.x, node.y);
            return (
              <circle
                cx={point.x}
                cy={point.y}
                r="9"
                fill="#fff"
                stroke="#2864ff"
                strokeWidth="4"
              />
            );
          })()}
      </svg>
      {connectorId && (
        <div
          className="explorer-connector-card"
          role="region"
          aria-label="Floor connections"
        >
          <button
            className="explorer-connector-close"
            aria-label="Close floor connections"
            onClick={() => setConnectorId(undefined)}
          >
            ×
          </button>
          <strong>
            {byId.get(connectorId)?.label} · {floor?.name}
          </strong>
          <small>Choose a connected floor</small>
          {data.edges
            .filter(
              (edge) =>
                edge.active &&
                !edge.restricted &&
                (edge.fromNode === connectorId ||
                  (edge.toNode === connectorId && edge.direction === "BOTH")),
            )
            .map((edge) => {
              const target = byId.get(
                edge.fromNode === connectorId ? edge.toNode : edge.fromNode,
              );
              if (!target || target.floorId === floorId) return null;
              const destination = data.floors.find(
                (f) => f.id === target.floorId,
              );
              return (
                <button
                  key={edge.id}
                  onClick={() => onFloorChange(target.floorId)}
                >
                  {(destination?.level ?? 0) > (floor?.level ?? 0) ? "↑" : "↓"}{" "}
                  {destination?.name}{" "}
                  <span>{edge.type === "lift" ? "Step-free" : edge.type}</span>
                </button>
              );
            })}
        </div>
      )}
      <div className="explorer-floor-controls" aria-label="Choose floor">
        {[...data.floors]
          .sort((a, b) => b.level - a.level)
          .map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show ${item.name}`}
              aria-pressed={floorId === item.id}
              onClick={() => onFloorChange(item.id)}
            >
              {item.level === 0 ? "G" : `L${item.level}`}
            </button>
          ))}
      </div>
      <div className="explorer-map-controls">
        <button
          type="button"
          aria-label="Toggle fullscreen map"
          onClick={onFullscreen}
        >
          <Expand size={20} />
        </button>
        <button
          type="button"
          aria-label="Fit map"
          onClick={() =>
            commitCamera({
              x: isReference ? 470 : 750,
              y: isReference ? 510 : 500,
              zoom: 1,
            })
          }
        >
          <LocateFixed size={20} />
        </button>
        <div>
          <button
            type="button"
            aria-label="Zoom in"
            disabled={camera.zoom >= 3.5}
            onClick={() => zoomBy(0.25)}
          >
            <Plus size={22} />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            disabled={camera.zoom <= 0.55}
            onClick={() => zoomBy(-0.25)}
          >
            <Minus size={22} />
          </button>
        </div>
      </div>
      <div className="explorer-map-brand">
        WAY<span>EZY</span>
        <small>
          {isReference
            ? "Reference layout · illustrative routes"
            : "Riverside indoor map"}
        </small>
      </div>
      <div className="explorer-floor-caption">{floor?.name}</div>
    </div>
  );
}
