"use client";

import { useEffect, useState } from "react";
import type { Snapshot } from "../../packages/domain";
import { cloneData } from "./shared";
import { Go } from "./go";
import { createReferenceSnapshot } from "./reference-layout";

export default function GoScreen({
  destinationId,
  originNodeId,
  accessible,
}: {
  destinationId?: string;
  originNodeId?: string;
  accessible?: boolean;
}) {
  const [data, setData] = useState<Snapshot>(() =>
    createReferenceSnapshot(cloneData()),
  );
  useEffect(() => {
    fetch("/api/snapshot", { cache: "no-store" })
      .then((response) => response.json())
      .then((snapshot: Snapshot) => setData(snapshot))
      .catch(() => undefined);
  }, []);
  return (
    <Go
      data={data}
      destinationId={destinationId}
      originNodeId={originNodeId}
      initialAccessible={accessible}
    />
  );
}
