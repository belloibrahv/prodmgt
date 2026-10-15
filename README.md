# TechVaults Project Manager

An internal workspace for TechVaults teams to manage projects, tasks, milestones, documentation, reporting, and delivery workload.

## Local setup

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL` and `NEXTAUTH_SECRET`.
2. Install dependencies with `npm ci`.
3. Create the database schema with `npm run db:push`.
4. Optionally add the sample workspace with `npm run db:seed`.
5. Run `npm run dev`.

## Deployment (Railway)

Production runs on Railway from the `main` branch of `techvaults-jobs/prodmgt`, using the `Dockerfile`. `railway.json` holds the service settings:

- `prisma migrate deploy` runs before every deploy, so new migrations in `prisma/migrations` are applied automatically.
- Railway checks `/api/health`, which confirms the app can reach the database.

The service needs these variables:

- `DATABASE_URL` — reference the Railway Postgres service (`${{Postgres.DATABASE_URL}}`)
- `AUTH_SECRET` and `NEXTAUTH_SECRET` — strong generated secrets
- `AUTH_URL` and `NEXTAUTH_URL` — the public URL, e.g. `https://${{RAILWAY_PUBLIC_DOMAIN}}`
- `AUTH_TRUST_HOST=true`

When you change `prisma/schema.prisma`, always commit a migration with it (`npm run db:migrate`). The app queries columns that only exist once their migration has run.

`render.yaml` is the older Render setup and is no longer used.
