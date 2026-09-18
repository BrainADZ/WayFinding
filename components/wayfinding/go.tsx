"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Navigation,
  Share2,
} from "lucide-react";
import type { Snapshot } from "../../packages/domain";
import { findRoute } from "../../packages/routing";
import { ExplorerMap } from "./explorer-map";
import { mapPlaces } from "./explorer-model";
import { Logo } from "./shared";
import { PlaceIcon } from "./place-icon";

export function Go({
  data,
  destinationId = "oliva",
  originNodeId = "n-g-start",
  initialAccessible = false,
}: {
  data: Snapshot;
  destinationId?: string;
  originNodeId?: string;
  initialAccessible?: boolean;
}) {
  const mapRoot = useRef<HTMLDivElement>(null);
  const places = useMemo(() => mapPlaces(data), [data]);
  const destination =
    places.find((place) => place.id === destinationId) ?? places[0];
  const validOrigin = data.nodes.some((node) => node.id === originNodeId)
    ? originNodeId
    : (data.devices[0]?.routeStartNode ?? "n-g-start");
  const [accessible, setAccessible] = useState(initialAccessible);
  const [step, setStep] = useState(0);
  const route = useMemo(
    () =>
      destination
        ? findRoute(
            data.nodes,
            data.edges,
            validOrigin,
            destination.nodeId,
            accessible,
            data.floors,
          )
        : null,
    [accessible, data, destination, validOrigin],
  );
  const current = route?.steps[Math.min(step, route.steps.length - 1)];
  const [activeFloor, setActiveFloor] = useState(
    data.nodes.find((node) => node.id === validOrigin)?.floorId ?? "g",
  );
  useEffect(() => {
    setStep(0);
  }, [accessible]);
  useEffect(() => {
    if (current?.floorId) setActiveFloor(current.floorId);
  }, [current?.floorId]);

  if (!destination || !route || !current) {
    return (
      <main className="go-shell go-error">
        <Logo />
        <h1>Directions unavailable</h1>
        <p>This shared route is no longer available.</p>
      </main>
    );
  }

  const floorLabel =
    data.floors.find((floor) => floor.id === destination.floorId)?.name ??
    destination.floorId;
  const atEnd = step === route.steps.length - 1;
  const progress = ((step + 1) / route.steps.length) * 100;

  async function shareRoute() {
    const details = {
      title: `Directions to ${destination.name}`,
      text: `Indoor directions to ${destination.name}`,
      url: location.href,
    };
    if (navigator.share) await navigator.share(details);
    else await navigator.clipboard.writeText(location.href);
  }

  return (
    <main className="go-shell">
      <header className="go-header">
        <Logo compact />
        <div className="go-venue">
          <strong>Riverside Shopping Centre</strong>
          <span>Mobile directions</span>
        </div>
        <button
          type="button"
          className="go-share"
          onClick={shareRoute}
          aria-label="Share directions"
        >
          <Share2 size={20} />
        </button>
      </header>

      <section className="go-destination">
        <span className="go-place-icon">
          <PlaceIcon place={destination} size={24} />
        </span>
        <div>
          <b>{destination.name}</b>
          <span>
            {destination.category} / {floorLabel}
          </span>
        </div>
        <div className="go-distance">
          <b>{route.minutes} min</b>
          <span>{route.distance} m</span>
        </div>
      </section>

      <section className="go-map" ref={mapRoot} aria-label="Current route map">
        <ExplorerMap
          data={data}
          places={places}
          floorId={activeFloor}
          onFloorChange={setActiveFloor}
          selectedId={destination.id}
          onSelect={() => {}}
          route={route}
          stepIndex={step}
          panelOpen={false}
          focusNodeId={current.nodeId}
          onFullscreen={() => mapRoot.current?.requestFullscreen()}
        />
      </section>

      <section className="go-instruction" aria-live="polite">
        <div className="go-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="go-instruction-meta">
          <span>
            Step {step + 1} of {route.steps.length}
          </span>
          <span>
            {data.floors.find((floor) => floor.id === current.floorId)?.name}
          </span>
        </div>
        <div className="go-instruction-main">
          <span className="go-turn-icon">
            {current.connector ? (
              <Accessibility size={23} />
            ) : (
              <Navigation size={23} />
            )}
          </span>
          <div>
            <h1>{current.text}</h1>
            <p>
              {current.connector
                ? "Floor change ahead"
                : current.distance
                  ? `${Math.round(current.distance)} metres`
                  : "You have arrived"}
            </p>
          </div>
        </div>
        <div className="go-step-buttons">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((value) => Math.max(0, value - 1))}
          >
            <ArrowLeft size={20} /> Previous
          </button>
          <button
            type="button"
            className="go-next"
            disabled={atEnd}
            onClick={() =>
              setStep((value) => Math.min(route.steps.length - 1, value + 1))
            }
          >
            {atEnd ? (
              <>
                <Check size={20} /> Arrived
              </>
            ) : (
              <>
                Next <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </section>

      <section className="go-options">
        <button
          type="button"
          className={"route-mode " + (accessible ? "selected" : "")}
          onClick={() => setAccessible(!accessible)}
        >
          <Accessibility size={18} />
          <span>
            {accessible ? "Step-free route on" : "Use step-free route"}
          </span>
          <i className="toggle" />
        </button>
        <details>
          <summary>
            Destination details <ChevronDown size={17} />
          </summary>
          <p>{destination.description}</p>
        </details>
      </section>
      <footer className="go-privacy">
        <Check size={15} /> Live route from the kiosk / No app required
      </footer>
    </main>
  );
}
