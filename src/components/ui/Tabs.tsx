import { clsx } from "clsx";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";

export function TabList({ className, ...props }: ComponentProps<"nav">) {
  return <nav className={clsx("flex border-b border-line", className)} {...props} />;
}

/** Skapa tab styles. Pass to a router `<Link className>` so each tab is a real URL. */
export const tabVariants = cva(
  "-mb-px inline-flex h-12 min-w-24 items-center justify-center border-b-2 px-4 text-base font-bold transition-colors md:h-14 md:min-w-32 md:px-6",
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
