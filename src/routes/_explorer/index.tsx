import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { Card, CardTitle, StatTile } from "../../components/ui/Card";
import { Status } from "../../components/ui/Status";
import { StatusByTierChart } from "../../features/overview/StatusByTierChart";
import { RISK_LEVELS } from "../../supply-chain/assess";
import { SITE_TYPE_LABELS, STATUS_META } from "../../supply-chain/status";
import { formatNumber, formatPercent } from "../../lib/format";

const explorer = getRouteApi("/_explorer");

export const Route = createFileRoute("/_explorer/")({ component: Overview });

function Overview() {
  const { sites } = explorer.useLoaderData();

  const workers = sites.reduce((sum, { workforce }) => sum + (workforce.headcount ?? 0), 0);
  const unknownHeadcount = sites.filter(({ workforce }) => workforce.headcount === null).length;
  const averageCoverage = sites.reduce((sum, { assessment }) => sum + assessment.coverage, 0) / sites.length;
  const toReview = sites
    .filter(({ assessment }) => assessment.needsReview)
    .sort(
      (a, b) =>
        RISK_LEVELS.indexOf(a.assessment.risk) - RISK_LEVELS.indexOf(b.assessment.risk) ||
        a.assessment.coverage - b.assessment.coverage,
    );

  return (
    <div className="flex flex-col gap-6 py-6 *:mx-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Supply chain overview</h1>
        <p className="text-ink-subtle">
          IKEA's furniture supply chain in Germany, from forest to store. Select a site on the map or in the
          list to see who works there and under what conditions.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile label="Sites mapped" value={sites.length} />
        <StatTile
          label="Workers reported"
          value={formatNumber(workers)}
          hint={unknownHeadcount > 0 ? `${unknownHeadcount} sites not reporting` : undefined}
        />
        <StatTile label="Average data coverage" value={formatPercent(averageCoverage)} />
        <StatTile label="Sites needing review" value={toReview.length} />
      </div>

      <Card>
        <CardTitle>Status by tier</CardTitle>
        <p className="text-xs text-ink-subtle">
          Deeper tiers report less, so more of them show as "not enough data". That is the gap Eyekea is
          meant to close.
        </p>
        <StatusByTierChart sites={sites} />
      </Card>

      <section className="flex flex-col gap-3 mx-0!">
        <h2 className="text-lg font-bold px-6">Needs review</h2>
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {toReview.map(({ id, name, type, location, assessment }) => (
            <li key={id}>
              <Link
                to="/sites/$siteId"
                params={{ siteId: id }}
                className="flex items-center justify-between gap-4 py-3 px-6 hover:bg-surface-subtle"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-bold">{name}</span>
                  <span className="text-xs text-ink-subtle">
                    {SITE_TYPE_LABELS[type]} · {location.city}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1 text-xs">
                  <Status tone={assessment.status}>{STATUS_META[assessment.status].label}</Status>
                  <span className="text-ink-muted">{formatPercent(assessment.coverage)} data</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
