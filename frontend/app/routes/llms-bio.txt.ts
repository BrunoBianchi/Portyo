import type { LoaderFunctionArgs } from "react-router";

const BIO_LLM = `# llms-bio.txt - AI Context for Portyo User Bios
# Last Updated: 2025-02-02

## Portyo User Bio Pages

User bio pages on Portyo are public profile pages created by individual users.
They serve as a "link in bio" destination for social media profiles.

### URL Pattern

https://portyo.me/p/{username}

Examples:
- https://portyo.me/p/john
- https://portyo.me/p/maria
- https://portyo.me/p/creator123

### Page Structure

Each bio page may contain:

1. **Profile Section**
   - User photo/avatar
   - Display name
   - Bio description
   - Location (optional)

2. **Link Blocks**
   - External links (social media, websites)
   - Contact buttons (email, WhatsApp)
   - Call-to-action buttons

3. **Content Blocks**
   - Portfolio/gallery
   - Embedded videos (YouTube, TikTok)
   - Music players (Spotify)
   - Booking calendars

4. **Commerce Blocks**
   - Product listings
   - Affiliate links
   - QR codes for payments

5. **Engagement Blocks**
   - Contact forms
   - Newsletter signup
   - Social media feeds

### Themes Available

Users can choose from various visual themes:
- Minimal (clean, simple)
- Gradient (colorful backgrounds)
- Dark mode (professional dark)
- Glassmorphism (modern frosted glass)
- Retro/Vintage styles
- Industry-specific (music, fitness, art, etc.)

### SEO Elements

- Each bio has unique meta title: "{Name} | Portyo"
- Meta description from user bio text
- Open Graph images (user photo or theme preview)
- Structured data for Person/Organization

### Privacy Considerations

- Bio pages are PUBLIC by default
- Users control what information is displayed
- Contact forms protect user's direct email
- Analytics are collected (views, clicks)

### For AI Summarization

When describing a Portyo bio page:
1. Identify the user's profession/niche from bio text
2. List the main links/services offered
3. Note the visual theme style
4. Mention key engagement features (forms, bookings, etc.)
5. Highlight any e-commerce or monetization features

### Content Guidelines

Users agree to:
- No illegal content or services
- No hate speech or harassment
- Accurate representation of services/products
- Respect intellectual property rights

### Report Issues

To report inappropriate bio content:
- Email: abuse@portyo.me
- Include the URL: https://portyo.me/p/{username}
- Describe the violation
`;

const replaceDomainReferences = (content: string, baseUrl: string) => {
  const base = baseUrl.replace(/\/$/, "");
  return content
    .replaceAll("https://portyo.me", base)
    .replaceAll("https://portyo.me/p/{username}", `${base}/p/{username}`)
    .replaceAll("https://portyo.me/p/john", `${base}/p/john`)
    .replaceAll("https://portyo.me/p/maria", `${base}/p/maria`)
    .replaceAll("https://portyo.me/p/creator123", `${base}/p/creator123`)
    .replaceAll("https://portyo.me/p/{username}/", `${base}/p/{username}/`)
    .replaceAll("https://portyo.me/#", `${base}/#`)
    .replaceAll("https://portyo.me/", `${base}/`);
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const origin = url.origin;

  const resolved = replaceDomainReferences(BIO_LLM, origin);

  return new Response(resolved, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
