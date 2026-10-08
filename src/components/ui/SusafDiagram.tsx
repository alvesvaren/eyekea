import { clsx } from "clsx";
import { useId } from "react";
import { Button } from "./Button";
import { Card, CardTitle } from "./Card";

/*
 * The Sustainability Awareness Framework (SusAF) diagram: five dimensions as
 * slices of a pentagon, and three orders of effect as rings growing out from
 * the software in the centre. Effects are placed by dimension and order, and
 * `leadsTo` draws an arrow to each effect it causes. Clicking a card selects it,
 * and `SusafEffectDetails` shows the selected effect's description and links.
 */

/** Dimensions clockwise from the top vertex, so index `i` is the slice between vertex `i` and `i + 1`. */
export const SUSAF_DIMENSIONS = ["individual", "technical", "economic", "environmental", "social"] as const;
/** Orders of effect from the centre outward. */
export const SUSAF_ORDERS = ["immediate", "enabling", "structural"] as const;

export type SusafDimension = (typeof SUSAF_DIMENSIONS)[number];
export type SusafOrder = (typeof SUSAF_ORDERS)[number];

export type SusafEffect = {
  id: string;
  dimension: SusafDimension;
  order: SusafOrder;
  label: string;
  /** Longer text shown when the effect is selected. */
  description?: string;
  /** Ids of the effects this one causes. */
  leadsTo?: string[];
};

type Point = { x: number; y: number };

/** `outer` is the ring's vertex radius; effect cards sit on the pentagon at radius `item`. */
const RINGS = {
  immediate: { outer: 300, item: 205, fillOpacity: 0.12 },
  enabling: { outer: 480, item: 390, fillOpacity: 0.24 },
  structural: { outer: 660, item: 570, fillOpacity: 0.4 },
} satisfies Record<SusafOrder, { outer: number; item: number; fillOpacity: number }>;

const OUTER_RADIUS = RINGS.structural.outer;
const AXIS_OVERSHOOT = 20;
const DIMENSION_LABEL_OFFSET = 45;
const HUB = { rx: 85, ry: 48 };
const CARD = { width: 140, height: 64 };
const ARROW_GAP = 6;
const ARROW_BEND = 0.2;
/** Distance from the centre to the middle of a pentagon edge, as a share of the vertex radius. */
const APOTHEM = Math.cos(Math.PI / 5);

function vertex(index: number, radius: number): Point {
  const angle = ((-90 + 72 * index) * Math.PI) / 180;
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
}

function pentagon(radius: number) {
  return SUSAF_DIMENSIONS.map((_, index) => vertex(index, radius))
    .map(({ x, y }) => `${x},${y}`)
    .join(" ");
}

/** Spreads the effects of one cell evenly along the pentagon edge between the slice's two axes. */
function placeEffects(effects: SusafEffect[]) {
  return effects.map((effect) => {
    const siblings = effects.filter(({ dimension, order }) => dimension === effect.dimension && order === effect.order);
    const t = (siblings.indexOf(effect) + 1) / (siblings.length + 1);
    const slice = SUSAF_DIMENSIONS.indexOf(effect.dimension);
    const { item } = RINGS[effect.order];
    const start = vertex(slice, item);
    const end = vertex(slice + 1, item);
    return { ...effect, x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t };
  });
}

/** Where the line from a card's centre toward `toward` leaves the card, plus a small gap. */
function cardEdge(from: Point, toward: Point): Point {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;
  const scale = Math.min((CARD.width / 2 + ARROW_GAP) / Math.abs(dx), (CARD.height / 2 + ARROW_GAP) / Math.abs(dy));
  return { x: from.x + dx * scale, y: from.y + dy * scale };
}

function arrowPath(from: Point, to: Point) {
  const start = cardEdge(from, to);
  const end = cardEdge(to, from);
  const control = {
    x: (start.x + end.x) / 2 - (end.y - start.y) * ARROW_BEND,
    y: (start.y + end.y) / 2 + (end.x - start.x) * ARROW_BEND,
  };
  return `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;
}

/** Rotates text to run along an edge whose outward normal points at `degrees`, without turning it upside down. */
function uprightAlong(degrees: number) {
  const rotation = ((degrees + 90 + 540) % 360) - 180;
  if (rotation > 90) return rotation - 180;
  if (rotation < -90) return rotation + 180;
  return rotation;
}

/** Selection is controlled, so the caller can keep it in the URL. `undefined` clears it. */
type SusafSelection = {
  selectedId?: string;
  onSelect?: (id: string | undefined) => void;
};

type SusafDiagramProps = SusafSelection & {
  effects: SusafEffect[];
  /** Text in the centre, usually the software's name. */
  subject?: string;
  className?: string;
};

export function SusafDiagram({ effects, subject = "Your software", selectedId, onSelect, className }: SusafDiagramProps) {
  const markerId = useId();
  const activeMarkerId = `${markerId}-active`;
  const placed = placeEffects(effects);
  const byId = new Map(placed.map((effect) => [effect.id, effect]));
  const arrows = placed.flatMap(({ id, leadsTo = [], ...from }) =>
    leadsTo.flatMap((targetId) => {
      const to = byId.get(targetId);
      if (!to || to.id === id) return [];
      const active = id === selectedId || targetId === selectedId;
      return [{ key: `${id}->${targetId}`, d: arrowPath(from, to), active }];
    }),
  );
  const dimensionLabels = SUSAF_DIMENSIONS.map((dimension, slice) => {
    const normal = -54 + 72 * slice;
    const { x, y } = vertex(slice + 0.5, OUTER_RADIUS * APOTHEM + DIMENSION_LABEL_OFFSET);
    return { dimension, x, y, rotation: uprightAlong(normal) };
  });
  // Order labels sit just inside each ring's bottom edge, beside the lower-left axis.
  const orderLabels = SUSAF_ORDERS.map((order) => {
    const y = RINGS[order].outer * APOTHEM - 16;
    const axis = vertex(3, 1);
    return { order, x: (axis.x / axis.y) * y + 12, y };
  });
  const rings = SUSAF_ORDERS.toReversed();
  const view = OUTER_RADIUS + DIMENSION_LABEL_OFFSET + 30;

  return (
    <svg
      viewBox={`${-view} ${-view + 20} ${view * 2} ${view * 2 - 70}`}
      role="group"
      aria-label={`Sustainability Awareness Framework diagram for ${subject}`}
      className={className}
    >
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-emphasised" />
        </marker>
        <marker id={activeMarkerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-primary" />
        </marker>
      </defs>

      {rings.map((order) => (
        <polygon
          key={order}
          points={pentagon(RINGS[order].outer)}
          className="fill-brand-blue"
          fillOpacity={RINGS[order].fillOpacity}
        />
      ))}
      <g className="fill-none stroke-ink" strokeWidth={2} strokeDasharray="8 6">
        {SUSAF_DIMENSIONS.map((dimension, index) => {
          const { x, y } = vertex(index, OUTER_RADIUS + AXIS_OVERSHOOT);
          return <line key={dimension} x1={0} y1={0} x2={x} y2={y} />;
        })}
      </g>

      <ellipse rx={HUB.rx} ry={HUB.ry} className="fill-surface" />
      <text textAnchor="middle" dominantBaseline="middle" className="fill-ink text-[22px] font-bold">
        {subject}
      </text>

      {orderLabels.map(({ order, x, y }) => (
        <text key={order} x={x} y={y} className="fill-ink text-[24px] capitalize">
          {order}
        </text>
      ))}
      {dimensionLabels.map(({ dimension, x, y, rotation }) => (
        <text
          key={dimension}
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`translate(${x} ${y}) rotate(${rotation})`}
          className="fill-ink text-[44px] capitalize"
        >
          {dimension}
        </text>
      ))}

      <g className="fill-none">
        {arrows.map(({ key, d, active }) => (
          <path
            key={key}
            d={d}
            strokeWidth={active ? 4 : 2.5}
            className={active ? "stroke-primary" : "stroke-emphasised"}
            markerEnd={`url(#${active ? activeMarkerId : markerId})`}
          />
        ))}
      </g>
      {placed.map(({ id, label, x, y }) => {
        const selected = id === selectedId;
        return (
          <foreignObject key={id} x={x - CARD.width / 2} y={y - CARD.height / 2} width={CARD.width} height={CARD.height}>
            <button
              type="button"
              title={label}
              aria-pressed={selected}
              onClick={() => onSelect?.(selected ? undefined : id)}
              className={clsx(
                "flex size-full cursor-pointer items-center justify-center rounded-lg px-2 text-center text-[15px] leading-tight text-ink-inverse transition-colors",
                selected ? "bg-primary" : "bg-emphasised hover:bg-emphasised-hover",
              )}
            >
              <span className="line-clamp-3">{label}</span>
            </button>
          </foreignObject>
        );
      })}
    </svg>
  );
}

type SusafEffectDetailsProps = SusafSelection & {
  effects: SusafEffect[];
  className?: string;
};

/** The selected effect's description, plus links to the effects it causes and is caused by. */
export function SusafEffectDetails({ effects, selectedId, onSelect, className }: SusafEffectDetailsProps) {
  const effect = effects.find(({ id }) => id === selectedId);
  if (!effect) {
    return (
      <Card className={className}>
        <p className="text-ink-subtle">Select an effect in the diagram to read more about it.</p>
      </Card>
    );
  }

  const { label, dimension, order, description, leadsTo = [] } = effect;
  const related = [
    { heading: "Leads to", items: effects.filter(({ id }) => leadsTo.includes(id)) },
    { heading: "Caused by", items: effects.filter(({ leadsTo: targets = [] }) => targets.includes(effect.id)) },
  ].filter(({ items }) => items.length > 0);

  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-ink-subtle capitalize">
            {dimension} · {order}
          </span>
          <CardTitle>{label}</CardTitle>
        </div>
        <Button variant="tertiary" size="icon" aria-label="Close" onClick={() => onSelect?.(undefined)}>
          ✕
        </Button>
      </div>
      <p className={description ? "text-ink-subtle" : "text-ink-muted"}>{description ?? "No description yet."}</p>
      {related.map(({ heading, items }) => (
        <div key={heading} className="flex flex-col gap-1">
          <h4 className="text-xs font-bold text-ink-subtle">{heading}</h4>
          {items.map(({ id, label: itemLabel }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelect?.(id)}
              className="cursor-pointer text-left text-emphasised hover:underline"
            >
              {itemLabel}
            </button>
          ))}
        </div>
      ))}
    </Card>
  );
}
