import type { AssessedSite } from "../../supply-chain/load";
import { SITE_STATUSES, STATUS_META } from "../../supply-chain/status";
import { formatPercent } from "../../lib/format";

/** One stacked bar per tier showing how many sites are in each status, plus that tier's data coverage. */
export function StatusByTierChart({ sites }: { sites: AssessedSite[] }) {
  const rows = [...Map.groupBy(sites, ({ tier }) => tier)]
    .sort(([a], [b]) => b - a)
    .map(([tier, tierSites]) => ({
      tier,
      total: tierSites.length,
      coverage: tierSites.reduce((sum, { assessment }) => sum + assessment.coverage, 0) / tierSites.length,
      segments: SITE_STATUSES.map((status) => ({
        status,
        count: tierSites.filter(({ assessment }) => assessment.status === status).length,
      })).filter(({ count }) => count > 0),
    }));

  return (
    <table className="w-full border-separate border-spacing-y-2 text-xs">
      <thead className="text-left text-ink-muted">
        <tr>
          <th className="w-16 font-normal">Tier</th>
          <th className="font-normal">Sites by status</th>
          <th className="w-20 text-right font-normal">Data</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ tier, total, coverage, segments }) => (
          <tr key={tier}>
            <th scope="row" className="text-left font-bold">
              {tier === 0 ? "IKEA" : `Tier ${tier}`}
            </th>
            <td>
              <div className="flex h-5 gap-0.5">
                {segments.map(({ status, count }) => (
                  <div
                    key={status}
                    className="flex items-center justify-center rounded-sm text-ink-inverse"
                    style={{ flexGrow: count, backgroundColor: `var(${STATUS_META[status].colorVar})` }}
                    title={`${STATUS_META[status].label}: ${count} of ${total}`}
                  >
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </td>
            <td className="text-right text-ink-subtle">{formatPercent(coverage)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
