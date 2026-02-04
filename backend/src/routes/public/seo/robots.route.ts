/**
 * Robots.txt Route
 * Generates robots.txt for SEO
 */

import { Router } from "express";
import { env } from "../../../config/env";

const router = Router();

/**
 * GET /robots.txt
 * Returns robots.txt content
 */
router.get("/", (req, res) => {
    const baseUrl = env.FRONTEND_URL || "https://portyo.me";
    
    const robotsTxt = `# robots.txt for Portyo
# https://portyo.me

User-agent: *
Allow: /

# Disallow private/admin routes
Disallow: /dashboard
Disallow: /login
Disallow: /sign-up
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-email
Disallow: /onboarding
Disallow: /claim-bio
Disallow: /api/

# Disallow language-specific auth pages
Disallow: /en/login
Disallow: /pt/login
Disallow: /en/sign-up
Disallow: /pt/sign-up
Disallow: /en/forgot-password
Disallow: /pt/forgot-password
Disallow: /en/reset-password
Disallow: /pt/reset-password
Disallow: /en/verify-email
Disallow: /pt/verify-email
Disallow: /en/onboarding
Disallow: /pt/onboarding
Disallow: /en/claim-bio
Disallow: /pt/claim-bio
Disallow: /en/dashboard
Disallow: /pt/dashboard

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for rate limiting (optional)
# Crawl-delay: 1

# Specific bot rules
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: Anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /
`;

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    res.send(robotsTxt);
});

export default router;
