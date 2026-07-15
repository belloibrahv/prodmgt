# TechVaults Project Manager

An internal workspace for TechVaults teams to manage projects, tasks, milestones, documentation, reporting, and delivery workload.

## Local setup

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL` and `NEXTAUTH_SECRET`.
2. Install dependencies with `npm ci`.
3. Create the database schema with `npm run db:push`.
4. Optionally add the sample workspace with `npm run db:seed`.
5. Run `npm run dev`.

## Render deployment (Docker)

This repository includes a multi-stage `Dockerfile` and `render.yaml`. Deploy it as a Render Blueprint to provision the web service and a managed Render Postgres database together. The app automatically receives the database's private `DATABASE_URL`; do not set that variable manually.

Set:

- `NEXTAUTH_SECRET` — use a strong generated secret
- `NEXTAUTH_URL` — the public Render service URL, e.g. `https://techvaults-prodmgt.onrender.com`

The container applies the Prisma schema on startup before it launches the application. Render provides the `PORT` automatically.

### Production database administration

The Blueprint blocks external database connections and keeps app-to-database traffic on Render's private network. To manage the production schema and records directly in Render, open the `techvaults-prodmgt-db` database in the Render Dashboard, select **Apps**, and deploy **pgAdmin**. It provides a protected browser interface for tables, indexes, schema changes, and one-off SQL queries. Deploy **PgHero** from the same screen for performance monitoring and slow-query analysis.

Store the generated pgAdmin credentials in a password manager and grant access only to authorized TechVaults administrators. Do not add a database console to the main product-management app; it would unnecessarily expose destructive database operations to normal users.
