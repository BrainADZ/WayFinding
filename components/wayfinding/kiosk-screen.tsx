"use client";

import { useState } from "react";
import type { Snapshot } from "../../packages/domain";
import { cloneData } from "./shared";
import { Kiosk } from "./kiosk";
import { createReferenceSnapshot } from "./reference-layout";

export default function KioskScreen() {
  const [data, setData] = useState<Snapshot>(() =>
    createReferenceSnapshot(cloneData()),
  );
  return <Kiosk data={data} setData={setData} />;
}
