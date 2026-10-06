import { cva } from "class-variance-authority";
import type { ReactNode } from "react";
import type { SiteStatus } from "../../supply-chain/status";
import { FACE_CENTER, FACE_PATHS, FACE_RADIUS, FACE_SIZE, FACE_STROKE, isHollow } from "./statusFace";

const faceVariants = cva("size-4 shrink-0", {
  variants: {
    tone: {
      high: "fill-risk-high stroke-ink",
      medium: "fill-risk-medium stroke-ink",
      low: "fill-risk-low stroke-ink",
      unknown: "fill-surface stroke-risk-unknown",
    },
    size: {
      default: "scale-100",
      large: "scale-140"
    }
  },
});

export type StatusTone = SiteStatus;

/** Risk face on its own, for places that draw their own label. */
export function StatusFace({ tone, size = "default" }: { tone: StatusTone, size?: "large" | "default" }) {
  return (
    <svg viewBox={`0 0 ${FACE_SIZE} ${FACE_SIZE}`} className={faceVariants({ tone, size })} aria-hidden>
      <circle cx={FACE_CENTER} cy={FACE_CENTER} r={FACE_RADIUS} strokeWidth={isHollow(tone) ? FACE_STROKE : 0} />
      <path d={FACE_PATHS[tone]} fill="none" strokeWidth={FACE_STROKE} strokeLinecap="round" />
    </svg>
  );
}

/** Skapa status indicator: a risk face followed by a label. */
export function Status({ tone, size, children }: { tone: StatusTone; size?: Parameters<typeof StatusFace>[0]['size']; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <StatusFace size={size} tone={tone} />
      {children}
    </span>
  );
}
