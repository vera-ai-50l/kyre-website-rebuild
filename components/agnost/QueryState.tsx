"use client";

import type { ReactNode } from "react";
import type { Query } from "@/lib/data";
import { ROW_H } from "./DataTable";
import { Button } from "./ui";

/* Loading and error are a third of what a user actually sees, so they are built
   rather than left to fall out of the happy path.

   The skeleton occupies the final dimensions — the same 44px rows the real
   table will use — so data arriving does not shift the layout under the
   reader's cursor. */

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden>
      <div className="h-9 border-b border-ag-subtle" />
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-ag-subtle px-4 last:border-b-0"
          style={{ height: ROW_H }}
        >
          <span
            className="ag-skeleton h-3 flex-1 rounded"
            style={{ maxWidth: `${38 + ((i * 13) % 24)}%` }}
          />
          <span className="ag-skeleton h-3 w-12 rounded" />
          <span className="ag-skeleton h-3 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: Error;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <p className="ag-body font-medium text-ag-hi">This panel could not load</p>
      {/* The actual message, not a shrug. If the adapter is unimplemented or the
          API is down, the person reading needs to know which. */}
      <p className="ag-body-sm max-w-lg text-ag-mid">{error.message}</p>
      {onRetry && (
        <div className="mt-2">
          <Button variant="outline" icon="refresh" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

/** Renders children only once data has arrived. */
export function QueryState<T>({
  query,
  skeletonRows,
  children,
}: {
  query: Query<T>;
  skeletonRows?: number;
  children: (data: T) => ReactNode;
}) {
  if (query.error) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (query.loading || query.data === undefined) {
    return <SkeletonRows rows={skeletonRows} />;
  }
  return <>{children(query.data)}</>;
}
