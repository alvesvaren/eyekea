import type { AssessedSite } from "../supply-chain/load";
import type { Link } from "../supply-chain/schema";

/** What the map and graph views both render. */
export type SupplyChainViewProps = {
  sites: AssessedSite[];
  links: Link[];
  /** Sites matching the active focus filter. The rest are dimmed. */
  visibleIds: Set<string>;
  selectedId: string | undefined;
};
