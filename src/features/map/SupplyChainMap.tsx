import { useNavigate } from "@tanstack/react-router";
import { MercatorCoordinate, setWorkerUrl, type ExpressionSpecification, type Map as MapLibre } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import { useState } from "react";
import Map, { Layer, NavigationControl, Popup, Source, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import { FACE_CENTER, FACE_PATHS, FACE_RADIUS, FACE_SIZE, FACE_STROKE, isHollow } from "../../components/ui/statusFace";
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
const SELECTED_LAYER = "selected-site";
const STORES_LAYER = "stores";
const ARROW_IMAGE = "link-arrow";
const DIMMED_OPACITY = 0.15;
const SELECTED_FACE_SCALE = 1.3;
const IS_STORE: ExpressionSpecification = ["==", ["get", "type"], "store"];

type LngLat = { lng: number; lat: number };
type Hovered = LngLat & { name: string };

/** Theme tokens live in CSS. The map paints on a canvas, so it reads them as values. */
function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Places an arrowhead halfway along a link, pointing from the supplier to the receiver.
 * The midpoint and angle are taken in Mercator space so the arrow sits on the straight line the map draws.
 * The ends would hide under the site pins, so the arrow goes in the middle.
 */
function arrowAt(from: LngLat, to: LngLat, properties: Record<string, unknown>): Feature<Point> {
  const start = MercatorCoordinate.fromLngLat(from);
  const end = MercatorCoordinate.fromLngLat(to);
  const { lng, lat } = new MercatorCoordinate((start.x + end.x) / 2, (start.y + end.y) / 2).toLngLat();
  // Mercator y grows southward, so flip it to get degrees clockwise from north.
  const bearing = (Math.atan2(end.x - start.x, start.y - end.y) * 180) / Math.PI;
  return { type: "Feature", geometry: { type: "Point", coordinates: [lng, lat] }, properties: { ...properties, bearing } };
}

/** Draws a filled arrowhead pointing up, so `icon-rotate` can turn it to the link's bearing. */
function drawArrow(color: string, pixelRatio: number) {
  const size = 12 * pixelRatio;
  const context = new OffscreenCanvas(size, size).getContext("2d");
  if (!context) throw new Error("Canvas 2D is not available");

  context.fillStyle = color;
  context.beginPath();
  context.moveTo(size / 2, 0);
  context.lineTo(size, size);
  context.lineTo(size / 2, size * 0.7);
  context.lineTo(0, size);
  context.closePath();
  context.fill();

  return context.getImageData(0, 0, size, size);
}

/** Map image names for a site's status face and for a store's IKEA logo with that face. */
const faceImage = (status: SiteStatus) => `face-${status}`;
const logoImage = (status: SiteStatus) => `ikea-logo-${status}`;

/** White ring around each face so it stays crisp on the grey basemap, in CSS pixels. */
const FACE_HALO = 2;
const FACE_IMAGE_SIZE = FACE_SIZE + 2 * FACE_HALO;

function canvas2d(width: number, height: number) {
  const context = new OffscreenCanvas(width, height).getContext("2d");
  if (!context) throw new Error("Canvas 2D is not available");
  return context;
}

/** Paints the `StatusFace` for a status, with its halo, at (x, y) in CSS pixels. */
function paintFace(context: OffscreenCanvasRenderingContext2D, status: SiteStatus, x: number, y: number) {
  const color = cssVar(`--color-risk-${status}`);
  const surface = cssVar("--color-surface");
  const hollow = isHollow(status);
  context.save();
  context.translate(x + FACE_HALO, y + FACE_HALO);

  context.fillStyle = surface;
  context.beginPath();
  context.arc(FACE_CENTER, FACE_CENTER, FACE_RADIUS + FACE_HALO, 0, 2 * Math.PI);
  context.fill();

  context.fillStyle = hollow ? surface : color;
  context.strokeStyle = hollow ? color : cssVar("--color-black");
  context.lineWidth = FACE_STROKE;
  context.lineCap = "round";
  context.beginPath();
  context.arc(FACE_CENTER, FACE_CENTER, FACE_RADIUS, 0, 2 * Math.PI);
  context.fill();
  if (hollow) context.stroke();
  context.stroke(new Path2D(FACE_PATHS[status]));
  context.restore();
}

function drawFace(status: SiteStatus, pixelRatio: number) {
  const size = FACE_IMAGE_SIZE * pixelRatio;
  const context = canvas2d(size, size);
  context.scale(pixelRatio, pixelRatio);
  paintFace(context, status, 0, 0);
  return context.getImageData(0, 0, size, size);
}

/**
 * Draws the IKEA logo, a yellow oval on blue, inside a border in the site's status colour, with the
 * status face over its top-right corner so the level does not rest on the border colour alone.
 */
function drawLogo(status: SiteStatus, pixelRatio: number) {
  const width = 44;
  const height = 24;
  const border = 3;
  const faceOffset = FACE_IMAGE_SIZE / 2;
  const context = canvas2d((width + faceOffset) * pixelRatio, (height + faceOffset) * pixelRatio);
  context.scale(pixelRatio, pixelRatio);
  context.translate(0, faceOffset);

  context.fillStyle = cssVar(`--color-risk-${status}`);
  context.beginPath();
  context.roundRect(0, 0, width, height, 4);
  context.fill();

  context.fillStyle = cssVar("--color-brand-blue");
  context.fillRect(border, border, width - 2 * border, height - 2 * border);

  context.fillStyle = cssVar("--color-brand-yellow");
  context.beginPath();
  context.ellipse(width / 2, height / 2, width / 2 - 2 * border, height / 2 - 1.5 * border, 0, 0, 2 * Math.PI);
  context.fill();

  context.fillStyle = cssVar("--color-brand-blue");
  context.font = `bold 9px ${cssVar("--font-sans")}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("IKEA", width / 2, height / 2 + 0.5);

  paintFace(context, status, width - faceOffset, -faceOffset);
  return context.getImageData(0, 0, context.canvas.width, context.canvas.height);
}

export default function SupplyChainMap({ sites, links, visibleIds, selectedId }: SupplyChainViewProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<Hovered>();
  const [imagesReady, setImagesReady] = useState(false);

  const byId = new globalThis.Map(sites.map((site) => [site.id, site]));
  const ink = cssVar("--color-ink");
  const lineColor = cssVar("--color-ink-muted");

  const siteFeatures: FeatureCollection<Point> = {
    type: "FeatureCollection",
    features: sites.map(({ id, name, type, location, assessment }) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [location.lng, location.lat] },
      properties: {
        id,
        name,
        type,
        face: faceImage(assessment.status),
        logo: logoImage(assessment.status),
        opacity: visibleIds.has(id) ? 1 : DIMMED_OPACITY,
        selected: id === selectedId,
      },
    })),
  };

  const drawnLinks = links.flatMap(({ from, to }) => {
    const source = byId.get(from);
    const target = byId.get(to);
    if (!source || !target) return [];
    const properties = {
      opacity: visibleIds.has(from) && visibleIds.has(to) ? 0.6 : DIMMED_OPACITY,
      selected: from === selectedId || to === selectedId,
    };
    return [{ from: source.location, to: target.location, properties }];
  });

  const linkFeatures: FeatureCollection<LineString> = {
    type: "FeatureCollection",
    features: drawnLinks.map(({ from, to, properties }) => ({
      type: "Feature",
      geometry: { type: "LineString", coordinates: [[from.lng, from.lat], [to.lng, to.lat]] },
      properties,
    })),
  };

  const arrowFeatures: FeatureCollection<Point> = {
    type: "FeatureCollection",
    // Only the selected site's links get arrows, so the map stays calm until someone picks a site.
    features: drawnLinks
      .filter(({ properties }) => properties.selected)
      .map(({ from, to, properties }) => arrowAt(from, to, properties)),
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

  const addImages = (map: MapLibre) => {
    const pixelRatio = window.devicePixelRatio;
    const images: [string, ImageData][] = [
      ...SITE_STATUSES.flatMap((status): [string, ImageData][] => [
        [faceImage(status), drawFace(status, pixelRatio)],
        [logoImage(status), drawLogo(status, pixelRatio)],
      ]),
      [ARROW_IMAGE, drawArrow(ink, pixelRatio)],
    ];
    for (const [name, image] of images) {
      if (!map.hasImage(name)) map.addImage(name, image, { pixelRatio });
    }
    setImagesReady(true);
  };

  return (
    <Map
      initialViewState={{ bounds: GERMANY_BOUNDS, fitBoundsOptions: { padding: 24 } }}
      mapStyle={MAP_STYLE}
      interactiveLayerIds={[SITES_LAYER, STORES_LAYER]}
      onLoad={(event) => addImages(event.target)}
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

      {/* Arrows point from supplier to receiver: follow them to reach IKEA. */}
      <Source id="link-arrows" type="geojson" data={arrowFeatures}>
        {imagesReady && (
          <Layer
            id="link-arrows"
            type="symbol"
            beforeId={SELECTED_LAYER}
            layout={{
              "icon-image": ARROW_IMAGE,
              "icon-size": 1.2,
              "icon-rotate": ["get", "bearing"],
              "icon-rotation-alignment": "map",
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
            }}
            paint={{ "icon-opacity": ["get", "opacity"] }}
          />
        )}
      </Source>

      <Source id={SITES_LAYER} type="geojson" data={siteFeatures}>
        {/* A black ring under the selected face, drawn as a circle so it scales with the face. */}
        <Layer
          id={SELECTED_LAYER}
          type="circle"
          filter={["all", ["!", IS_STORE], ["get", "selected"]]}
          paint={{ "circle-color": ink, "circle-radius": (FACE_IMAGE_SIZE * SELECTED_FACE_SCALE) / 2 + 2 }}
        />
        {imagesReady && (
          <Layer
            id={SITES_LAYER}
            type="symbol"
            filter={["!", IS_STORE]}
            layout={{
              "icon-image": ["get", "face"],
              "icon-size": ["case", ["get", "selected"], SELECTED_FACE_SCALE, 1],
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
            }}
            paint={{ "icon-opacity": ["get", "opacity"] }}
          />
        )}
        {imagesReady && (
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
