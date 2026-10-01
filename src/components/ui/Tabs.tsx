import { clsx } from "clsx";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";

export function TabList({ className, ...props }: ComponentProps<"nav">) {
  return <nav className={clsx("flex gap-6 border-b border-line", className)} {...props} />;
}

/** Skapa tab styles. Pass to a router `<Link className>` so each tab is a real URL. */
export const tabVariants = cva(
  "-mb-px inline-flex h-12 items-center border-b-2 text-sm font-bold transition-colors",
  {
    variants: {
      selected: {
        true: "border-ink text-ink",
        false: "border-transparent text-ink-subtle hover:border-line-strong hover:text-ink",
      },
    },
    defaultVariants: { selected: false },
  },
);
