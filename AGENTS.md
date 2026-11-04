# AGENTS.md

## Commands

- `npm run dev` — Vite dev server with HMR
- `npm run server` — json-server (v1) on `http://localhost:3000` using `db.json`
- `npm run build` — type-checks (`tsc -b`) then bundles with Vite
- `npm run lint` — ESLint (flat config, no type-aware rules)
- There is no test runner or test suite; verify changes with `npm run lint && npm run build`.

## Architecture

- Entry: `src/main.tsx` → `BrowserRouter` wraps both `RoutesConfig` (the route table) and `App` (just an `<Outlet/>`). Add routes in `src/RoutesConfig.tsx`.
- `src/pages/` — page components, re-exported from the barrel `src/pages/index.ts`.
- `src/shared/ui/` — shared components (Button, Input, Modal, MultiSelect, Textarea), re-exported from `src/shared/index.tsx`. Component styles use CSS Modules (`*.module.css`).
- `src/api/` — `client.ts` (fetch wrapper with zod response validation) and `todoApi.ts` (request building + TanStack Query keys). List filters are translated to json-server v1 query params: `_where` for filtering, `_sort` for sorting (`field` = asc, `-field` = desc). Sorting is server-side: `useTodoList` only keeps the `SortState` UI value and includes it in the query params/key — do not re-sort fetched data with `sortItems`.
- `src/shared/lib/sort.ts` — `SortState` / `getNextSort` describe table sort state only (asc → desc → none).

## TypeScript constraints (`tsconfig.app.json` — the build fails if violated)

- `verbatimModuleSyntax: true` — use `import type` for type-only imports.
- `erasableSyntaxOnly: true` — no enums, namespaces, or constructor parameter properties.
- `noUnusedLocals` / `noUnusedParameters` — no unused code.

## Lint constraints (`eslint.config.js`)

- `react-refresh/only-export-components` is an error: files containing components may export ONLY components. Barrel files are exempted individually in the config (`src/pages/index.ts`, `src/shared/index.tsx`) — add any new barrel file to that override instead of disabling the rule globally.
