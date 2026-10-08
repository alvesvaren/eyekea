import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";

/** Stack of `AccordionItem`s separated by lines. */
export function Accordion({ className, ...props }: ComponentProps<"div">) {
  return <div className={clsx("flex flex-col border-t border-line", className)} {...props} />;
}

/** A native `<details>` row, so it opens without JavaScript state and works with find-in-page. */
export function AccordionItem({
  title,
  hint,
  children,
  className,
  ...props
}: Omit<ComponentProps<"details">, "title"> & { title: ReactNode; hint?: ReactNode }) {
  return (
    <details className={clsx("group border-b border-line", className)} {...props}>
      <summary className="flex cursor-pointer list-none items-center gap-4 py-4 hover:bg-surface-subtle [&::-webkit-details-marker]:hidden">
        <span className="flex flex-1 flex-col gap-1">
          <span className="font-bold">{title}</span>
          {hint && <span className="text-xs text-ink-subtle">{hint}</span>}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-5 shrink-0 transition-transform group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="flex flex-col gap-3 pb-5">{children}</div>
    </details>
  );
}
