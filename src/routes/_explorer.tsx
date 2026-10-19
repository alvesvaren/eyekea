import { createFileRoute, Link, Outlet, retainSearchParams, stripSearchParams, useParams } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { z } from "zod";
import { RoutePending } from "../components/RouteStates";
import { pillVariants } from "../components/ui/Pill";
import { Status } from "../components/ui/Status";
import { TabList, tabVariants } from "../components/ui/Tabs";
import { PANEL_ID } from "../features/panel";
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
 * On small screens the panel sits under the map instead.
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
    <div className="flex min-w-0 flex-1 flex-col md:flex-row">
      <section className="flex shrink-0 flex-col px-4 pb-3 md:w-2/3 md:min-w-0 md:shrink md:px-6 md:pb-6">
        {/* On small screens the filters scroll sideways in a row under the tabs. */}
        <div className="flex flex-col border-line md:flex-row md:border-b">
          <TabList className="md:border-b-0">
            {VIEW_OPTIONS.map((option) => (
              <Link
                key={option}
                to="."
                search={(prev) => ({ ...prev, view: option })}
                resetScroll={false}
                className={tabVariants({ selected: view === option })}
              >
                {VIEWS[option]}
              </Link>
            ))}
          </TabList>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] *:shrink-0 md:mx-0 md:ml-auto md:min-w-0 md:flex-wrap md:items-center md:justify-end md:py-0 md:pr-0 md:pl-4">
            {FOCUSES.map((option) => (
              <Link
                key={option}
                to="."
                search={(prev) => ({ ...prev, focus: option })}
                resetScroll={false}
                className={pillVariants({ selected: focus === option })}
              >
                {FOCUS_OPTIONS[option].label}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative h-[40dvh] overflow-hidden rounded bg-surface-subtle md:h-auto md:min-h-0 md:flex-1">
          <Suspense fallback={<RoutePending />}>
            {view === "map" ? <SupplyChainMap {...viewProps} /> : <SupplyChainGraph {...viewProps} />}
          </Suspense>
        </div>

        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 md:mt-3 md:gap-x-5" aria-label="Legend">
          {SITE_STATUSES.map((status) => (
            <li key={status}>
              <Status tone={status}>{STATUS_META[status].label}</Status>
            </li>
          ))}
        </ul>
      </section>

      <aside
        id={PANEL_ID}
        className="min-h-0 flex-1 overflow-y-auto border-t border-line md:w-1/3 md:min-w-0 md:flex-none md:border-t-0 md:border-l"
      >
        <Outlet />
      </aside>
    </div>
  );
}
