# Portyo

**Multi-tenant link-in-bio platform with custom domains and an AI content engine.**

Portyo lets a user build a public "bio" page, point their own domain at it, and keep it alive with scheduled, AI-generated posts. Two pieces make it more than a CRUD app: automated custom-domain provisioning (DNS verification + SSL issuance, no manual steps) and an auto-post engine that writes and publishes content on a schedule, scoring every post for SEO, GEO and AEO.

> ⚠️ Portfolio project — the public deployment is currently offline. This README documents the architecture and the decisions behind it.

---

## Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React Router, TypeScript, CSS |
| Backend | Node.js, Express, TypeScript, TypeORM |
| Database | PostgreSQL |
| AI | Groq (llama-3.3-70b) |
| Infrastructure | Docker Compose, Nginx, Certbot / Let's Encrypt |
| Security | JWT auth middleware, Helmet, rate limiting |
| Tooling | pnpm workspaces |

```
backend/      Express API, TypeORM entities, services, cron jobs
frontend/     React Router app, dashboard and public bio pages
deployment/   Nginx config, Docker Compose, domain + SSL scripts
```

---

## Custom domains

A user on the Pro plan can attach their own domain to their bio page. The flow is fully automated:

1. The user points DNS at the server (A record, or CNAME to `portyo.me`).
2. The domain is registered through `POST /api/custom-domains`, creating a `CustomDomainEntity` with status `pending`.
3. Nginx receives the request on a catch-all `default_server` block and proxies to the backend, preserving the original `Host` header.
4. `customDomainMiddleware` resolves the host to the right bio and serves it — the visitor never sees a slug in the URL.
5. Certbot issues and renews the TLS certificate; the entity tracks `sslActive`, `sslExpiresAt`, `dnsVerifiedAt` and `isHealthy`.

```
Custom domain ──▶ Nginx (default_server) ──▶ Express backend
                        │                          │
                     Certbot                  PostgreSQL
                   (auto SSL)             (CustomDomainEntity)
```

Shell scripts in `deployment/` wrap the operational side: add, remove, list and renew certificates in bulk.

**Why it was built this way:** a wildcard certificate can't cover domains the platform doesn't own, so each customer domain needs its own certificate. Routing everything through one catch-all Nginx block and resolving tenancy at the application layer keeps the server config static — adding a customer never means editing Nginx.

---

## AI auto-post engine

Each bio can have a posting schedule. A cron job picks up due schedules and generates a post from the user's own profile context.

- **Bio analysis** — the user's bio is summarised once into expertise, tone, industry and an audience persona, then cached for 30 days.
- **Generation** — Groq produces a Markdown post from that summary plus the schedule's topics, keywords, target audience, tone and length.
- **Publishing** — the post is stored, `nextPostDate` is recomputed from the frequency (daily / weekly / biweekly / monthly at a preferred time), and every run is written to an audit log with its metrics.
- **Limits** — monthly post caps are enforced per plan; previews are unlimited and don't count.

Every generated post is scored 0–100 on three axes:

| | What it measures |
| :--- | :--- |
| **SEO** | title and meta quality, keyword density, readability, structure, alt text, slug |
| **GEO** | how well generative engines can parse it — entities, structured data, answer potential |
| **AEO** | answer-engine fit — direct 40–60 word answers, question headers, voice-search phrasing |

---

## API

```http
POST   /api/auto-post                  # create or update a schedule
GET    /api/auto-post/:bioId           # read a schedule
PATCH  /api/auto-post/toggle           # activate / deactivate
DELETE /api/auto-post/:bioId           # remove a schedule
GET    /api/auto-post/:bioId/stats     # stats and recent run logs
POST   /api/auto-post/preview          # generate a preview post

GET    /api/custom-domains             # list the user's domains
POST   /api/custom-domains             # attach a domain (Pro)
GET    /api/custom-domains/check       # public domain status lookup
POST   /api/custom-domains/:id/verify  # force re-verification
DELETE /api/custom-domains/:id         # detach a domain
```

All routes are behind `authMiddleware`; Pro-only routes add `isUserPro`. Ownership of the bio is verified on every operation, so a user can only ever reach their own resources.

---

## Running locally

```bash
pnpm install

# backend + database + nginx
docker compose up -d

# first-time setup for custom domain support
cd deployment && ./setup-custom-domains.sh
```

Required environment variables:

```bash
GROQ_API_KEY=                 # AI content generation
DB_HOST= DB_PORT= DB_USERNAME= DB_PASSWORD=
MAX_POSTS_PER_MONTH=10        # optional, defaults to 10
```

Further documentation lives in [`CUSTOM_DOMAINS_GUIDE.md`](./CUSTOM_DOMAINS_GUIDE.md), [`AGENTS.md`](./AGENTS.md) and [`SECURITY_GUIDE.md`](./SECURITY_GUIDE.md).

---

## What I'd do next

- Automated health-check cron for attached domains, with email alerts before certificates expire
- `www` → apex redirects and per-domain analytics
- Test coverage on the scheduling logic, which is currently the most fragile part
- Tidy the repository root — a few scratch files from development are still committed

---

## Author

**Bruno Bianchi** — Full-Stack Developer
[brunobianchi.dev](https://brunobianchi.dev) · [LinkedIn](https://www.linkedin.com/in/brunorbianchi)
