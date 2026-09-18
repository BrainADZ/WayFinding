"use client";

import { useState } from "react";
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
  const [data] = useState<Snapshot>(() => createReferenceSnapshot(cloneData()));
  return (
    <Go
      data={data}
      destinationId={destinationId}
      originNodeId={originNodeId}
      initialAccessible={accessible}
    />
  );
}
