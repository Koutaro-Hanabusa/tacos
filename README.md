# tacos

TypeScript monorepo for tacos — React frontend + Hono/tRPC backend on Cloudflare Workers.

## Stack

- **TypeScript** — type-safe across the stack
- **TanStack Router** — file-based routing with full type safety
- **TailwindCSS + shadcn/ui** — styling and UI components
- **Hono + tRPC** — lightweight API with end-to-end type safety
- **Cloudflare Workers** — runtime for both web and server apps
- **Drizzle ORM + Cloudflare D1 (SQLite)** — database layer
- **Alchemy** — infrastructure-as-code for Cloudflare resources
- **Turborepo** — monorepo task orchestration
- **Oxlint + Oxfmt** — linting and formatting
- **Husky + lint-staged** — Git hooks

## Getting Started

Install dependencies:

```bash
pnpm install
```

## Database Setup

This project uses Cloudflare D1 (SQLite) with Drizzle ORM. D1 local development and migrations are handled automatically by Alchemy during dev and deploy.

Apply the schema:

```bash
pnpm run db:push
```

Run the development server:

```bash
pnpm run dev
```

- Web: [http://localhost:3001](http://localhost:3001)
- API: [http://localhost:3000](http://localhost:3000)

## Deployment (Cloudflare via Alchemy)

- Dev: `pnpm run dev`
- Deploy: `pnpm run deploy`
- Destroy: `pnpm run destroy`

## Git Hooks and Formatting

- Initialize hooks: `pnpm run prepare`
- Format and lint fix: `pnpm run check`

## Project Structure

```
tacos/
├── apps/
│   ├── web/         # Frontend (React + TanStack Router)
│   └── server/      # Backend (Hono + tRPC on Workers)
└── packages/
    ├── api/         # tRPC routers / business logic
    ├── db/          # Drizzle schema & queries
    ├── env/         # Env var schema (zod)
    ├── config/      # Shared TS config
    └── infra/       # Alchemy (Cloudflare) deployment
```

## Available Scripts

- `pnpm run dev` — start all apps in development mode
- `pnpm run build` — build all apps
- `pnpm run dev:web` — start only the web app
- `pnpm run dev:server` — start only the server
- `pnpm run check-types` — type-check across all packages
- `pnpm run db:push` — push schema changes to the database
- `pnpm run db:generate` — generate migrations
- `pnpm run check` — run Oxlint and Oxfmt
