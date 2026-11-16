import type { ReactNode } from "react";

export function StatusPill({
  kind,
  label,
}: {
  kind: "ok" | "bad" | "warn";
  label: string;
}) {
  const styles = {
    ok: "bg-ok/10 text-ok",
    bad: "bg-bad/10 text-bad",
    warn: "bg-warn/10 text-warn",
  }[kind];
  const dot = { ok: "bg-ok", bad: "bg-bad", warn: "bg-warn" }[kind];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export function SkeletonTable({ rows = 8 }: { rows?: number }) {
  return (
    <div className="bg-ink p-4">
      <div className="skeleton mb-4 h-8 w-72 max-w-full rounded-md bg-card2" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-9 rounded-md bg-card2"
            style={{ animationDelay: `${i * 90}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint: string;
  action: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center bg-ink px-6 py-24 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-edge font-mono text-[#7a736c]">
        ∅
      </div>
      <p className="mt-4 font-medium text-hi">{title}</p>
      <p className="mt-1 text-sm text-[#7a736c]">{hint}</p>
      <button className="mt-5 rounded-md border border-edge px-3 py-1.5 text-sm text-[#d6d0c7] hover:border-accent hover:text-hi">
        {action}
      </button>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-ink p-4">
      <div className="flex items-start gap-3 rounded-lg border border-bad/30 bg-bad/5 p-4">
        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-bad" />
        <div className="flex-1">
          <p className="font-medium text-bad">{message}</p>
          <p className="mt-1 text-sm text-[#7a736c]">
            Your data is safe — this view just failed to load. Retrying usually
            fixes it.
          </p>
        </div>
        <button className="rounded-md border border-edge px-3 py-1.5 text-sm text-[#d6d0c7] hover:border-bad hover:text-hi">
          Retry
        </button>
      </div>
      <div className="mt-3 space-y-2 opacity-30">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 rounded-md bg-card2" />
        ))}
      </div>
    </div>
  );
}

export function Toolbar({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge bg-card px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">{left}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

export function Chip({
  children,
  active,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`rounded-md px-2.5 py-1 font-mono text-xs ${
        active
          ? "bg-accent/10 text-accent ring-1 ring-accent/30"
          : "bg-card2 text-muted ring-1 ring-edge"
      }`}
    >
      {children}
    </span>
  );
}
