import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

/** Skapa button styles. Use on `<button>` via `Button`, or pass to a router `<Link className>`. */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap transition-colors disabled:pointer-events-none aria-disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-ink-inverse hover:bg-primary-hover active:bg-primary-pressed disabled:bg-disabled aria-disabled:bg-disabled",
        emphasised:
          "bg-emphasised text-ink-inverse hover:bg-emphasised-hover active:bg-emphasised-pressed disabled:bg-disabled aria-disabled:bg-disabled",
        secondary:
          "border border-line-strong bg-surface text-ink hover:border-ink active:bg-surface-pressed disabled:border-disabled disabled:text-ink-disabled",
        tertiary:
          "bg-transparent text-ink hover:bg-surface-subtle active:bg-surface-pressed disabled:text-ink-disabled",
        destructive:
          "bg-destructive text-ink-inverse hover:bg-destructive-hover active:bg-destructive-pressed disabled:bg-disabled",
      },
      size: {
        sm: "h-10 px-5 text-xs",
        md: "h-14 px-8 text-sm",
        la: "h-16 px-14 text-",
        icon: "size-10 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonVariants({ variant, size, className })} {...props} />;
}
