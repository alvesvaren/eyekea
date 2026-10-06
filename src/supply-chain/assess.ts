import type { Site } from "./schema";

/*
 * Turns a site's reported data into two independent signals:
 * - risk: how bad the *known* numbers look
 * - coverage: how much of the data is known at all
 * Keeping them separate means a site cannot look healthy by not reporting.
 */

export const RISK_LEVELS = ["unknown", "high", "medium", "low"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];
type Severity = Exclude<RiskLevel, "low">;

/** EU Working Time Directive cap on average weekly hours. */
export const MAX_WEEKLY_HOURS = 48;
export const LIVING_WAGE_MARGIN = 1.1;
export const INJURY_RATE_CAUTION = 3.5;
export const INJURY_RATE_HIGH = 6;
export const TEMPORARY_SHARE_CAUTION = 0.3;
export const AUDIT_MAX_AGE_MONTHS = 24;
/** Below this share of reported fields, a site is flagged for review regardless of risk. */
export const COVERAGE_REVIEW_THRESHOLD = 0.7;

/**
 * Every reported field, with the label shown when it is missing.
 * "Never audited" counts as missing data, not as risk: nobody has looked yet.
 */
const MEASURED_FIELDS: { label: string; read: (site: Site) => unknown }[] = [
  { label: "Headcount", read: (s) => s.workforce.headcount },
  { label: "Share of temporary contracts", read: (s) => s.workforce.temporaryShare },
  { label: "Share of migrant workers", read: (s) => s.workforce.migrantShare },
  { label: "Share of women", read: (s) => s.workforce.womenShare },
  { label: "Average weekly hours", read: (s) => s.conditions.avgWeeklyHours },
  { label: "Wage vs. living wage", read: (s) => s.conditions.wageToLivingWage },
  { label: "Injury rate", read: (s) => s.conditions.injuryRate },
  { label: "Union representation", read: (s) => s.conditions.unionRepresentation },
  { label: "Grievance mechanism", read: (s) => s.conditions.grievanceMechanism },
  { label: "IWAY audit", read: (s) => (s.audit.status === "not-audited" ? null : s.audit.status) },
  { label: "Last audit date", read: (s) => s.audit.lastAuditDate },
  { label: "Open audit findings", read: (s) => s.audit.openFindings },
];

export type RiskFlag = { severity: Severity; message: string };

type Rule = (site: Site, today: Date) => RiskFlag | undefined;

const flag = (severity: Severity, message: string): RiskFlag => ({ severity, message });

const RULES: Rule[] = [
  ({ conditions: { avgWeeklyHours: hours } }) =>
    hours !== null && hours > MAX_WEEKLY_HOURS
      ? flag("high", `Average week of ${hours} h exceeds the ${MAX_WEEKLY_HOURS} h legal cap`)
      : undefined,
  ({ conditions: { wageToLivingWage: wage } }) => {
    if (wage === null || wage >= LIVING_WAGE_MARGIN) return undefined;
    return wage < 1 ? flag("high", "Wages are below a living wage") : flag("medium", "Wages are barely above a living wage");
  },
  ({ conditions: { injuryRate } }) => {
    if (injuryRate === null || injuryRate <= INJURY_RATE_CAUTION) return undefined;
    return flag(injuryRate > INJURY_RATE_HIGH ? "high" : "medium", `${injuryRate} injuries per 100 workers per year`);
  },
  ({ workforce: { temporaryShare } }) =>
    temporaryShare !== null && temporaryShare > TEMPORARY_SHARE_CAUTION
      ? flag("medium", "High share of temporary contracts")
      : undefined,
  ({ conditions }) =>
    conditions.unionRepresentation === false ? flag("medium", "No union or worker representation") : undefined,
  ({ conditions }) =>
    conditions.grievanceMechanism === false ? flag("medium", "No way for workers to raise grievances") : undefined,
  ({ audit: { status } }) => {
    const byStatus = {
      failed: flag("high", "Failed its latest IWAY audit"),
      conditional: flag("medium", "Conditionally approved in its latest IWAY audit"),
      "not-audited": undefined,
      approved: undefined,
    } satisfies Record<Site["audit"]["status"], RiskFlag | undefined>;
    return byStatus[status];
  },
  ({ audit: { lastAuditDate } }, today) =>
    lastAuditDate !== null && monthsBetween(new Date(lastAuditDate), today) > AUDIT_MAX_AGE_MONTHS
      ? flag("medium", `Last audit is more than ${AUDIT_MAX_AGE_MONTHS} months old`)
      : undefined,
  ({ audit: { openFindings } }) =>
    openFindings !== null && openFindings > 0
      ? flag("medium", `${openFindings} open audit finding${openFindings === 1 ? "" : "s"}`)
      : undefined,
];

function monthsBetween(from: Date, to: Date) {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

export type Assessment = ReturnType<typeof assessSite>;

export function assessSite(site: Site, today = new Date()) {
  const flags = RULES.flatMap((rule) => rule(site, today) ?? []).sort(
    (a, b) => RISK_LEVELS.indexOf(a.severity) - RISK_LEVELS.indexOf(b.severity),
  );
  const missing = MEASURED_FIELDS.filter(({ read }) => read(site) === null).map(({ label }) => label);
  const coverage = 1 - missing.length / MEASURED_FIELDS.length;
  const risk: RiskLevel = flags[0]?.severity ?? "low";
  const lacksData = coverage < COVERAGE_REVIEW_THRESHOLD;

  return {
    risk,
    flags,
    missing,
    coverage,
    /** What the site is shown as: "low" is only claimed when enough data backs it up. */
    status: risk === "low" && lacksData ? ("unknown" as const) : risk,
    needsReview: risk !== "low" || lacksData,
  };
}
