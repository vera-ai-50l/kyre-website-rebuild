"use client";

import { useMemo, useState } from "react";
import { currentRange, useQuery, type Intent, type Message, type User, type Violation } from "@/lib/data";
import { fmtAgo, fmtClock, fmtCost, fmtLatency, latencyTone } from "@/lib/data/format";
import { DataTable } from "../DataTable";
import { ErrorState, SkeletonRows } from "../QueryState";
import { useUrlState } from "../useUrlState";
import { Badge, Icon, Panel } from "../ui";

/* B9 — in their transcript, user turns and agent turns are the same width, the
   same alignment and the same surface; the only tell is a small metadata line.
   Reading a transcript to diagnose a failure means parsing every label to work
   out who spoke, on the screen built for exactly that. Here the agent's turns
   carry a left accent rule and a raised surface, and the user's stay flush
   against the panel, so speaker is a glance and not a read. */
function Turn({ message, intents, violations }: { message: Message; intents: Intent[]; violations: Violation[] }) {
  const intent = intents.find((i) => i.slug === message.intent);
  const violation = violations.find((v) => v.slug === message.violation);
  const isAgent = message.role === "agent";

  return (
    <li className={isAgent ? "border-l-2 border-ag-accent/50 pl-3" : "pl-0"}>
      {!isAgent && <p className="ag-data mb-1 text-[11px] text-ag-low">{fmtClock(message.timestamp)}</p>}
      <div
        className={`rounded-md px-3 py-2 ${
          isAgent ? "bg-ag-overlay" : "border border-ag-subtle bg-ag-base"
        }`}
      >
        <p className="ag-body-sm text-ag-hi">{message.text}</p>
      </div>

      {isAgent && (
        <p className="ag-data mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-ag-low">
          <span>Video Editing Agent</span>
          <span aria-hidden>·</span>
          <span>{fmtClock(message.timestamp)}</span>
          <span aria-hidden>·</span>
          {/* Same thresholds as the Events table, so the number never means two
              different things on two screens. */}
          <span
            className={
              {
                neutral: "text-ag-low",
                warn: "text-ag-warn",
                error: "text-ag-err",
              }[latencyTone(message.latencyMs ?? 0)]
            }
          >
            {fmtLatency(message.latencyMs ?? 0)}
          </span>
        </p>
      )}

      {intent && (
        <p className="mt-1.5">
          <Badge tone="accent">
            <Icon name="intents" className="h-3 w-3" />
            {intent.name}
          </Badge>
        </p>
      )}

      {/* Violations stay at the message where they fired, not in a separate
          log — the one place their design was already right. */}
      {violation && (
        <p className="mt-1.5">
          <Badge tone="error">
            <Icon name="warn" className="h-3 w-3" />
            {violation.name}
          </Badge>
        </p>
      )}
    </li>
  );
}

function ConversationPanel({
  user,
  conversationId,
  intents,
  violations,
  onClose,
}: {
  user: User;
  conversationId: string;
  intents: Intent[];
  violations: Violation[];
  onClose: () => void;
}) {
  /* Transcripts are fetched per conversation rather than shipped with the user
     list — against a real backend, sending every message for twenty users just
     to render one panel is the request that makes the page slow. */
  const query = useQuery(`conversation:${conversationId}`, (a) =>
    a.getConversation(conversationId),
  );
  const conversation = query.data;
  const distinctIntents = new Set(
    (conversation?.messages ?? []).map((m) => m.intent).filter(Boolean),
  );
  const violationCount = (conversation?.messages ?? []).filter((m) => m.violation).length;

  return (
    <Panel
      title={user.email}
      action={
        <button
          type="button"
          onClick={onClose}
          aria-label="Close conversation"
          className="cursor-pointer rounded p-1 text-ag-low hover:bg-ag-overlay hover:text-ag-hi"
        >
          <Icon name="x" />
        </button>
      }
      className="min-h-0"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-ag-subtle px-4 py-2">
        <span className="ag-data text-[11px] text-ag-low">{conversationId}</span>
        {conversation && (
          <>
            <Badge tone="accent">{distinctIntents.size} intents</Badge>
            {violationCount > 0 && <Badge tone="error">{violationCount} violations</Badge>}
            <span className="ag-data ml-auto text-[11px] text-ag-low">
              {fmtClock(conversation.startedAt)}
            </span>
          </>
        )}
      </div>
      {query.error ? (
        <ErrorState error={query.error} onRetry={query.refetch} />
      ) : !conversation ? (
        <div className="flex flex-col gap-3 p-4">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className="ag-skeleton h-14 rounded-md" />
          ))}
        </div>
      ) : (
        <ol className="flex min-h-0 flex-col gap-3 overflow-y-auto p-4">
          {conversation.messages.map((m, i) => (
            <Turn key={i} message={m} intents={intents} violations={violations} />
          ))}
        </ol>
      )}
    </Panel>
  );
}

/* One pill, plus a count when there is more than one. The row is 44px and must
   stay 44px, so this never wraps — the overflow becomes "+2" rather than a
   second line. */
function PillList({ names, tone }: { names: string[]; tone: "accent" | "error" }) {
  if (!names.length) return <span className="ag-body-sm text-ag-low">—</span>;
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <Badge tone={tone}>
        <span className="max-w-[15ch] truncate xl:max-w-[24ch]">{names[0]}</span>
      </Badge>
      {names.length > 1 && (
        <span className="ag-data shrink-0 text-[11px] text-ag-low">+{names.length - 1}</span>
      )}
    </span>
  );
}

export function Users() {
  const [chosen, setChosen] = useState<User | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const { param } = useUrlState();
  const range = useMemo(() => currentRange(), []);
  const now = Date.parse(range.to);

  const users = useQuery("users", (a) => a.getUsers(range));
  const intents = useQuery("intents", (a) => a.getIntents(range));
  const violations = useQuery("violations", (a) => a.getViolations(range));
  const rows = users.data ?? [];

  /* Arriving from an insight on Home opens that person's conversation. */
  const linked = param("user");
  const selected =
    chosen ?? (linked && !dismissed ? (rows.find((u) => u.id === linked) ?? null) : null);

  const select = (user: User | null) => {
    setChosen(user);
    if (!user) setDismissed(true);
  };

  return (
    /* B10 — their split reserves two thirds of the width for a table with one
       row in it while the panel doing the work is squeezed to ~250px and
       truncates. Selecting a user flips the weighting to 40/60 in favour of the
       conversation, and the table stops reserving height it is not using. */
    <div
      className={`grid min-h-0 gap-4 p-4 sm:p-6 ${
        selected ? "wide:grid-cols-[2fr_3fr]" : "grid-cols-1"
      }`}
    >
      <Panel
        title="All users"
        icon="users"
        action={
          <span className="ag-data text-[11px] text-ag-low">{rows.length} in 24h</span>
        }
        /* Height collapses to the content — no empty reserved area. */
        className="self-start"
      >
        {users.error ? (
          <ErrorState error={users.error} onRetry={users.refetch} />
        ) : users.loading ? (
          <SkeletonRows rows={8} />
        ) : (
        <DataTable<User>
          rows={rows}
          rowKey={(u) => u.id}
          onRowClick={(u) => select(selected?.id === u.id ? null : u)}
          isSelected={(u) => u.id === selected?.id}
          rowTone={(u) => (u.violations.length > 0 ? "error" : undefined)}
          empty={{
            title: "No users in this range",
            hint: "Widen the time range, or send a conversation through the agent to see it here.",
          }}
          /* Priority order: User, Cost, Violations, Messages, Intents, Last
             active. When the conversation panel takes 60% of the width, the two
             lowest are dropped outright rather than every column being squeezed
             proportionally — table-fixed with 508px of fixed widths in a 432px
             table is what shaved the email down to a single character. */
          columns={[
            {
              key: "user",
              /* No explicit width: it takes whatever the fixed columns leave,
                 which keeps the address readable instead of first to suffer. */
              header: "User",
              cell: (u) => <span className="ag-data text-ag-hi">{u.email}</span>,
            },
            {
              key: "messages",
              header: "Messages",
              width: selected ? "76px" : "104px",
              align: "right",
              cell: (u) => <span className="ag-data">{u.messages}</span>,
            },
            {
              /* Cost never collapses. It is the number that gets an
                 observability tool approved rather than deferred — B5. */
              key: "cost",
              header: "Cost",
              width: "84px",
              align: "right",
              cell: (u) => <span className="ag-data text-ag-hi">{fmtCost(u.costUsd)}</span>,
            },
            ...(selected
              ? []
              : [
                  {
                    key: "intents",
                    header: "Intents",
                    width: "26%",
                    hide: "lg" as const,
                    cell: (u: User) => (
                      <PillList
                        names={u.intents.map(
                          (slug) => intents.data?.find((i) => i.slug === slug)?.name ?? slug,
                        )}
                        tone="accent"
                      />
                    ),
                  },
                ]),
            {
              /* Text, not a tally. "1" tells the reader nothing they can act on;
                 the violation's name is the whole point of the column. Narrow
                 layouts fall back to a count, which is what the width is for. */
              key: "violations",
              header: "Violations",
              width: selected ? "168px" : "20%",
              cell: (u) =>
                u.violations.length === 0 ? (
                  <span className="ag-body-sm text-ag-low">—</span>
                ) : (
                  <PillList
                    names={u.violations.map(
                      (slug) => violations.data?.find((v) => v.slug === slug)?.name ?? slug,
                    )}
                    tone="error"
                  />
                ),
            },
            ...(selected
              ? []
              : [
                  {
                    /* Lowest priority — drops first at narrow widths, and
                       entirely once the conversation panel opens. */
                    key: "lastActive",
                    header: "Last active",
                    width: "128px",
                    align: "right" as const,
                    hide: "xl" as const,
                    cell: (u: User) => (
                      <span className="ag-data text-ag-low">{fmtAgo(u.lastActive, now)}</span>
                    ),
                  },
                ]),
          ]}
        />
        )}
      </Panel>

      {selected && (
        <ConversationPanel
          user={selected}
          conversationId={selected.conversationId}
          intents={intents.data ?? []}
          violations={violations.data ?? []}
          onClose={() => select(null)}
        />
      )}
    </div>
  );
}
