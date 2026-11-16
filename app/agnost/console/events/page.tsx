"use client";

import { Events } from "@/components/agnost/screens/Events";
import { Shell } from "@/components/agnost/Shell";
import { CopyMd } from "@/components/agnost/ui";
import { adapter, currentRange } from "@/lib/data";
import { mdEvents } from "@/lib/data/markdown";

export default function Page() {
  return (
    <Shell title="Events" actions={<CopyMd label="events.md" build={() => mdEvents(adapter, currentRange())} />}>
      <Events />
    </Shell>
  );
}
