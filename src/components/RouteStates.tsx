import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Button, buttonVariants } from "./ui/Button";

/** Shown while a route's loader runs (after the router's pending delay). */
export function RoutePending() {
  return (
    <div className="flex h-full items-center justify-center p-8 text-ink-muted" role="status">
      Loading…
    </div>
  );
}

export function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const message = error instanceof Error ? error.message : String(error);
  const retry = () => {
    reset();
    void router.invalidate();
  };

  return (
    <div className="flex h-full flex-col items-start justify-center gap-4 p-8" role="alert">
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="text-ink-subtle">{message}</p>
      <Button size="sm" onClick={retry}>
        Try again
      </Button>
    </div>
  );
}

export function RouteNotFound() {
  return (
    <div className="flex h-full flex-col items-start justify-center gap-4 p-8">
      <h2 className="text-xl font-bold">Not found</h2>
      <p className="text-ink-subtle">There is nothing at this address.</p>
      <Link to="/" className={buttonVariants({ size: "sm", variant: "secondary" })}>
        Back to the overview
      </Link>
    </div>
  );
}
