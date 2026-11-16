"use client";

import { useId } from "react";

/* The chart primitive. Two breaks fixed once:

   B3 — their entry animation pops the data points in first and draws the line
        between them progressively, so every load and every filter change
        passes through a frame that looks like a data error. Here the line is a
        single continuous stroke revealed by a widening clip rect, so it is
        never discontinuous, and the points fade in only once it lands. 400ms,
        and prefers-reduced-motion renders the final state immediately.

   B6 — two panels with different y-scales sit side by side and get compared by
        slope. The axis maximum is a required prop and is rendered at full
        contrast, and callers state it in the panel header too. */

const W = 720;
const H = 200;
const PAD = { top: 14, right: 12, bottom: 26, left: 34 };

export type Point = { label: string; value: number };

/** Axis bounds and tick count a person would have chosen: a 1/2/2.5/5 step ramp,
    so a peak of 14 gives 0–15 in fives rather than 0–20 in sevens.

    Every series here is a count of things, so the step is floored at 1. Without
    that, a filtered view peaking at 1 gets a step of 0.5 and an axis labelled
    0, 1, 1 — two gridlines claiming the same value.

    The floor is only zero when zero is meaningful. A series running 12–17 on a
    0–20 axis puts the line in the top third and leaves 60% of the panel empty,
    which flattens every trend in it. When the data band is narrower than its own
    distance from zero, the axis starts near the data instead — and the caller
    prints both bounds, because a silent non-zero baseline is how a chart lies. */
export function niceScale(values: number[], targetTicks = 3) {
  const dataMin = Math.min(...values, Infinity);
  const dataMax = Math.max(...values, 1);
  const band = dataMax - dataMin;

  const stepFor = (span: number) => {
    const rough = span / targetTicks;
    const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(rough, 1e-9))));
    const raw =
      [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ??
      10 * magnitude;
    return Math.max(1, Math.round(raw));
  };

  // Zero-base unless the data sits well clear of zero and spans a narrow band.
  const liftFloor = dataMin > 0 && band > 0 && dataMin > band;
  if (!liftFloor) {
    const step = stepFor(dataMax);
    const max = Math.ceil(dataMax / step) * step;
    return { min: 0, max, ticks: Math.round(max / step), lifted: false };
  }

  const pad = band * 0.15;
  const step = stepFor(band + pad * 2);
  const min = Math.max(0, Math.floor((dataMin - pad) / step) * step);
  const max = Math.ceil((dataMax + pad) / step) * step;
  return { min, max, ticks: Math.max(1, Math.round((max - min) / step)), lifted: true };
}

export function LineChart({
  points,
  min = 0,
  max,
  label,
  ticks = 3,
}: {
  points: Point[];
  /** Axis floor. Non-zero when the data sits clear of zero — see niceScale. */
  min?: number;
  /** Axis maximum. Explicit so adjacent panels can be put on a shared scale. */
  max: number;
  label: string;
  ticks?: number;
}) {
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const span = Math.max(1e-9, max - min);
  const x = (i: number) => PAD.left + (i / Math.max(1, points.length - 1)) * innerW;
  const y = (v: number) => PAD.top + innerH - ((v - min) / span) * innerH;

  const coords = points.map((p, i) => [x(i), y(p.value)] as const);
  // Unique per instance: two charts on one page must not share a clipPath id.
  const revealId = `ag-reveal-${useId().replace(/:/g, "")}`;

  const gridValues = Array.from({ length: ticks + 1 }, (_, i) => min + (span / ticks) * i);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${label}. Axis ${min} to ${max}. ${points
        .map((p) => `${p.label}: ${p.value}`)
        .join(", ")}`}
      /* Remount on data change so the draw replays on filter, not just on load. */
      key={points.map((p) => p.value).join(",")}
    >
      {gridValues.map((v, i) => (
        <g key={v}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(v)}
            y2={y(v)}
            stroke="var(--color-ag-subtle)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={PAD.left - 8}
            y={y(v) + 4}
            textAnchor="end"
            /* The maximum is the label that has to register — B6. */
            className={`ag-data ${
              i === gridValues.length - 1 ? "fill-ag-mid" : "fill-ag-low"
            }`}
            style={{ fontSize: 11 }}
          >
            {Math.round(v)}
          </text>
        </g>
      ))}

      {/* The reveal is a clip rect that widens, not a dash offset.
          stroke-dasharray under vector-effect: non-scaling-stroke is resolved in
          SCREEN pixels while the path length is in USER units, so at any scale
          above 1 the single-dash pattern is shorter than the rendered path and
          repeats — dash, gap, dash — leaving the chart in permanent pieces. A
          clip rect is pure geometry, so it is correct at every viewport width
          and the stroke stays a crisp 1.75px. */}
      <clipPath id={revealId}>
        {/* Padded past the plot area: the line has a round cap that extends half
            a stroke width beyond the first and last point, and a clip sized to
            the exact bbox would shave both flat. */}
        <rect
          className="ag-reveal"
          x={PAD.left - 2}
          y={0}
          width={innerW + 4}
          height={H}
        />
      </clipPath>
      <polyline
        points={coords.map(([cx, cy]) => `${cx},${cy}`).join(" ")}
        fill="none"
        stroke="var(--color-ag-accent)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        clipPath={`url(#${revealId})`}
      />

      {coords.map(([cx, cy], i) => (
        <rect
          key={points[i].label}
          x={cx - 2.5}
          y={cy - 2.5}
          width="5"
          height="5"
          fill="var(--color-ag-base)"
          stroke="var(--color-ag-accent)"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
          className="ag-point"
        />
      ))}

      {points.map((p, i) => (
        <text
          key={p.label}
          x={x(i)}
          y={H - 6}
          /* The first and last labels are centred on points sitting on the plot
             edges, so centring them runs half the text outside the viewBox and
             the last one renders clipped. Anchor the ends inward instead. */
          textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
          className="ag-data fill-ag-low"
          style={{ fontSize: 11 }}
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}
