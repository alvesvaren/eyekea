import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

const dotVariants = cva("inline-block size-2.5 shrink-0 rounded-full", {
  variants: {
    tone: {
      positive: "bg-positive",
      caution: "bg-caution",
      negative: "bg-negative",
      informative: "bg-informative",
      neutral: "bg-line-strong",
    },
  },
});

export type StatusTone = NonNullable<VariantProps<typeof dotVariants>["tone"]>;

/** Skapa status indicator: a coloured dot followed by a label. */
export function Status({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className={dotVariants({ tone })} aria-hidden />
      {children}
    </span>
  );
}
