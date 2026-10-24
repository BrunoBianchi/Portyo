# Portyo

Multi-tenant link-in-bio SaaS with automated custom domains (DNS + SSL) and an AI engine that schedules and scores SEO/GEO/AEO posts.

## Problem

Creators and small businesses need a public bio page on their own domain, plus a way to keep publishing without living in a CMS. Manual SSL for every customer domain and one-off blog posts do not scale. Portyo automates both: domain provisioning and scheduled, scored content generation.

> Portfolio project. The public deployment is currently offline, so this README documents the architecture and the decisions behind it.

## Features

- Public bio pages with links, portfolio and booking-oriented surfaces
- Custom domains for Pro users: DNS verification, catch-all Nginx routing and Certbot/Let's Encrypt certificates
- AI auto-post schedules (daily / weekly / biweekly / monthly) driven by bio context
- Post scoring on SEO, GEO and AEO axes (0 to 100)
- Preview generation that does not consume monthly plan caps
- JWT auth, Helmet and rate limiting on the API

## Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React Router, TypeScript, CSS |
| Backend | Node.js, Express, TypeScript, TypeORM |
| Database | PostgreSQL |
| AI | Groq (`llama-3.3-70b-versatile`), BAML prompts |
| Infrastructure | Docker Compose, Nginx, Certbot / Let's Encrypt |
| Tooling | pnpm |

```
backend/      Express API, TypeORM entities, services, cron jobs, BAML prompts (baml_src/)
frontend/     React Router app: dashboard and public bio pages
deployment/   Nginx config, Docker Compose, domain + SSL scripts
```

## How AI is used in the product

- **Typed LLM output.** Prompts live in [`backend/baml_src/`](./backend/baml_src) and are written in BAML, so the model returns structured data (post, scores, summary) instead of free text that has to be parsed by hand.
- **Model.** The BAML clients point at Groq's OpenAI-compatible API with `llama-3.3-70b-versatile`.
- **Agent behavior is documented.** The auto-post flow (schedules, bio summary cache, generation, scoring, audit log) is described in [`AGENTS.md`](./AGENTS.md) and [`AUTO_POST_AGENTS.md`](./AUTO_POST_AGENTS.md).

## Architecture notes

**Custom domains.** A wildcard certificate cannot cover domains the platform does not own, so each customer domain gets its own certificate. Nginx uses a catch-all `default_server`, and tenancy is resolved in Express from the `Host` header (`customDomainMiddleware`). Adding a customer never means editing Nginx.

**Auto-post engine.** A cron job picks due schedules, summarises the bio (cached for about 30 days), generates Markdown via Groq, publishes, recomputes `nextPostDate` and writes an audit log with metrics. Monthly caps are enforced per plan, and previews are unlimited.

Further detail: [`CUSTOM_DOMAINS_GUIDE.md`](./CUSTOM_DOMAINS_GUIDE.md), [`SECURITY_GUIDE.md`](./SECURITY_GUIDE.md), [`deployment/README.md`](./deployment/README.md).

## Getting started

### With Docker Compose

```bash
cd deployment
cp .env.example .env      # fill in DB, Redis, JWT/session secrets and the API keys you need
docker compose up -d --build

# first-time custom-domain support (on the server)
./setup-custom-domains.sh
```

### Local development

```bash
# API
cd backend && pnpm install && pnpm run dev

# Web app (in another terminal)
cd frontend
cp .env.example .env
pnpm install && pnpm run dev
```

### Environment variables

Backend (see `backend/src/config/env.ts` and `deployment/.env.example`):

```bash
GROQ_API_KEY=
DB_HOST= DB_PORT= DB_USERNAME= DB_PASSWORD= DB_DATABASE=
JWT_SECRET= SESSION_SECRET=
MAX_POSTS_PER_MONTH=10   # optional
```

Frontend (see `frontend/.env.example`). Vite exposes every `VITE_*` variable to the browser, so only public values go here:

```bash
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_MAPS_EMBED_KEY=   # optional; restrict it by HTTP referrer in Google Cloud Console
```

Without `VITE_GOOGLE_MAPS_EMBED_KEY`, the Map block falls back to the keyless Google Maps embed.

## Author

**Bruno Bianchi**, Computer Engineering student at UNIFEI  
[github.com/BrunoBianchi](https://github.com/BrunoBianchi) · [bruno.raiadobian@gmail.com](mailto:bruno.raiadobian@gmail.com)
