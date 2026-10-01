import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({ component: RootLayout });

function RootLayout() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wide">
          <span className="rounded bg-brand-blue px-2 py-0.5 text-brand-yellow">EYEKEA</span>
          <EyeIcon />
        </Link>
        <nav className="flex gap-6 text-sm font-bold">
          <Link
            to="/"
            className="text-ink-subtle hover:text-ink"
            activeOptions={{ exact: true, includeSearch: false }}
            activeProps={{ className: "text-ink underline" }}
          >
            Supply chain
          </Link>
          <Link to="/design" className="text-ink-subtle hover:text-ink" activeProps={{ className: "text-ink underline" }}>
            Design system
          </Link>
        </nav>
      </header>
      <main className="flex min-h-0 flex-1">
        <Outlet />
      </main>
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 text-brand-blue" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}
