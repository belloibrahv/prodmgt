# TechVaults Project Manager

An internal workspace for TechVaults teams to manage projects, tasks, milestones, documentation, reporting, and delivery workload.

## Local setup

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL` and `NEXTAUTH_SECRET`.
2. Install dependencies with `npm ci`.
3. Create the database schema with `npm run db:push`.
4. Optionally add the sample workspace with `npm run db:seed`.
5. Run `npm run dev`.

## Render deployment (Docker)

This repository includes a multi-stage `Dockerfile` and `render.yaml`. Create a PostgreSQL database (Render Postgres, Neon, or Supabase) and deploy this repository as a Render Blueprint, or create a Docker Web Service directly. Set:

- `DATABASE_URL` — the PostgreSQL connection string (include `?schema=public` where required)
- `NEXTAUTH_SECRET` — use a strong generated secret
- `NEXTAUTH_URL` — the public Render service URL, e.g. `https://techvaults-prodmgt.onrender.com`

The container applies the Prisma schema on startup before it launches the application. Render provides the `PORT` automatically.
