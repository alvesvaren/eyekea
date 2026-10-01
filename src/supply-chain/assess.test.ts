import { describe, expect, it } from "vitest";
import { assessSite } from "./assess";
import type { Site } from "./schema";

const TODAY = new Date("2026-10-01");

function healthySite(): Site {
  return {
    id: "test",
    name: "Test site",
    type: "manufacturer",
    tier: 1,
    description: "",
    location: { city: "Berlin", state: "Berlin", lat: 52.5, lng: 13.4 },
    workforce: { headcount: 100, temporaryShare: 0.1, migrantShare: 0.2, womenShare: 0.4 },
    conditions: {
      avgWeeklyHours: 39,
      wageToLivingWage: 1.4,
      injuryRate: 1.2,
      unionRepresentation: true,
      grievanceMechanism: true,
    },
    audit: { status: "approved", lastAuditDate: "2026-03-01", openFindings: 0 },
    certifications: [],
  };
}

describe("assessSite", () => {
  it("rates a fully reported, healthy site as low risk with full coverage", () => {
    expect(assessSite(healthySite(), TODAY)).toMatchObject({
      risk: "low",
      flags: [],
      missing: [],
      coverage: 1,
      status: "low",
      needsReview: false,
    });
  });

  it("does not treat missing data as low risk evidence, but flags it for review", () => {
    const site = healthySite();
    site.conditions = {
      avgWeeklyHours: null,
      wageToLivingWage: null,
      injuryRate: null,
      unionRepresentation: null,
      grievanceMechanism: null,
    };

    const assessment = assessSite(site, TODAY);

    expect(assessment.risk).toBe("low");
    expect(assessment.status).toBe("unknown");
    expect(assessment.missing).toHaveLength(5);
    expect(assessment.needsReview).toBe(true);
  });

  it("rates the site by its most severe flag and lists that flag first", () => {
    const site = healthySite();
    site.workforce.temporaryShare = 0.5;
    site.conditions.wageToLivingWage = 0.9;

    const { risk, flags } = assessSite(site, TODAY);

    expect(risk).toBe("high");
    expect(flags.map(({ severity }) => severity)).toEqual(["high", "medium"]);
  });

  it("flags hours above the legal cap but not at it", () => {
    const site = healthySite();
    site.conditions.avgWeeklyHours = 48;
    expect(assessSite(site, TODAY).risk).toBe("low");

    site.conditions.avgWeeklyHours = 52;
    expect(assessSite(site, TODAY).risk).toBe("high");
  });

  it("treats a site that was never audited as a data gap, not as risk", () => {
    const site = healthySite();
    site.audit = { status: "not-audited", lastAuditDate: null, openFindings: null };

    const { risk, flags, missing } = assessSite(site, TODAY);

    expect(risk).toBe("low");
    expect(flags).toEqual([]);
    expect(missing).toEqual(["IWAY audit", "Last audit date", "Open audit findings"]);
  });

  it("flags audits older than two years", () => {
    const site = healthySite();
    site.audit.lastAuditDate = "2024-06-01";
    expect(assessSite(site, TODAY).flags).toEqual([
      { severity: "medium", message: "Last audit is more than 24 months old" },
    ]);
  });
});
