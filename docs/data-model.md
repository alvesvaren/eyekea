# Data model

The app loads `public/data/supply-chain.json`. The Zod schema in `src/supply-chain/schema.ts` defines the shape and rejects invalid data at load. To change the data, edit `scripts/generate-mock-data.py` and run it.

## Site

A site is a place that is part of the chain: a forest, a factory, a warehouse, or a store.

| Field | Meaning |
| --- | --- |
| `id` | Stable id, used in the URL. |
| `type` | One of `forestry`, `sawmill`, `materials`, `components`, `manufacturer`, `distribution`, `store`. |
| `tier` | Number of steps to IKEA. IKEA's own sites are 0 and direct suppliers are 1. The script computes it from the links. |
| `location` | City, state, latitude, and longitude. |
| `workforce` | Headcount and the shares of temporary contracts, migrant workers, and women. Shares are between 0 and 1. |
| `conditions` | Average weekly hours, wage divided by the regional living wage, injuries per 100 workers per year, union representation, and whether workers can raise grievances. |
| `audit` | IWAY audit status, the date of the last audit, and the number of open findings. |
| `certifications` | Names such as `FSC Chain of Custody` or `ISO 45001`. |

Every measured value can be `null`. `null` means the site has not reported the value. The app shows it as **Not reported** and counts it against the site's data coverage.

## Link

A link means goods flow `from` a supplier `to` a receiving site. `material` says what flows, such as `Particleboard`.

## Assessment

`src/supply-chain/assess.ts` derives two separate signals from each site:

- **Risk** comes from rules on the known values. For example, more than 48 hours a week is high risk. Each broken rule adds a flag, and the most severe flag sets the risk.
- **Coverage** is the share of measured fields that are reported. A site that was never audited counts as missing audit data, not as risk.

The status shown on the map combines both. A site with low risk and coverage under 70% shows as **Not enough data**, because nothing backs up the low risk.
