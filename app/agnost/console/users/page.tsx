"use client";

import { Users } from "@/components/agnost/screens/Users";
import { Shell } from "@/components/agnost/Shell";
import { CopyMd } from "@/components/agnost/ui";
import { adapter, currentRange } from "@/lib/data";
import { mdUsers } from "@/lib/data/markdown";

export default function Page() {
  return (
    <Shell title="Users" actions={<CopyMd label="users.md" build={() => mdUsers(adapter, currentRange())} />}>
      <Users />
    </Shell>
  );
}
