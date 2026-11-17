"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Empty, Icon } from "./ui";

/* The table primitive. It exists to fix two breaks once, for every screen:

   B2 — a container whose height is not a whole multiple of the row height
        slices the last row through the middle, which reads as a rendering
        fault. Here the row height is fixed at 44px and a capped table is
        exactly `header + rows x 44` tall, with a "View all" for the rest.

   B4 — columns that overflow produce a horizontal scrollbar, and the columns
        that fall off the right edge are the ones that tell you whether things
        are getting worse. Here each column declares when it may drop, the
        delta column never declares it, and below 900px the whole thing becomes
        stacked cards rather than scrolling sideways. */

export const ROW_H = 44;
const HEAD_H = 36;

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Grid width, e.g. "38%" or "88px". Omit for auto. */
  width?: string;
  align?: "left" | "right";
  /** Priority collapse. Columns without this never drop. */
  hide?: "lg" | "xl";
  /** Leave out of the stacked-card layout (e.g. a hover-action column). */
  cardHide?: boolean;
};

const HIDE_CLASS = {
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
} as const;

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  maxRows,
  viewAllHref,
  viewAllLabel = "View all",
  rowHref,
  onRowClick,
  isSelected,
  rowTone,
  empty,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  /** Show exactly this many complete rows, then a "View all". Never a part row. */
  maxRows?: number;
  viewAllHref?: string;
  viewAllLabel?: string;
  /** Destination for the row. Renders the first column as a real anchor that
      stretches across the row, so the whole row is clickable while right-click,
      middle-click and screen readers all still behave like a link. */
  rowHref?: (row: T) => string;
  onRowClick?: (row: T) => void;
  isSelected?: (row: T) => boolean;
  rowTone?: (row: T) => "error" | undefined;
  empty: { title: string; hint: string };
}) {
  const shown = maxRows ? rows.slice(0, maxRows) : rows;
  const overflow = rows.length - shown.length;

  if (!rows.length) {
    return <Empty title={empty.title} hint={empty.hint} />;
  }

  /* No hover highlight without a destination. A row that lights up on hover and
     does nothing reads as a broken control, so the affordance is tied to
     actually having somewhere to go. */
  const interactive = !!(rowHref || onRowClick);

  const rowClass = (row: T) =>
    [
      "group/row h-11 border-b border-ag-subtle transition-colors duration-150 ease-out last:border-b-0",
      interactive ? "relative cursor-pointer" : "",
      isSelected?.(row)
        ? "bg-ag-accent-wash"
        : rowTone?.(row) === "error"
          ? interactive
            ? "hover:bg-ag-overlay"
            : ""
          : interactive
            ? "hover:bg-ag-overlay"
            : "",
    ].join(" ");

  /** First column becomes the row's stretched link when rowHref is given. */
  const renderCell = (row: T, column: Column<T>, index: number) => {
    if (index !== 0 || !rowHref) return column.cell(row);
    return (
      <Link href={rowHref(row)} className="ag-rowlink">
        {column.cell(row)}
      </Link>
    );
  };

  return (
    <div className="min-w-0">
      {/* ---- table, 900px and up ---- */}
      <table
        className="hidden w-full table-fixed border-collapse wide:table"
        style={maxRows ? { height: HEAD_H + shown.length * ROW_H } : undefined}
      >
        <thead>
          <tr className="h-9">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                style={c.width ? { width: c.width } : undefined}
                className={`ag-label border-b border-ag-subtle px-4 text-left font-normal ${
                  c.align === "right" ? "text-right" : ""
                } ${c.hide ? HIDE_CLASS[c.hide] : ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((row) => (
            <tr
              key={rowKey(row)}
              className={rowClass(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              aria-selected={isSelected?.(row)}
            >
              {columns.map((c, ci) => (
                <td
                  key={c.key}
                  className={`ag-body-sm truncate px-4 text-ag-mid ${
                    c.align === "right" ? "text-right" : ""
                  } ${c.hide ? HIDE_CLASS[c.hide] : ""}`}
                >
                  {renderCell(row, c, ci)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ---- stacked cards, below 900px ---- */}
      <ul className="flex flex-col gap-2 p-3 wide:hidden">
        {shown.map((row) => {
          const [first, ...rest] = columns.filter((c) => !c.cardHide);
          return (
            <li key={rowKey(row)}>
              <div
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                className={`rounded-md border p-3 ${
                  interactive ? "relative" : ""
                } ${
                  isSelected?.(row)
                    ? "border-ag-accent/40 bg-ag-accent-wash"
                    : rowTone?.(row) === "error"
                      ? "border-ag-err/30 bg-ag-err/[0.06]"
                      : "border-ag-subtle bg-ag-base"
                }`}
              >
                <div className="ag-body-sm min-w-0 text-ag-hi">
                  {renderCell(row, first, 0)}
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {rest.map((c) => (
                    <div key={c.key} className="min-w-0">
                      <dt className="ag-label">{c.header}</dt>
                      <dd className="ag-body-sm truncate text-ag-mid">{c.cell(row)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          );
        })}
      </ul>

      {overflow > 0 && (
        <a
          href={viewAllHref ?? "#"}
          className="flex h-11 items-center gap-1.5 border-t border-ag-subtle px-4 text-[13px] font-medium text-ag-mid transition-colors duration-150 ease-out hover:text-ag-hi"
        >
          {viewAllLabel}
          <span className="text-ag-low">({overflow} more)</span>
          <Icon name="arrow" className="ml-auto" />
        </a>
      )}
    </div>
  );
}
