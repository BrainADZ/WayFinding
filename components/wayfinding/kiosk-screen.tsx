"use client";

import { useEffect, useState } from "react";
import type { Snapshot } from "../../packages/domain";
import { cloneData } from "./shared";
import { Kiosk } from "./kiosk";
import { createReferenceSnapshot } from "./reference-layout";

export default function KioskScreen() {
  const [data, setData] = useState<Snapshot>(() =>
    createReferenceSnapshot(cloneData()),
  );
  useEffect(() => {
    let active = true;
    const refresh = () =>
      fetch("/api/snapshot", { cache: "no-store" })
        .then((response) => response.json())
        .then((snapshot: Snapshot) => active && setData(snapshot))
        .catch(() => undefined);
    refresh();
    const timer = setInterval(refresh, 10000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  return <Kiosk data={data} setData={setData} />;
}
