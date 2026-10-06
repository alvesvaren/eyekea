import type { SiteStatus } from "../../supply-chain/status";

/**
 * Face drawn for each status, so the level reads from its shape and not only its colour: a smile
 * for low risk, a flat mouth for medium and a frown for high. Not enough data gets a question mark
 * and no face, so a site that did not report never looks like it is doing well.
 * Paths are SVG path data in a 20 by 20 box, shared by the `StatusFace` SVG and the map's canvas.
 */
export const FACE_SIZE = 20;
export const FACE_CENTER = FACE_SIZE / 2;
export const FACE_RADIUS = 9;
export const FACE_STROKE = 1.75;

const EYES = "M7 7.25v1.5M13 7.25v1.5";

export const FACE_PATHS = {
  low: `${EYES}M6 11.5q4 4 8 0`,
  medium: `${EYES}M6.5 13h7`,
  high: `${EYES}M6 14.5q4-3.5 8 0`,
  unknown: "M7.5 7.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M10 14.5v.01",
} as const satisfies Record<SiteStatus, string>;

/** Unknown is a hollow ring with its glyph in the ring colour. Every other level is filled. */
export const isHollow = (status: SiteStatus) => status === "unknown";
