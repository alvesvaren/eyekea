import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={clsx("flex flex-col gap-3 rounded bg-surface-subtle p-5", className)} {...props} />;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-base font-bold">{children}</h3>;
}

/** A single headline number with a label underneath. */
export function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded bg-surface-subtle p-4">
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-ink-subtle">{label}</span>
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
    </div>
  );
}
