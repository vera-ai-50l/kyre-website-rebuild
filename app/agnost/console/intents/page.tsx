"use client";

import { Intents } from "@/components/agnost/screens/Intents";
import { Shell } from "@/components/agnost/Shell";
import { CopyMd } from "@/components/agnost/ui";
import { adapter, currentRange } from "@/lib/data";
import { mdIntents } from "@/lib/data/markdown";

export default function Page() {
  return (
    <Shell title="Intents" actions={<CopyMd label="intents.md" build={() => mdIntents(adapter, currentRange())} />}>
      <Intents />
    </Shell>
  );
}
