import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { z } from "zod";
import { RouteNotFound, RoutePending } from "../components/RouteStates";
import { Accordion, AccordionItem } from "../components/ui/Accordion";
import { Button, buttonVariants } from "../components/ui/Button";
import { Card, CardTitle, StatTile } from "../components/ui/Card";
import { pillVariants } from "../components/ui/Pill";
import { Status } from "../components/ui/Status";
import { SusafDiagram, SusafEffectDetails, type SusafEffect } from "../components/ui/SusafDiagram";
import { TabList, tabVariants } from "../components/ui/Tabs";
import { SITE_STATUSES, STATUS_META } from "../supply-chain/status";

/*
 * A living style guide: every UI component in every variant and state.
 * Add new components here when you create them, so the team can see what exists.
 */

const DEMO_TABS = ["details", "suppliers", "history"] as const;

export const Route = createFileRoute("/design")({
  validateSearch: z.object({
    tab: z.enum(DEMO_TABS).default("details").catch("details"),
    effect: z.string().optional().catch(undefined),
  }),
  component: DesignSystem,
});

const COLOUR_GROUPS = {
  Text: ["ink", "ink-subtle", "ink-muted", "ink-disabled"],
  Surfaces: ["surface", "surface-subtle", "surface-pressed", "line", "line-strong", "disabled"],
  Interactive: ["primary", "primary-hover", "emphasised", "emphasised-hover", "destructive", "destructive-hover"],
  Brand: ["brand-blue", "brand-yellow", "sustainability"],
  Semantic: ["positive", "caution", "caution-text", "negative", "informative"],
  Risk: ["risk-high", "risk-medium", "risk-low", "risk-unknown"],
};

const DEMO_SUSAF_EFFECTS: SusafEffect[] = [
  { id: "a", dimension: "social", order: "immediate", label: "Immediate effect", description: "Click a card to select it. The URL keeps the selection.", leadsTo: ["b"] },
  { id: "b", dimension: "economic", order: "enabling", label: "Enabling effect", leadsTo: ["c"] },
  { id: "c", dimension: "environmental", order: "structural", label: "Structural effect" },
  { id: "d", dimension: "technical", order: "structural", label: "Two effects share a cell" },
  { id: "e", dimension: "technical", order: "structural", label: "and are spread along it" },
];

const BUTTON_VARIANTS = ["primary", "emphasised", "secondary", "tertiary", "destructive"] as const;

function DesignSystem() {
  const { tab, effect } = Route.useSearch();
  const navigate = Route.useNavigate();
  const selectEffect = (id: string | undefined) =>
    navigate({ search: (prev) => ({ ...prev, effect: id }), resetScroll: false });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Design system</h1>
          <p className="max-w-2xl text-ink-subtle">
            Components styled after IKEA's Skapa design system. Colours are Skapa's tokens from ikea.com, except the risk scale, and are
            defined in <code>src/styles.css</code>. Hover and click the components to see their interactive states.
          </p>
        </header>

        <Section title="Colours">
          {Object.entries(COLOUR_GROUPS).map(([group, tokens]) => (
            <div key={group} className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-ink-subtle">{group}</h3>
              <div className="flex flex-wrap gap-3">
                {tokens.map((token) => (
                  <div key={token} className="flex w-28 flex-col gap-1">
                    <div className="h-14 rounded border border-line" style={{ backgroundColor: `var(--color-${token})` }} />
                    <code className="text-xs">{token}</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>

        <Section title="Typography">
          <p className="text-3xl font-bold">Heading 1 · text-3xl bold</p>
          <p className="text-2xl font-bold">Heading 2 · text-2xl bold</p>
          <p className="text-lg font-bold">Heading 3 · text-lg bold</p>
          <p className="text-sm">Body · text-sm. The quick brown fox jumps over the lazy dog.</p>
          <p className="text-xs text-ink-subtle">Caption · text-xs ink-subtle</p>
        </Section>

        <Section title="Buttons">
          {(["md", "sm"] as const).map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-3">
              {BUTTON_VARIANTS.map((variant) => (
                <Button key={variant} variant={variant} size={size}>
                  {variant}
                </Button>
              ))}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            {BUTTON_VARIANTS.map((variant) => (
              <Button key={variant} variant={variant} size="sm" disabled>
                disabled
              </Button>
            ))}
            <Button variant="tertiary" size="icon" aria-label="Close">
              ✕
            </Button>
          </div>
          <p className="text-xs text-ink-subtle">
            For navigation, put <code>buttonVariants()</code> on a router <code>&lt;Link&gt;</code>:{" "}
            <Link to="/" className={buttonVariants({ variant: "secondary", size: "sm" })}>
              Go to the map
            </Link>
          </p>
        </Section>

        <Section title="Tabs">
          <p className="text-xs text-ink-subtle">
            Tabs are links, so the selected tab lives in the URL (<code>?tab={tab}</code>).
          </p>
          <TabList>
            {DEMO_TABS.map((option) => (
              <Link
                key={option}
                to="/design"
                search={{ tab: option }}
                resetScroll={false}
                className={tabVariants({ selected: tab === option })}
              >
                {option}
              </Link>
            ))}
          </TabList>
        </Section>

        <Section title="Pills">
          <div className="flex flex-wrap gap-2">
            <span className={pillVariants({ selected: true })}>Selected</span>
            <span className={pillVariants({ selected: false })}>Not selected</span>
          </div>
        </Section>

        <Section title="Status">
          <div className="flex flex-wrap gap-6">
            {SITE_STATUSES.map((status) => (
              <Status key={status} tone={status}>
                {STATUS_META[status].label}
              </Status>
            ))}
          </div>
          <p className="text-xs text-ink-subtle">
            Risk uses its own <code>risk-*</code> colours, not Skapa's semantic ones, so the levels stay apart on the map
            and for colour-blind viewers. Each level also has its own face (smile, flat, frown), so it reads without colour.
            Not enough data is a hollow ring with a question mark, so it never looks like a risk level.
          </p>
        </Section>

        <Section title="Cards and stats">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile label="Sites mapped" value={30} />
            <StatTile label="Workers reported" value="7,301" hint="5 sites not reporting" />
          </div>
          <Card>
            <CardTitle>Card title</CardTitle>
            <p className="text-ink-subtle">Cards group related content on a subtle grey surface.</p>
          </Card>
        </Section>

        <Section title="Accordion">
          <p className="text-xs text-ink-subtle">
            Built on native <code>details</code>, so open rows need no state. Pass <code>open</code> to start a row expanded.
          </p>
          <Accordion>
            <AccordionItem title="Accordion item" hint="Optional hint under the title" open>
              <p className="text-ink-subtle">Content shows when the row is open.</p>
            </AccordionItem>
            <AccordionItem title="Closed item">
              <p className="text-ink-subtle">Click the row to open it.</p>
            </AccordionItem>
          </Accordion>
        </Section>

        <Section title="SusAF diagram">
          <p className="text-xs text-ink-subtle">
            The Sustainability Awareness Framework. Pass a list of effects, each with a dimension, an order of effect, and
            optional <code>leadsTo</code> ids that draw arrows between them. Clicking a card selects it, and{" "}
            <code>SusafEffectDetails</code> shows its <code>description</code>. Keep the selection in the URL.
          </p>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <SusafDiagram
              effects={DEMO_SUSAF_EFFECTS}
              selectedId={effect}
              onSelect={selectEffect}
              className="w-full max-w-xl min-w-0 flex-1"
            />
            <SusafEffectDetails effects={DEMO_SUSAF_EFFECTS} selectedId={effect} onSelect={selectEffect} className="lg:w-72 lg:shrink-0" />
          </div>
        </Section>

        <Section title="Route states">
          <p className="text-xs text-ink-subtle">
            Shown automatically by the router while loading, and when a page is missing.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <Preview>
              <RoutePending />
            </Preview>
            <Preview>
              <RouteNotFound />
            </Preview>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-line pb-2 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Preview({ children }: { children: ReactNode }) {
  return <div className="h-48 overflow-hidden rounded border border-line">{children}</div>;
}
