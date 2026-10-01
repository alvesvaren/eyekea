import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { buttonVariants } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Status } from "../../components/ui/Status";
import { formatDate, formatNumber, formatPercent } from "../../lib/format";
import { loadSite } from "../../supply-chain/load";
import type { Site } from "../../supply-chain/schema";
import { SITE_TYPE_LABELS, STATUS_META } from "../../supply-chain/status";

export const Route = createFileRoute("/_explorer/sites/$siteId")({
  loader: ({ params }) => loadSite(params.siteId),
  component: SiteDetails,
  notFoundComponent: SiteNotFound,
});

const AUDIT_LABELS = {
  approved: "Approved",
  conditional: "Conditionally approved",
  failed: "Failed",
  "not-audited": "Never audited",
} as const satisfies Record<Site["audit"]["status"], string>;

const yesNo = (value: boolean) => (value ? "Yes" : "No");
const hours = (value: number) => `${value} h/week`;
const ratio = (value: number) => `${value.toFixed(2)}×`;

type Fact = { label: string; value: ReactNode | null };

/** Formats a value that may be unreported. `null` stays `null` so the row shows "Not reported". */
function fact<T>(label: string, value: T | null, format: (value: T) => ReactNode): Fact {
  return { label, value: value === null ? null : format(value) };
}

function SiteDetails() {
  const { site, suppliers, customers } = Route.useLoaderData();
  const { workforce, conditions, audit, assessment } = site;
  const status = STATUS_META[assessment.status];

  const workforceFacts = [
    fact("Headcount", workforce.headcount, formatNumber),
    fact("Temporary contracts", workforce.temporaryShare, formatPercent),
    fact("Migrant workers", workforce.migrantShare, formatPercent),
    fact("Women", workforce.womenShare, formatPercent),
  ];
  const conditionFacts = [
    fact("Average week", conditions.avgWeeklyHours, hours),
    fact("Wage vs. living wage", conditions.wageToLivingWage, ratio),
    fact("Injuries per 100 workers", conditions.injuryRate, String),
    fact("Union representation", conditions.unionRepresentation, yesNo),
    fact("Grievance mechanism", conditions.grievanceMechanism, yesNo),
  ];
  const auditFacts = [
    fact("IWAY status", audit.status, (value) => AUDIT_LABELS[value]),
    fact("Last audit", audit.lastAuditDate, (value) => formatDate(new Date(value))),
    fact("Open findings", audit.openFindings, String),
  ];

  return (
    <article className="flex flex-col gap-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-ink-subtle">
            {SITE_TYPE_LABELS[site.type]} · {site.tier === 0 ? "IKEA" : `Tier ${site.tier}`} · {site.location.city},{" "}
            {site.location.state}
          </span>
          <h1 className="text-2xl font-bold">{site.name}</h1>
          <p className="text-ink-subtle">{site.description}</p>
        </div>
        <Link to="/" aria-label="Close" className={buttonVariants({ variant: "tertiary", size: "icon" })}>
          ✕
        </Link>
      </header>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Status tone={status.tone}>
            <span className="font-bold">{status.label}</span>
          </Status>
          <span className="text-xs text-ink-subtle">{formatPercent(assessment.coverage)} of data reported</span>
        </div>
        {assessment.flags.length > 0 && (
          <ul className="flex flex-col gap-1">
            {assessment.flags.map(({ severity, message }) => (
              <li key={message}>
                <Status tone={STATUS_META[severity].tone}>{message}</Status>
              </li>
            ))}
          </ul>
        )}
        {assessment.missing.length > 0 && (
          <p className="text-xs text-ink-subtle">
            <span className="font-bold">Not reported:</span> {assessment.missing.join(", ")}
          </p>
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <FactList title="Workforce" facts={workforceFacts} />
        <FactList title="Working conditions" facts={conditionFacts} />
        <FactList title="Audit" facts={auditFacts} />
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-bold">Certifications</h2>
          {site.certifications.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {site.certifications.map((certification) => (
                <li key={certification} className="rounded-full bg-surface-subtle px-3 py-1 text-xs font-bold">
                  {certification}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-muted">None reported</p>
          )}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ConnectedSites title="Supplied by" connections={suppliers} empty="No known suppliers. The chain ends here." />
        <ConnectedSites title="Supplies to" connections={customers} empty="Sells directly to customers." />
      </div>
    </article>
  );
}

function FactList({ title, facts }: { title: string; facts: Fact[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-bold">{title}</h2>
      <dl className="flex flex-col divide-y divide-line border-y border-line">
        {facts.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-4 py-2">
            <dt className="text-ink-subtle">{label}</dt>
            <dd className={value === null ? "text-ink-muted italic" : "font-bold"}>{value ?? "Not reported"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

type Connection = Awaited<ReturnType<typeof loadSite>>["suppliers"][number];

function ConnectedSites({ title, connections, empty }: { title: string; connections: Connection[]; empty: string }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-bold">{title}</h2>
      {connections.length === 0 && <p className="text-ink-muted">{empty}</p>}
      <ul className="flex flex-col gap-1">
        {connections.map(({ site, material }) => (
          <li key={`${site.id}-${material}`}>
            <Link
              to="/sites/$siteId"
              params={{ siteId: site.id }}
              className="flex items-center justify-between gap-3 rounded px-2 py-1.5 hover:bg-surface-subtle"
            >
              <Status tone={STATUS_META[site.assessment.status].tone}>
                <span className="font-bold">{site.name}</span>
              </Status>
              <span className="shrink-0 text-xs text-ink-subtle">{material}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SiteNotFound() {
  const { siteId } = Route.useParams();
  return (
    <div className="flex flex-col items-start gap-4 p-6">
      <h1 className="text-xl font-bold">Site not found</h1>
      <p className="text-ink-subtle">There is no site with the id "{siteId}".</p>
      <Link to="/" className={buttonVariants({ variant: "secondary", size: "sm" })}>
        Back to the overview
      </Link>
    </div>
  );
}
