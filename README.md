# Portyo

Multi-tenant link-in-bio SaaS with automated custom domains (DNS + SSL) and an AI engine for scheduled SEO/GEO/AEO posts.

## Problem

Creators and small businesses need a public bio page on their own domain, plus a way to keep publishing without living in a CMS. Manual SSL for every customer domain and one-off blog posts do not scale. Portyo automates both: domain provisioning and scheduled, scored content generation.

> Portfolio project — the public deployment is currently offline. This README documents the architecture and the decisions behind it.

## Features

- Public bio pages with links, portfolio and booking-oriented surfaces
- Custom domains for Pro users: DNS verification, catch-all Nginx routing and Certbot/Let's Encrypt certificates
- AI auto-post schedules (daily / weekly / biweekly / monthly) driven by bio context
- Post scoring on SEO, GEO and AEO axes (0–100)
- Preview generation that does not consume monthly plan caps
- JWT auth, Helmet and rate limiting on the API

## Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React Router, TypeScript, CSS |
| Backend | Node.js, Express, TypeScript, TypeORM |
| Database | PostgreSQL |
| AI | Groq (llama-3.3-70b), BAML prompts |
| Infrastructure | Docker Compose, Nginx, Certbot / Let's Encrypt |
| Tooling | pnpm workspaces |

```
backend/      Express API, TypeORM entities, services, cron jobs
frontend/     React Router app — dashboard and public bio pages
deployment/   Nginx config, Docker Compose, domain + SSL scripts
```

## Architecture notes

**Custom domains.** A wildcard certificate cannot cover domains the platform does not own. Each customer domain gets its own certificate. Nginx uses a catch-all `default_server`; tenancy is resolved in Express from the `Host` header (`customDomainMiddleware`), so adding a customer never means editing Nginx.

**Auto-post engine.** A cron job picks due schedules, summarises the bio (cached ~30 days), generates Markdown via Groq, publishes, recomputes `nextPostDate` and writes an audit log with metrics. Monthly caps are enforced per plan; previews are unlimited.

Further detail: [`CUSTOM_DOMAINS_GUIDE.md`](./CUSTOM_DOMAINS_GUIDE.md), [`AGENTS.md`](./AGENTS.md), [`SECURITY_GUIDE.md`](./SECURITY_GUIDE.md).

## Getting started

```bash
pnpm install
docker compose up -d

# first-time custom-domain support
cd deployment && ./setup-custom-domains.sh
```

Required environment variables (see backend config):

```bash
GROQ_API_KEY=
DB_HOST= DB_PORT= DB_USERNAME= DB_PASSWORD=
MAX_POSTS_PER_MONTH=10   # optional
```

## Author

**Bruno Bianchi** — Full-Stack Developer  
[github.com/BrunoBianchi](https://github.com/BrunoBianchi) · [brunobianchi.dev](https://brunobianchi.dev)
