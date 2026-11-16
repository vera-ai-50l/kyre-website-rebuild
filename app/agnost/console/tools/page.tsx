"use client";

import { Tools } from "@/components/agnost/screens/Tools";
import { Shell } from "@/components/agnost/Shell";
import { CopyMd } from "@/components/agnost/ui";
import { adapter, currentRange } from "@/lib/data";
import { mdTools } from "@/lib/data/markdown";

export default function Page() {
  return (
    <Shell title="Tools" actions={<CopyMd label="tools.md" build={() => mdTools(adapter, currentRange())} />}>
      <Tools />
    </Shell>
  );
}
