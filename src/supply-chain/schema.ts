import { z } from "zod";

/*
 * The shape of public/data/supply-chain.json. Every measured value is
 * nullable: `null` means "nobody has reported this yet", which Eyekea
 * surfaces as a data gap rather than treating it as good or bad.
 */

export const SITE_TYPES = [
  "forestry",
  "sawmill",
  "materials",
  "components",
  "manufacturer",
  "distribution",
  "store",
] as const;

export const AUDIT_STATUSES = ["approved", "conditional", "failed", "not-audited"] as const;

const ratio = z.number().min(0).max(1);

const siteSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(SITE_TYPES),
  /** Steps away from IKEA: 0 is IKEA's own operation, 1 a direct supplier, 2 its supplier, and so on. */
  tier: z.number().int().min(0),
  description: z.string(),
  location: z.object({
    city: z.string(),
    state: z.string(),
    lat: z.number(),
    lng: z.number(),
  }),
  workforce: z.object({
    headcount: z.number().int().nullable(),
    temporaryShare: ratio.nullable(),
    migrantShare: ratio.nullable(),
    womenShare: ratio.nullable(),
  }),
  conditions: z.object({
    avgWeeklyHours: z.number().nullable(),
    /** Average wage divided by the regional living wage. Below 1 means workers earn less than a living wage. */
    wageToLivingWage: z.number().nullable(),
    /** Recordable injuries per 100 full-time workers per year. */
    injuryRate: z.number().nullable(),
    unionRepresentation: z.boolean().nullable(),
    grievanceMechanism: z.boolean().nullable(),
  }),
  audit: z.object({
    status: z.enum(AUDIT_STATUSES),
    lastAuditDate: z.iso.date().nullable(),
    openFindings: z.number().int().nullable(),
  }),
  certifications: z.array(z.string()),
});

const linkSchema = z.object({
  /** The supplying site. */
  from: z.string(),
  /** The receiving site. */
  to: z.string(),
  material: z.string(),
});

export const supplyChainSchema = z.object({
  sites: z.array(siteSchema),
  links: z.array(linkSchema),
});

export type Site = z.infer<typeof siteSchema>;
export type SiteType = Site["type"];
export type Link = z.infer<typeof linkSchema>;
export type SupplyChain = z.infer<typeof supplyChainSchema>;
