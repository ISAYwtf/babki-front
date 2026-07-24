# Repository Guidelines

## Project Structure & Module Organization

This is a React 19 + TypeScript + Vite finance dashboard using Feature-Sliced Design. Key paths:

- `src/app/`: bootstrap, providers, global styles, and router setup.
- `src/pages/`: TanStack Router file-based routes. Do not edit generated `src/routeTree.gen.ts`.
- `src/widgets/`: dashboard sections composed from lower layers.
- `src/features/`: user-facing interactions, forms, dialogs, and mutations.
- `src/entities/`: domain APIs, TanStack Query options, query keys, and Zod schemas.
- `src/shared/`: reusable UI, assets, styles, utilities, API helpers, and types.

Keep imports flowing downward only: `app -> pages -> widgets -> features -> entities -> shared`.

## Build, Test, and Development Commands

- `npm install` installs locked dependencies.
- `npm run dev` starts the Vite development server.
- `npm run build` runs `tsc -b` and creates a production Vite build.
- `npm run lint` runs ESLint across the repo.
- `npm run lint:fix` applies safe ESLint fixes.
- `npm run preview` serves the production build locally.

No test runner is currently configured.

## Coding Style & Naming Conventions

Use TypeScript, React function components, and the `@/` alias for imports from `src`. ESLint is based on `eslint-config-airbnb-extended`; keep lines at 120 characters or less and use 2-space indentation.

Follow existing naming: kebab-case components such as `plan-details-dialog.tsx`, `*.api.ts` for API classes, `*.query.ts` for query wrappers, and `schemas.ts` for Zod schemas. Shared UI folders use implementation file, `index.parts.ts`, and `index.ts`.

## Testing Guidelines

Because automated tests are not configured, validate changes with:

```bash
npm run lint
npm run build
```

For UI changes, also run `npm run dev` and verify the affected route manually. If adding tests later, colocate them near the feature or entity and document the new command here.

## Commit & Pull Request Guidelines

Git history uses short past-tense commit messages, for example `Added plans widget` or `Updated shadcn`. Keep commits focused and describe the visible change.

Pull requests should include a concise summary, screenshots for UI changes, required environment variables, and validation notes. Link related issues or planning docs when applicable.

## Security & Configuration Tips

Vite environment variables use the `FRONT_` prefix. `FRONT_BASE_API_URL` is required and validated as a URL. Local auth uses `FRONT_USE_LOCAL_AUTH_TOKEN=true` and `FRONT_LOCAL_AUTH_TOKEN=<token>`; do not commit real tokens or private API URLs.
