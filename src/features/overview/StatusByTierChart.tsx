import { clsx } from "clsx";
import type { AssessedSite } from "../../supply-chain/load";
import { SITE_STATUSES, STATUS_META, type SiteStatus } from "../../supply-chain/status";
import { formatPercent } from "../../lib/format";

/** Unknown is hatched rather than filled, so a tier with gaps never reads as a risk level. */
const SEGMENT_CLASSES = {
  high: "bg-risk-high text-ink",
  medium: "bg-risk-medium text-ink",
  low: "bg-risk-low text-ink",
  unknown:
    "bg-[repeating-linear-gradient(135deg,var(--color-surface)_0_4px,var(--color-line)_4px_7px)] text-ink-subtle inset-ring inset-ring-line-strong",
} as const satisfies Record<SiteStatus, string>;

/** One stacked bar per tier showing how many sites are in each status, plus that tier's data coverage. */
export function StatusByTierChart({ sites }: { sites: AssessedSite[] }) {
  const rows = [...Map.groupBy(sites, ({ tier }) => tier)]
    .sort(([a], [b]) => a - b)
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
    <table className="w-full border-separate border-spacing-y-1 text-xs">
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
              <div className="flex h-5 gap-px">
                {segments.map(({ status, count }) => (
                  <div
                    key={status}
                    className={clsx(
                      "flex items-center justify-center first:rounded-l-sm last:rounded-r-sm",
                      SEGMENT_CLASSES[status],
                    )}
                    style={{ flexGrow: count }}
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
