import { cva } from "class-variance-authority";

/** Skapa filter pill. Pass to a router `<Link className>` so the filter lives in the URL. */
export const pillVariants = cva(
  "inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-bold transition-colors",
  {
    variants: {
      selected: {
        true: "bg-primary text-ink-inverse hover:bg-primary-hover",
        false: "bg-surface-subtle text-ink hover:bg-surface-pressed",
      },
    },
    defaultVariants: { selected: false },
  },
);
