import type { Assessment } from "./assess";
import type { SiteType } from "./schema";

export type SiteStatus = Assessment["status"];

/**
 * How each status is labelled everywhere: legend, map, graph and panels. Each status is drawn
 * with the `--color-risk-<status>` token and the `Status` tone of the same name.
 */
export const STATUS_META = {
  high: { label: "High risk" },
  medium: { label: "Medium risk" },
  low: { label: "Low risk" },
  unknown: { label: "Not enough data" },
} as const satisfies Record<SiteStatus, { label: string }>;

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
