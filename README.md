# GymApp — Gym & Fitness Management Platform

Multi-tenant SaaS for the North Macedonian fitness market: an admin/manager web platform, a member mobile app, and a NestJS backend with native fiscal-device compliance.

> **Planning docs are the source of truth.** See [`Docs/TASKLIST.md`](Docs/TASKLIST.md) for the build plan (work top-to-bottom) and [`Docs/Gym_Management_Platform_PRD.md`](Docs/Gym_Management_Platform_PRD.md) for requirements. Architecture decisions and conventions live in [`CLAUDE.md`](CLAUDE.md).

## Monorepo layout

| Path | What |
|---|---|
| `apps/api` | NestJS cloud backend (REST `/api/v1`, multi-tenant) |
| `apps/admin-web` | React (Vite) admin **and** PWA front-desk/POS terminal — the **web** app |
| `apps/member-mobile` | React Native member app — the **mobile** app |
| `apps/fiscal-bridge` | Local edge agent: fiscal device + offline queue + sync |
| `packages/db` | Prisma schema (data-model source of truth), client, migrations, seed |
| `packages/shared-types` | Shared TS types, DTO/Zod contracts, enums |
| `packages/fiscal-core` | Fiscal engine: `FiscalDriver` interface + `MockFiscalDriver` |
| `packages/i18n` | mk / sq / en catalogs + denar/date formatters |
| `packages/config` | Shared tsconfig / eslint / prettier presets |

## Prerequisites

- Node `>=20` (developed on Node 24)
- pnpm `9.x` (`npm i -g pnpm@9.15.9`)
- Docker + Docker Compose (for MySQL)

## Common commands

```bash
pnpm install            # install the workspace
pnpm db:up              # start MySQL (Docker)
pnpm build              # turbo build all
pnpm lint               # turbo lint all
pnpm typecheck          # turbo typecheck all
pnpm test               # turbo test all
```
