"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Snapshot } from "../../packages/domain";
import { Logo } from "./shared";
import { MapExplorer } from "./map-explorer";

export function Kiosk({
  data,
}: {
  data: Snapshot;
  setData: React.Dispatch<React.SetStateAction<Snapshot>>;
}) {
  const [ad, setAd] = useState(true);
  const lastActivity = useRef(0);
  const touch = () => {
    lastActivity.current = Date.now();
  };
  useEffect(() => {
    const timer = setInterval(() => {
      if (!ad && Date.now() - lastActivity.current >= 12000) setAd(true);
    }, 250);
    return () => clearInterval(timer);
  }, [ad]);

  if (ad)
    return (
      <div
        className="ad-mode"
        onPointerDown={() => {
          touch();
          setAd(false);
        }}
      >
        <div className="ad-copy">
          <Logo />
          <p>SUMMER SHOPPING FEST</p>
          <h1>
            Find your
            <br />
            <em>happy place.</em>
          </h1>
          <button
            type="button"
            className="ad-find-button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => {
              touch();
              setAd(false);
            }}
          >
            Find <ArrowRight size={20} />
          </button>
          <span>Or touch anywhere to explore</span>
        </div>
        <img src={data.media[0]?.url} alt="Seasonal campaign" />
      </div>
    );

  return (
    <div onPointerDown={touch} onKeyDown={touch} onWheel={touch}>
      <MapExplorer data={data} onReturnToAd={() => setAd(true)} />
    </div>
  );
}
