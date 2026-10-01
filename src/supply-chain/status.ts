import type { StatusTone } from "../components/ui/Status";
import type { Assessment } from "./assess";
import type { SiteType } from "./schema";

export type SiteStatus = Assessment["status"];

/** How each status is labelled and coloured everywhere: legend, map, graph and panels. */
export const STATUS_META = {
  high: { label: "High risk", tone: "negative", colorVar: "--color-negative" },
  medium: { label: "Medium risk", tone: "caution", colorVar: "--color-caution" },
  low: { label: "Low risk", tone: "positive", colorVar: "--color-positive" },
  unknown: { label: "Not enough data", tone: "neutral", colorVar: "--color-line-strong" },
} as const satisfies Record<SiteStatus, { label: string; tone: StatusTone; colorVar: string }>;

export const SITE_STATUSES = Object.keys(STATUS_META) as SiteStatus[];

export const SITE_TYPE_LABELS = {
  forestry: "Forestry",
  sawmill: "Sawmill",
  materials: "Materials",
  components: "Components",
  manufacturer: "Manufacturer",
  distribution: "IKEA distribution",
  store: "IKEA store",
} as const satisfies Record<SiteType, string>;
