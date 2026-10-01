# Eyekea

A web app that shows IKEA's supply chain in Germany and flags sites where working conditions are bad or unknown. It is a school prototype for the TEK830 IKEA capstone. All supplier data is fictional.

## Commands

- `pnpm dev` starts the app at http://localhost:5173.
- `pnpm typecheck` runs TypeScript. Run it before every commit.
- `pnpm test` runs Vitest.
- `python3 scripts/generate-mock-data.py` rewrites `public/data/supply-chain.json`. Edit the script, not the JSON.

## Rules

- Follow the skills in `.claude/skills/`: `typescript-best-practices` for all code, and `react-best-practices` for components.
- Add routes as files in `src/routes/`. The router plugin generates `src/routeTree.gen.ts`, so never edit that file.
- Put UI state that someone may want to share, such as the selected site, view, and filters, in the URL as a path param or a Zod-validated search param. Do not keep it in `useState`.
- Navigate with `<Link>` or `useNavigate` and typed `to`, `params`, and `search`, so TypeScript catches broken links.
- Use the colour tokens in `src/styles.css`. Tailwind's default palette is turned off, so `bg-red-500` does not exist.
- Use the components in `src/components/ui/`. When you add a component or a variant, add it to the design page in `src/routes/design.tsx`.
- Put risk rules in `src/supply-chain/assess.ts` and cover each new rule with a test in `assess.test.ts`.
- Keep "high risk" and "missing data" as separate signals. A site must never look healthy because it did not report.
- Update `docs/PROGRESS.md` when you finish or start a feature.
