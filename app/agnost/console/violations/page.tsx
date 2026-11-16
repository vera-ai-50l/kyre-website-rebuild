"use client";

import { Violations } from "@/components/agnost/screens/Violations";
import { Shell } from "@/components/agnost/Shell";
import { CopyMd } from "@/components/agnost/ui";
import { adapter, currentRange } from "@/lib/data";
import { mdViolations } from "@/lib/data/markdown";

export default function Page() {
  return (
    <Shell
      title="Violations"
      actions={
        <CopyMd label="violations.md" build={() => mdViolations(adapter, currentRange())} />
      }
    >
      <Violations />
    </Shell>
  );
}
