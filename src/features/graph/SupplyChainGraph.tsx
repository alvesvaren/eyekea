import { Link } from "@tanstack/react-router";
import { clsx } from "clsx";
import type { AssessedSite } from "../../supply-chain/load";
import { STATUS_META } from "../../supply-chain/status";
import type { SupplyChainViewProps } from "../types";

/** Horizontal and vertical padding around the graph, in percent of the container. */
const PADDING_X = 10;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 4;

type Position = { x: number; y: number };

/**
 * Stores get their own column after the distribution centres, even though both are IKEA (tier 0),
 * so goods always flow left to right.
 */
const columnOf = ({ type, tier }: AssessedSite) => (type === "store" ? 0 : tier + 1);
const columnLabel = (column: number) => ["IKEA stores", "IKEA warehouses"][column] ?? `Tier ${column - 1}`;

/**
 * Lays sites out in columns: the deepest suppliers on the left, IKEA stores on the right.
 * Coordinates are percentages so the layout scales with its container.
 */
function layout(sites: AssessedSite[]) {
  const columns = Map.groupBy(sites, columnOf);
  const lastColumn = Math.max(...columns.keys());
  const columnX = (column: number) =>
    PADDING_X + ((lastColumn - column) / Math.max(lastColumn, 1)) * (100 - 2 * PADDING_X);
  const positions = new Map<string, Position>();

  for (const [column, columnSites] of columns) {
    const x = columnX(column);
    const rowHeight = (100 - PADDING_TOP - PADDING_BOTTOM) / columnSites.length;
    columnSites.forEach(({ id }, row) => positions.set(id, { x, y: PADDING_TOP + rowHeight * (row + 0.5) }));
  }

  const headers = Array.from({ length: lastColumn + 1 }, (_, column) => ({
    label: columnLabel(column),
    x: columnX(column),
  }));

  return { positions, headers };
}

/** A horizontal S-curve between two points, in the same percentage coordinates as the nodes. */
function curve(from: Position, to: Position) {
  const midX = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
}

export default function SupplyChainGraph({ sites, links, visibleIds, selectedId }: SupplyChainViewProps) {
  const { positions, headers } = layout(sites);

  const edges = links.flatMap(({ from, to }) => {
    const start = positions.get(from);
    const end = positions.get(to);
    if (!start || !end) return [];
    return {
      key: `${from}-${to}`,
      path: curve(start, end),
      dimmed: !visibleIds.has(from) || !visibleIds.has(to),
      selected: from === selectedId || to === selectedId,
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden bg-surface">
      {headers.map(({ label, x }) => (
        <span
          key={label}
          className="absolute top-3 -translate-x-1/2 text-xs font-bold text-ink-muted"
          style={{ left: `${x}%` }}
        >
          {label}
        </span>
      ))}

      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {edges.map(({ key, path, dimmed, selected }) => (
          <path
            key={key}
            d={path}
            fill="none"
            vectorEffect="non-scaling-stroke"
            className={clsx(selected ? "stroke-ink" : "stroke-line-strong", dimmed && "opacity-20")}
            strokeWidth={selected ? 2.5 : 1.25}
          />
        ))}
      </svg>

      {sites.map(({ id, name, assessment }) => {
        const position = positions.get(id);
        if (!position) return null;
        return (
          <Link
            key={id}
            to="/sites/$siteId"
            params={{ siteId: id }}
            title={name}
            className={clsx(
              "absolute flex max-w-36 -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border bg-surface px-2 py-1 text-xs font-bold shadow-sm transition hover:z-10 hover:border-ink",
              id === selectedId ? "z-10 border-ink ring-2 ring-ink" : "border-line",
              !visibleIds.has(id) && "opacity-25",
            )}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: `var(${STATUS_META[assessment.status].colorVar})` }}
              aria-hidden
            />
            <span className="truncate">{name}</span>
          </Link>
        );
      })}
    </div>
  );
}
