import { useNavigate } from "@tanstack/react-router";
import { MercatorCoordinate, setWorkerUrl, type ExpressionSpecification, type Map as MapLibre } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import { useState } from "react";
import Map, { Layer, NavigationControl, Popup, Source, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import { SITE_STATUSES, type SiteStatus } from "../../supply-chain/status";
import type { SupplyChainViewProps } from "../types";

// maplibre-gl builds its worker URL at runtime, so Vite never emits the worker. Bundle it here instead.
setWorkerUrl(workerUrl);

/** Free vector tiles, no API key needed. */
const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
const GERMANY_BOUNDS: [[number, number], [number, number]] = [
  [5.87, 47.27],
  [15.04, 55.06],
];
const SITES_LAYER = "sites";
const STORES_LAYER = "stores";
const DIMMED_OPACITY = 0.15;
const IS_STORE: ExpressionSpecification = ["==", ["get", "type"], "store"];
/** Each link is drawn as this many pieces, each wider than the last, so it tapers toward the receiving site. */
const TAPER_STEPS = 12;

type LngLat = { lng: number; lat: number };
type Hovered = LngLat & { name: string };

/** Theme tokens live in CSS. The map paints on a canvas, so it reads them as values. */
function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Splits a line into pieces with a `progress` property running from 0 at the supplier to 1 at the receiver.
 * MapLibre cannot vary width along one line, so the layer widens each piece by its progress instead.
 * Points are spaced in Mercator space so the pieces stay on the straight line the map draws.
 */
function taperedSegments(from: LngLat, to: LngLat, properties: Record<string, unknown>): Feature<LineString>[] {
  const start = MercatorCoordinate.fromLngLat(from);
  const end = MercatorCoordinate.fromLngLat(to);
  const pointAt = (fraction: number) => {
    const { lng, lat } = new MercatorCoordinate(
      start.x + (end.x - start.x) * fraction,
      start.y + (end.y - start.y) * fraction,
    ).toLngLat();
    return [lng, lat];
  };
  return Array.from({ length: TAPER_STEPS }, (_, step) => ({
    type: "Feature",
    geometry: { type: "LineString", coordinates: [pointAt(step / TAPER_STEPS), pointAt((step + 1) / TAPER_STEPS)] },
    properties: { ...properties, progress: (step + 0.5) / TAPER_STEPS },
  }));
}

/** Map image name for the IKEA logo outlined in a status colour. */
const logoImage = (status: SiteStatus) => `ikea-logo-${status}`;

/** Draws the IKEA logo, a yellow oval on blue, inside a border in the site's status colour. */
function drawLogo(outline: string, pixelRatio: number) {
  const width = 44 * pixelRatio;
  const height = 24 * pixelRatio;
  const border = 3 * pixelRatio;
  const context = new OffscreenCanvas(width, height).getContext("2d");
  if (!context) throw new Error("Canvas 2D is not available");

  context.fillStyle = outline;
  context.beginPath();
  context.roundRect(0, 0, width, height, 4 * pixelRatio);
  context.fill();

  context.fillStyle = cssVar("--color-brand-blue");
  context.fillRect(border, border, width - 2 * border, height - 2 * border);

  context.fillStyle = cssVar("--color-brand-yellow");
  context.beginPath();
  context.ellipse(width / 2, height / 2, width / 2 - 2 * border, height / 2 - 1.5 * border, 0, 0, 2 * Math.PI);
  context.fill();

  context.fillStyle = cssVar("--color-brand-blue");
  context.font = `bold ${9 * pixelRatio}px ${cssVar("--font-sans")}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("IKEA", width / 2, height / 2 + 0.5 * pixelRatio);

  return context.getImageData(0, 0, width, height);
}

export default function SupplyChainMap({ sites, links, visibleIds, selectedId }: SupplyChainViewProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<Hovered>();
  const [logosReady, setLogosReady] = useState(false);

  const byId = new globalThis.Map(sites.map((site) => [site.id, site]));
  const ink = cssVar("--color-ink");
  const lineColor = cssVar("--color-ink-muted");
  const surface = cssVar("--color-surface");
  const statusColor = (status: SiteStatus) => cssVar(`--color-risk-${status}`);
  // A white outline keeps fills crisp on the grey basemap. Unknown flips it into a hollow ring.
  const pinPaint = (status: SiteStatus) =>
    status === "unknown" ? { fill: surface, stroke: statusColor(status) } : { fill: statusColor(status), stroke: surface };

  const siteFeatures: FeatureCollection<Point> = {
    type: "FeatureCollection",
    features: sites.map(({ id, name, type, location, assessment }) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [location.lng, location.lat] },
      properties: {
        id,
        name,
        type,
        logo: logoImage(assessment.status),
        ...pinPaint(assessment.status),
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
      return taperedSegments(source.location, target.location, {
        opacity: visibleIds.has(from) && visibleIds.has(to) ? 0.6 : DIMMED_OPACITY,
        selected: from === selectedId || to === selectedId,
      });
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

  const addLogos = (map: MapLibre) => {
    const pixelRatio = window.devicePixelRatio;
    for (const status of SITE_STATUSES) {
      const name = logoImage(status);
      if (!map.hasImage(name)) map.addImage(name, drawLogo(statusColor(status), pixelRatio), { pixelRatio });
    }
    setLogosReady(true);
  };

  return (
    <Map
      initialViewState={{ bounds: GERMANY_BOUNDS, fitBoundsOptions: { padding: 24 } }}
      mapStyle={MAP_STYLE}
      interactiveLayerIds={[SITES_LAYER, STORES_LAYER]}
      onLoad={(event) => addLogos(event.target)}
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
            // Thin at the supplier, thick at the receiver: follow the thick end to reach IKEA.
            "line-width": [
              "case",
              ["get", "selected"],
              ["interpolate", ["linear"], ["get", "progress"], 0, 1.5, 1, 6],
              ["interpolate", ["linear"], ["get", "progress"], 0, 0.5, 1, 4],
            ],
            "line-opacity": ["get", "opacity"],
          }}
        />
      </Source>

      <Source id={SITES_LAYER} type="geojson" data={siteFeatures}>
        <Layer
          id={SITES_LAYER}
          type="circle"
          filter={["!", IS_STORE]}
          paint={{
            "circle-color": ["get", "fill"],
            "circle-radius": ["case", ["get", "selected"], 10, 7],
            "circle-stroke-color": ["case", ["get", "selected"], ink, ["get", "stroke"]],
            "circle-stroke-width": ["case", ["get", "selected"], 3, 2],
            "circle-opacity": ["get", "opacity"],
            "circle-stroke-opacity": ["get", "opacity"],
          }}
        />
        {logosReady && (
          <Layer
            id={STORES_LAYER}
            type="symbol"
            filter={IS_STORE}
            layout={{
              "icon-image": ["get", "logo"],
              "icon-size": ["case", ["get", "selected"], 1.3, 1],
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
            }}
            paint={{ "icon-opacity": ["get", "opacity"] }}
          />
        )}
      </Source>

      {hovered && (
        <Popup longitude={hovered.lng} latitude={hovered.lat} closeButton={false} offset={12}>
          <span className="font-sans text-xs font-bold">{hovered.name}</span>
        </Popup>
      )}
    </Map>
  );
}
