import { useNavigate } from "@tanstack/react-router";
import type { FeatureCollection, LineString, Point } from "geojson";
import { useState } from "react";
import Map, { Layer, NavigationControl, Popup, Source, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import { STATUS_META, type SiteStatus } from "../../supply-chain/status";
import type { SupplyChainViewProps } from "../types";

/** Free vector tiles, no API key needed. */
const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
const GERMANY_BOUNDS: [[number, number], [number, number]] = [
  [5.87, 47.27],
  [15.04, 55.06],
];
const SITES_LAYER = "sites";
const DIMMED_OPACITY = 0.15;

type Hovered = { name: string; lng: number; lat: number };

/** Theme tokens live in CSS. The map paints on a canvas, so it reads them as values. */
function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function SupplyChainMap({ sites, links, visibleIds, selectedId }: SupplyChainViewProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<Hovered>();

  const byId = new globalThis.Map(sites.map((site) => [site.id, site]));
  const ink = cssVar("--color-ink");
  const lineColor = cssVar("--color-ink-muted");
  const statusColor = (status: SiteStatus) => cssVar(STATUS_META[status].colorVar);

  const siteFeatures: FeatureCollection<Point> = {
    type: "FeatureCollection",
    features: sites.map(({ id, name, location, assessment }) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [location.lng, location.lat] },
      properties: {
        id,
        name,
        color: statusColor(assessment.status),
        opacity: visibleIds.has(id) ? 1 : DIMMED_OPACITY,
        selected: id === selectedId,
      },
    })),
  };

  const linkFeatures: FeatureCollection<LineString> = {
    type: "FeatureCollection",
    features: links.flatMap(({ from, to }) => {
      const source = byId.get(from);
      const target = byId.get(to);
      if (!source || !target) return [];
      return {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [source.location.lng, source.location.lat],
            [target.location.lng, target.location.lat],
          ],
        },
        properties: {
          opacity: visibleIds.has(from) && visibleIds.has(to) ? 0.6 : DIMMED_OPACITY,
          selected: from === selectedId || to === selectedId,
        },
      };
    }),
  };

  const featureAt = (event: MapLayerMouseEvent) => event.features?.[0]?.properties;

  const handleClick = (event: MapLayerMouseEvent) => {
    const id = featureAt(event)?.id;
    if (typeof id === "string") void navigate({ to: "/sites/$siteId", params: { siteId: id } });
  };

  const handleHover = (event: MapLayerMouseEvent) => {
    const name = featureAt(event)?.name;
    setHovered(typeof name === "string" ? { name, ...event.lngLat } : undefined);
  };

  return (
    <Map
      initialViewState={{ bounds: GERMANY_BOUNDS, fitBoundsOptions: { padding: 24 } }}
      mapStyle={MAP_STYLE}
      interactiveLayerIds={[SITES_LAYER]}
      cursor={hovered ? "pointer" : "grab"}
      onClick={handleClick}
      onMouseMove={handleHover}
      onMouseLeave={() => setHovered(undefined)}
    >
      <NavigationControl position="top-right" showCompass={false} />

      <Source id="links" type="geojson" data={linkFeatures}>
        <Layer
          id="links"
          type="line"
          paint={{
            "line-color": ["case", ["get", "selected"], ink, lineColor],
            "line-width": ["case", ["get", "selected"], 3, 1.5],
            "line-opacity": ["get", "opacity"],
          }}
        />
      </Source>

      <Source id={SITES_LAYER} type="geojson" data={siteFeatures}>
        <Layer
          id={SITES_LAYER}
          type="circle"
          paint={{
            "circle-color": ["get", "color"],
            "circle-radius": ["case", ["get", "selected"], 10, 7],
            "circle-stroke-color": ink,
            "circle-stroke-width": ["case", ["get", "selected"], 3, 1],
            "circle-opacity": ["get", "opacity"],
            "circle-stroke-opacity": ["get", "opacity"],
          }}
        />
      </Source>

      {hovered && (
        <Popup longitude={hovered.lng} latitude={hovered.lat} closeButton={false} offset={12}>
          <span className="font-sans text-xs font-bold">{hovered.name}</span>
        </Popup>
      )}
    </Map>
  );
}
