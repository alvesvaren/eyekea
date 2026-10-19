import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { clsx } from "clsx";
import { buttonVariants } from "../components/ui/Button";

export const Route = createRootRoute({ component: RootLayout });

const NAV_LINKS = [
  { to: "/", label: "Supply chain" },
  { to: "/design", label: "Design system" },
  { to: "/document", label: "Innovation document" },
] as const;

const MENU_ID = "site-menu";

function RootLayout() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4 md:h-16 md:px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wide">
          <span className="rounded bg-brand-blue px-2 py-0.5 text-brand-yellow">EYEKEA</span>
          <EyeIcon />
        </Link>
        <NavLinks className="hidden gap-6 md:flex" />
        <MobileMenu />
      </header>
      <main className="flex min-h-0 flex-1">
        <Outlet />
      </main>
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </div>
  );
}

function NavLinks({ className }: { className: string }) {
  return (
    <nav className={clsx("text-sm font-bold", className)}>
      {NAV_LINKS.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className="py-3 text-ink-subtle hover:text-ink md:py-0"
          activeOptions={{ exact: true, includeSearch: false }}
          activeProps={{ className: "text-ink underline" }}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

/**
 * The nav as a dropdown on small screens. The native popover closes when you tap outside it,
 * and the key remounts it closed after each navigation.
 */
function MobileMenu() {
  const href = useRouterState({ select: ({ location }) => location.href });

  return (
    <>
      <button
        type="button"
        popoverTarget={MENU_ID}
        aria-label="Menu"
        className={clsx(buttonVariants({ variant: "tertiary", size: "icon" }), "md:hidden")}
      >
        <MenuIcon />
      </button>
      <div
        key={href}
        id={MENU_ID}
        popover="auto"
        className="inset-x-0 top-14 bottom-auto m-0 w-full border-b border-line bg-surface text-ink shadow-md"
      >
        <NavLinks className="flex flex-col px-4 pb-2" />
      </div>
    </>
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

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
