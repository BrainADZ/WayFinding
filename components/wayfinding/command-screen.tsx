"use client";

import { useState } from "react";
import type { Snapshot } from "../../packages/domain";
import { cloneData } from "./shared";
import { Command } from "./command";

export default function CommandScreen() {
  const [data, setData] = useState<Snapshot>(cloneData);
  return <Command data={data} setData={setData} />;
}
