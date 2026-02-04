# Portyo SEO & Crawler Files

This directory contains all essential files for search engine optimization and web crawler guidance.

## Files Overview

### Essential Files

| File | Purpose | Priority |
|------|---------|----------|
| `robots.txt` | Controls crawler access | Required |
| `sitemap.xml` | Lists all indexable URLs | Required |
| `sitemap-index.xml` | Index of multiple sitemaps | Recommended |

### Recommended Files

| File | Purpose | Priority |
|------|---------|----------|
| `.well-known/security.txt` | Security contact information | Recommended |

### Optional Context Files

| File | Purpose | Priority |
|------|---------|----------|
| `llms.txt` | AI agent context for site | Optional |
| `llms-bio.txt` | AI agent context for bios | Optional |
| `humans.txt` | Team credits & technology | Optional |

## File Locations

```
public/
├── robots.txt              # Crawler rules
├── sitemap.xml             # Main sitemap
├── sitemap-index.xml       # Sitemap index
├── llms.txt               # AI context (main site)
├── llms-bio.txt           # AI context (user bios)
├── humans.txt             # Team & credits
└── .well-known/
    └── security.txt       # Security contacts
```

## robots.txt

Controls which pages search engines and AI crawlers can access.

**Key rules:**
- ✅ Allows: Public pages, bios, blog, pricing
- ❌ Blocks: Dashboard, API, auth pages, admin
- 📊 Crawl-delay: 1 second (2s for AI bots)

## sitemap.xml

Contains all static URLs for the main site.

**Includes:**
- Homepage (EN/PT)
- Marketing pages (pricing, themes, features)
- Blog section
- About & Contact
- Legal pages (privacy, terms)

**Note:** Dynamic content (user bios, blog posts) should be added via API-generated sitemaps or submitted directly to search consoles.

## llms.txt

Provides context for AI agents crawling the site.

**Contains:**
- Site description & features
- Target audience
- URL structure
- API endpoints
- Contact information

## llms-bio.txt

Specific guidance for AI agents processing user bio pages.

**Contains:**
- Bio page structure
- Available blocks/types
- Theme information
- Privacy guidelines

## security.txt

Security researchers can use this to report vulnerabilities.

**Format:** RFC 9116
**Location:** `/.well-known/security.txt`

## humans.txt

Credits the team and technology behind Portyo.

**Contains:**
- Team information
- Technology stack
- Special thanks
- Contact links

## Updating These Files

1. **Last Modified Date**: Update `<lastmod>` in sitemaps when making significant changes
2. **Version Control**: Track changes to these files in git
3. **Validation**: Use online validators to check syntax:
   - robots.txt: Google Search Console
   - sitemap.xml: XML Sitemap Validator
   - security.txt: securitytxt.org

## Search Engine Submissions

Submit sitemaps to:
- Google Search Console: https://search.google.com/search-console
- Bing Webmaster: https://www.bing.com/webmasters
- Yandex: https://webmaster.yandex.com

## AI Crawler Considerations

These files are optimized for:
- OpenAI (GPTBot, ChatGPT-User)
- Anthropic (anthropic-ai, Claude-Web)
- Google (Google-Extended)
- Perplexity (PerplexityBot)
- And others following the llms.txt standard

## Questions?

Contact: support@portyo.me
