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
- **Vite+** — package management, tasks, build, test, lint, and formatting

## Getting Started

Install dependencies:

```bash
vp install
```

## Database Setup

This project uses Cloudflare D1 (SQLite) with Drizzle ORM. D1 local development and migrations are handled automatically by Alchemy during dev and deploy.

Apply the schema:

```bash
vp run db:push
```

Run the development server:

```bash
vp run dev
```

- Web: [http://localhost:3011](http://localhost:3011)
- API: [http://localhost:3010](http://localhost:3010)
- MCP: [http://localhost:3012/mcp](http://localhost:3012/mcp)

ローカルの `/admin` は Cloudflare Access と `ADMIN_EMAIL` なしで利用できます。

## Deployment (Cloudflare via Alchemy)

- Dev: `pnpm run dev`
- Deploy: `vp run --filter @tacos/infra deploy --stage production`
- Destroy: `vp run destroy`

## Git Hooks and Formatting

- Check format, lint, and types: `vp check`
- Run tests: `vp test`

## Project Structure

```
tacos/
├── apps/
│   ├── web/         # Frontend (React + TanStack Router)
│   ├── server/      # Backend (Hono + tRPC on Workers)
│   └── mcp/         # MCP server (Hono + @hono/mcp on Workers)
└── packages/
    ├── api/         # tRPC routers / business logic / RestaurantApi
    ├── db/          # Drizzle schema & queries
    ├── env/         # Env var schema (zod)
    ├── config/      # Shared TS config
    └── infra/       # Alchemy (Cloudflare) deployment
```

## Available Scripts

- `vp run dev` — start all apps in development mode
- `vp run build` — build all apps
- `vp run dev:web` — start only the web app
- `vp run dev:server` — start only the server
- `vp run dev:mcp` — start only the MCP server (port 3012)
- `vp run check-types` — type-check across all packages
- `vp run db:push` — push schema changes to the database
- `vp run db:generate` — generate migrations
- `vp check` — check formatting, lint, and TypeScript
- `vp test` — run tests
