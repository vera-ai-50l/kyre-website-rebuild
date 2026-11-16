"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { currentRange, useQuery } from "@/lib/data";
import { fmtClock } from "@/lib/data/format";
import { EventsStrip, ScrubProvider, useScrub } from "./EventsStrip";
import { useCursorGlow } from "../useCursorGlow";
import { Button, Icon } from "./ui";

export const BASE = "/agnost/console";

/* Sidebar grouped by verb — Analyze / Observe / Improve. This is the strongest
   idea in their navigation: it encodes the workflow instead of listing screens,
   and the rebuild makes it louder rather than flattening it. */
type NavItemDef = { href: string; label: string; icon: string; badgeKey?: "suggested" };

const NAV: { group?: string; items: NavItemDef[] }[] = [
  { items: [{ href: BASE, label: "Home", icon: "home" }] },
  {
    group: "Analyze",
    items: [
      { href: `${BASE}/users`, label: "Users", icon: "users" },
      { href: `${BASE}/intents`, label: "Intents", icon: "intents" },
      { href: `${BASE}/violations`, label: "Violations", icon: "warn" },
    ],
  },
  {
    group: "Observe",
    items: [
      { href: `${BASE}/events`, label: "Events", icon: "events" },
      { href: `${BASE}/tools`, label: "Tools", icon: "tools" },
    ],
  },
  {
    group: "Improve",
    items: [
      { href: `${BASE}/intents#review`, label: "Suggestions", icon: "alerts", badgeKey: "suggested" },
      { href: "mailto:aditya@trykyre.com", label: "Talk to founders", icon: "chat" },
    ],
  },
];

function Wordmark() {
  return (
    <Link href="/agnost" className="flex items-center gap-2 px-3 py-3.5">
      <span className="grid h-5 w-5 rotate-45 place-items-center rounded-[3px] border border-ag-accent bg-ag-accent-wash" />
      <span className="text-[15px] font-medium tracking-[-0.01em] text-ag-hi">Agnost AI</span>
    </Link>
  );
}

/* Its own component so the glow hook is called once per item rather than inside
   a map, which would be an illegal conditional hook. */
function NavItem({
  item,
  on,
  compact,
  badge,
}: {
  item: NavItemDef;
  on: boolean;
  compact: boolean;
  badge?: number;
}) {
  const glowRef = useCursorGlow<HTMLAnchorElement>();
  return (
    <Link
      ref={on ? undefined : glowRef}
      href={item.href}
      aria-current={on ? "page" : undefined}
      className={`flex h-9 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors duration-150 ease-out ${
        compact ? "shrink-0 px-2.5" : ""
      } ${
        on
          ? /* Selection is a state, not an invitation — accent rule and wash,
               and no cursor glow. */
            "ag-selected font-medium text-ag-hi"
          : "ag-glow text-ag-mid hover:text-ag-hi"
      }`}
    >
      <Icon name={item.icon} />
      <span className={compact ? "hidden sm:inline" : ""}>{item.label}</span>
      {badge ? (
        <span className="ag-data ml-auto rounded-full bg-ag-accent-wash px-1.5 text-[10px] text-ag-accent-text">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function NavList({ active, compact = false }: { active: string; compact?: boolean }) {
  const isOn = (href: string) => active === href.split("#")[0];
  /* Shares the cached "intents" request with whichever screen is mounted, so
     the review badge costs no extra round trip. */
  const intents = useQuery("intents", (a) => a.getIntents(currentRange()));
  const suggested = intents.data?.filter((i) => i.suggested).length;

  return (
    <>
      {NAV.map((section, i) => (
        <div key={section.group ?? i} className={compact ? "flex" : "px-2 pb-1"}>
          {section.group && !compact && (
            <p className="ag-label px-2 pb-1.5 pt-3">{section.group}</p>
          )}
          {section.items.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              on={isOn(item.href)}
              compact={compact}
              badge={item.badgeKey === "suggested" ? suggested : undefined}
            />
          ))}
        </div>
      ))}
    </>
  );
}

/** Says why the numbers changed. The strip is at the bottom of the screen; the
    numbers it filters are at the top. */
function ScrubNotice() {
  const { at, set, events } = useScrub();
  if (at === null) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-ag-accent/25 bg-ag-accent-wash px-4 py-2">
      <span className="ag-body-sm text-ag-hi">
        Scrubbed to{" "}
        <span className="ag-data">{fmtClock(new Date(at).toISOString())} ±5 min</span>
      </span>
      <span className="ag-body-sm text-ag-mid">
        · {events.length} event{events.length === 1 ? "" : "s"} in this window
      </span>
      <button
        type="button"
        onClick={() => set(null)}
        className="ml-auto cursor-pointer text-[13px] font-medium text-ag-accent-text hover:underline"
      >
        Back to 24h
      </button>
    </div>
  );
}

export function Shell({
  title,
  breadcrumb,
  actions,
  activeOverride,
  children,
}: {
  title: ReactNode;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  activeOverride?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = activeOverride ?? pathname;

  return (
    <ScrubProvider>
      <div className="ag-scope flex h-full min-h-0 overflow-hidden rounded-[10px] border border-ag-subtle bg-ag-base text-ag-mid">
        <aside className="hidden w-[212px] shrink-0 flex-col border-r border-ag-subtle bg-ag-raised wide:flex">
          <Wordmark />
          <nav className="flex-1 overflow-y-auto pb-2">
            <NavList active={active} />
          </nav>
          <div className="flex items-center gap-2 border-t border-ag-subtle px-3 py-2.5">
            <span className="grid h-5 w-5 place-items-center rounded-[4px] bg-ag-overlay text-[10px] text-ag-mid">
              CF
            </span>
            <span className="ag-body-sm truncate text-ag-mid">ClipForge AI</span>
            <span className="ag-label ml-auto">Demo</span>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-wrap items-center gap-x-2 gap-y-2 border-b border-ag-subtle px-3 py-2.5 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              {breadcrumb}
              <h1 className="ag-body min-w-0 truncate font-medium text-ag-hi">{title}</h1>
            </div>
            <Button variant="ghost" icon="chevron">All time</Button>
            <Button variant="ghost" icon="filter">Filters</Button>
            <div className="ml-auto flex items-center gap-2">
              {actions}
              <Button variant="primary" icon="spark">Ask AI</Button>
            </div>
          </header>

          {/* Narrow viewports lose the sidebar and get the same groups inline. */}
          <nav className="flex gap-1 overflow-x-auto border-b border-ag-subtle px-2 py-1.5 wide:hidden">
            <NavList active={active} compact />
          </nav>

          <ScrubNotice />

          {/* Fade at the scroll boundary so a row leaving the viewport reads as
              scrolled rather than sliced — B2's sibling problem. */}
          <main
            className="min-h-0 flex-1 overflow-y-auto"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)",
            }}
          >
            {children}
          </main>

          <EventsStrip />
        </div>
      </div>
    </ScrubProvider>
  );
}
