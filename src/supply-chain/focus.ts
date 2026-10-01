import { COVERAGE_REVIEW_THRESHOLD } from "./assess";
import type { AssessedSite } from "./load";

/** The highlight filters on the map and graph. Sites that do not match are dimmed, not hidden, so chains stay intact. */
export const FOCUS_OPTIONS = {
  all: { label: "All sites", matches: () => true },
  review: { label: "Needs review", matches: (site: AssessedSite) => site.assessment.needsReview },
  high: { label: "High risk", matches: (site: AssessedSite) => site.assessment.risk === "high" },
  gaps: {
    label: "Data gaps",
    matches: (site: AssessedSite) => site.assessment.coverage < COVERAGE_REVIEW_THRESHOLD,
  },
} as const;

export type Focus = keyof typeof FOCUS_OPTIONS;
export const FOCUSES = Object.keys(FOCUS_OPTIONS) as [Focus, ...Focus[]];
