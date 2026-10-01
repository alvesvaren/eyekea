import { notFound } from "@tanstack/react-router";
import { assessSite } from "./assess";
import { supplyChainSchema } from "./schema";

const DATA_URL = "/data/supply-chain.json";

export type AssessedChain = Awaited<ReturnType<typeof fetchSupplyChain>>;
export type AssessedSite = AssessedChain["sites"][number];

let cached: Promise<AssessedChain> | undefined;

/**
 * Fetches, validates and assesses the supply chain once per page load.
 * Swap the fetch for an API call here when there is a backend.
 */
export function loadSupplyChain(): Promise<AssessedChain> {
  cached ??= fetchSupplyChain().catch((error: unknown) => {
    cached = undefined;
    throw error;
  });
  return cached;
}

async function fetchSupplyChain() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`Could not load supply chain data (${response.status})`);
  const { sites, links } = supplyChainSchema.parse(await response.json());
  return { sites: sites.map((site) => ({ ...site, assessment: assessSite(site) })), links };
}

/** Loads one site with its direct suppliers and customers, or throws the router's `notFound`. */
export async function loadSite(siteId: string) {
  const { sites, links } = await loadSupplyChain();
  const site = sites.find(({ id }) => id === siteId);
  if (!site) throw notFound();

  const byId = new Map(sites.map((s) => [s.id, s]));
  const neighbour = (id: string, material: string) => {
    const other = byId.get(id);
    return other ? [{ site: other, material }] : [];
  };

  return {
    site,
    suppliers: links.filter(({ to }) => to === siteId).flatMap(({ from, material }) => neighbour(from, material)),
    customers: links.filter(({ from }) => from === siteId).flatMap(({ to, material }) => neighbour(to, material)),
  };
}
