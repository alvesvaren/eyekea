import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { z } from "zod";
import { RouteNotFound, RoutePending } from "../components/RouteStates";
import { Button, buttonVariants } from "../components/ui/Button";
import { Card, CardTitle, StatTile } from "../components/ui/Card";
import { pillVariants } from "../components/ui/Pill";
import { Status } from "../components/ui/Status";
import { TabList, tabVariants } from "../components/ui/Tabs";

/*
 * A living style guide: every UI component in every variant and state.
 * Add new components here when you create them, so the team can see what exists.
 */

const DEMO_TABS = ["details", "suppliers", "history"] as const;

export const Route = createFileRoute("/design")({
  validateSearch: z.object({ tab: z.enum(DEMO_TABS).default("details").catch("details") }),
  component: DesignSystem,
});

const COLOUR_GROUPS = {
  Text: ["ink", "ink-subtle", "ink-muted", "ink-disabled"],
  Surfaces: ["surface", "surface-subtle", "surface-pressed", "line", "line-strong", "disabled"],
  Interactive: ["primary", "primary-hover", "emphasised", "emphasised-hover", "destructive", "destructive-hover"],
  Brand: ["brand-blue", "brand-yellow", "sustainability"],
  Semantic: ["positive", "caution", "caution-text", "negative", "informative"],
};

const BUTTON_VARIANTS = ["primary", "emphasised", "secondary", "tertiary", "destructive"] as const;

function DesignSystem() {
  const { tab } = Route.useSearch();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Design system</h1>
          <p className="max-w-2xl text-ink-subtle">
            Components styled after IKEA's Skapa design system. Colours are Skapa's tokens from ikea.com, defined in{" "}
            <code>src/styles.css</code>. Hover and click the components to see their interactive states.
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
            <Status tone="positive">Positive</Status>
            <Status tone="caution">Caution</Status>
            <Status tone="negative">Negative</Status>
            <Status tone="informative">Informative</Status>
            <Status tone="neutral">Neutral</Status>
          </div>
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
