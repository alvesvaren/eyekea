import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

const dotVariants = cva("inline-block size-2.5 shrink-0 rounded-full", {
  variants: {
    tone: {
      high: "bg-risk-high",
      medium: "bg-risk-medium",
      low: "bg-risk-low",
      unknown: "border-2 border-risk-unknown bg-surface",
    },
  },
});

export type StatusTone = NonNullable<VariantProps<typeof dotVariants>["tone"]>;

/** Risk dot on its own, for places that draw their own label. */
export function StatusDot({ tone }: { tone: StatusTone }) {
  return <span className={dotVariants({ tone })} aria-hidden />;
}

/** Skapa status indicator: a dot in a risk colour followed by a label. */
export function Status({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <StatusDot tone={tone} />
      {children}
    </span>
  );
}
