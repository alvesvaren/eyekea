import { createFileRoute, Link, Outlet, retainSearchParams, stripSearchParams, useParams } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { z } from "zod";
import { RoutePending } from "../components/RouteStates";
import { pillVariants } from "../components/ui/Pill";
import { Status } from "../components/ui/Status";
import { TabList, tabVariants } from "../components/ui/Tabs";
import { FOCUS_OPTIONS, FOCUSES } from "../supply-chain/focus";
import { loadSupplyChain } from "../supply-chain/load";
import { SITE_STATUSES, STATUS_META } from "../supply-chain/status";

const SupplyChainMap = lazy(() => import("../features/map/SupplyChainMap"));
const SupplyChainGraph = lazy(() => import("../features/graph/SupplyChainGraph"));

const VIEWS = { map: "Map", graph: "Graph" } as const;
type View = keyof typeof VIEWS;
const VIEW_OPTIONS = Object.keys(VIEWS) as [View, ...View[]];

const searchDefaults = { view: "map", focus: "all" } as const;

const searchSchema = z.object({
  view: z.enum(VIEW_OPTIONS).default(searchDefaults.view).catch(searchDefaults.view),
  focus: z.enum(FOCUSES).default(searchDefaults.focus).catch(searchDefaults.focus),
});

/**
 * The supply chain explorer: map or graph on the left, a details panel on the right.
 * The panel is the child route (overview at `/`, a site at `/sites/$siteId`), so the
 * map stays mounted while you click between sites.
 */
export const Route = createFileRoute("/_explorer")({
  validateSearch: searchSchema,
  // Keep the view and filter when clicking between sites, but leave defaults out of the URL.
  search: { middlewares: [retainSearchParams(["view", "focus"]), stripSearchParams(searchDefaults)] },
  loader: () => loadSupplyChain(),
  component: Explorer,
});

function Explorer() {
  const { view, focus } = Route.useSearch();
  const { sites, links } = Route.useLoaderData();
  const { siteId } = useParams({ strict: false });

  const visibleIds = new Set(sites.filter(FOCUS_OPTIONS[focus].matches).map(({ id }) => id));
  const viewProps = { sites, links, visibleIds, selectedId: siteId };

  return (
    <div className="flex min-w-0 flex-1">
      <section className="flex w-1/2 min-w-0 flex-col gap-3 px-6 pt-2 pb-6">
        <TabList>
          {VIEW_OPTIONS.map((option) => (
            <Link
              key={option}
              to="."
              search={(prev) => ({ ...prev, view: option })}
              className={tabVariants({ selected: view === option })}
            >
              {VIEWS[option]}
            </Link>
          ))}
        </TabList>

        <div className="flex flex-wrap gap-2">
          {FOCUSES.map((option) => (
            <Link
              key={option}
              to="."
              search={(prev) => ({ ...prev, focus: option })}
              className={pillVariants({ selected: focus === option })}
            >
              {FOCUS_OPTIONS[option].label}
            </Link>
          ))}
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded bg-surface-subtle">
          <Suspense fallback={<RoutePending />}>
            {view === "map" ? <SupplyChainMap {...viewProps} /> : <SupplyChainGraph {...viewProps} />}
          </Suspense>
        </div>

        <ul className="flex flex-wrap gap-x-5 gap-y-1" aria-label="Legend">
          {SITE_STATUSES.map((status) => (
            <li key={status}>
              <Status tone={STATUS_META[status].tone}>{STATUS_META[status].label}</Status>
            </li>
          ))}
        </ul>
      </section>

      <aside className="w-1/2 min-w-0 overflow-y-auto border-l border-line">
        <Outlet />
      </aside>
    </div>
  );
}
