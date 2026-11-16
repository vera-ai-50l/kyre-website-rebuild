"use client";

import { Home } from "@/components/agnost/screens/Home";
import { BASE, Shell } from "@/components/agnost/Shell";
import { CopyMd } from "@/components/agnost/ui";
import { adapter, currentRange } from "@/lib/data";
import { mdHome } from "@/lib/data/markdown";

export default function Page() {
  return (
    <Shell title="Home" activeOverride={BASE} actions={<CopyMd label="home.md" build={() => mdHome(adapter, currentRange())} />}>
      <Home />
    </Shell>
  );
}
