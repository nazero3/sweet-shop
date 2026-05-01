# Sweet Shop - Multi-State Online Ordering Platform

Production-focused monorepo for a multi-state sweet shop ordering platform.

## Stack

- Web: Next.js 14 (App Router)
- Mobile: React Native + Expo
- Admin: React + Vite
- API: Node.js + Express + Prisma
- DB: PostgreSQL
- Cache: Redis
- Realtime: Socket.IO
- Notifications: FCM + SendGrid/Resend (provider wiring points included)

## Monorepo Layout

```txt
sweet-shop/
  apps/
    web/
    mobile/
    admin/
    api/
  packages/
    db/
    shared/
  docker-compose.yml
```

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Start infra:
   - `docker compose up -d postgres redis`
3. Install dependencies:
   - `corepack enable`
   - `pnpm install`
4. Generate Prisma client and migrate:
   - `pnpm --filter @sweet-shop/db prisma:generate`
   - `pnpm --filter @sweet-shop/db prisma:migrate`
   - `pnpm --filter @sweet-shop/db seed`
5. Run apps:
   - API: `pnpm --filter @sweet-shop/api dev`
   - Web: `pnpm --filter @sweet-shop/web dev`
   - Admin: `pnpm --filter @sweet-shop/admin dev`
   - Mobile customer mode: `pnpm --filter @sweet-shop/mobile dev:customer`
   - Mobile owner mode: `pnpm --filter @sweet-shop/mobile dev:owner`

## API Docs

- Swagger UI is available at: `http://localhost:4000/docs`
- Owner login route: `POST /auth/admin/login`
- Owner notification settings routes:
  - `GET /admin/settings/notifications`
  - `PATCH /admin/settings/notifications`

## Implemented Baseline

- Complete Prisma data model for Store, Product, Category, Order, Admin, NotificationHistory
- Order creation with `SS-[STATE]-[5DIGIT]` numbering
- Guest order tracking endpoint
- Owner status update endpoint
- Socket.IO status broadcasts for customer tracking + admin feed
- Notification dispatch pipeline structure with retry logging (3 attempts)
- Web pages for store selection, menu, checkout, and order tracking
- Local cart persistence (`localStorage`) + selected store persistence
- Owner JWT login + protected admin order feed/status/analytics routes
- Owner notification preferences persisted in DB and applied during dispatch
- Robots + Sitemap routes for SEO baseline
- SEO routes for `/stores`, `/menu/[category]`, and `/menu/[category]/[product]` with JSON-LD
- Redis cache layer added for `/stores` and `/menu` API reads
- Strict order status transition validation per order type
- Web locale files (`en`, `ar`) + language switcher baseline
- Admin CRUD APIs for stores, categories, and products
- Admin notification history endpoint with filters
- Mobile app split into customer/owner entry modes with Expo localization baseline
- Async notification processing queue backed by Redis list (`notifications:queue`) with max 3 retries
- Notification architecture split into provider adapters (`push`, `email`) under `apps/api/src/services/notification`

## Next Build Steps

1. Seed data + real menu/store CRUD
2. JWT auth for owner routes
3. Full notification provider integrations
4. Redis cache strategy for menu/store reads
5. Complete i18n (English/Arabic) content pipeline
6. Enhanced SEO (JSON-LD, geo pages, image optimization, CWV tuning)

## Deployment

- Containerize each app with dedicated Dockerfiles
- Use managed Postgres + Redis
- Attach CDN for images/static assets
- Configure environment variables in deployment platform secret manager
