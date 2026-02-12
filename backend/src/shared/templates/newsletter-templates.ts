import { env } from "../../config/env";
import { generateUnsubscribeToken } from "../utils/unsubscribe-token";

const APP_URL = env.FRONTEND_URL || "https://portyo.me";
const API_URL = env.BACKEND_URL || "https://api.portyo.me";

interface TemplateVars {
    fullName: string;
    email: string;
    userId: string;
    plan: string;
}

export interface NewsletterTemplate {
    id: string;
    subject: string;
    targetPlans: "all" | "free" | "paid";
    getHtml: (vars: TemplateVars) => string;
}

// ─── Shared Layout Builder ───────────────────────────────────────────────

function buildEmail(vars: TemplateVars, content: {
    preheader?: string;
    heroTitle: string;
    heroSubtitle?: string;
    heroImage?: string;
    body: string;
    ctaText?: string;
    ctaUrl?: string;
    secondaryCta?: { text: string; url: string };
}): string {
    const firstName = vars.fullName.split(" ")[0];
    const unsubscribeToken = generateUnsubscribeToken(vars.userId);
    const unsubscribeUrl = `${API_URL}/api/public/newsletter/unsubscribe?token=${unsubscribeToken}`;

    return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
${content.preheader ? `<meta name="description" content="${content.preheader}">` : ""}
<title>Portyo</title>
<style>
    body { margin: 0; padding: 0; background-color: #f5f5f3; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .email-wrapper { width: 100%; background-color: #f5f5f3; padding: 40px 0; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .header { background-color: #1A1A1A; padding: 24px 32px; text-align: center; }
    .header-logo { font-size: 22px; font-weight: 800; color: #D7F000; letter-spacing: -0.5px; text-decoration: none; }
    .hero { background-color: #1A1A1A; padding: 0 32px 40px; text-align: center; }
    .hero h1 { font-size: 32px; font-weight: 800; color: #ffffff; margin: 0 0 12px; line-height: 1.2; letter-spacing: -0.5px; }
    .hero p { font-size: 16px; color: rgba(255,255,255,0.7); margin: 0; line-height: 1.5; }
    .hero-image { width: 100%; max-width: 536px; margin: 24px auto 0; border-radius: 12px; }
    .content { padding: 32px; }
    .content p { font-size: 16px; color: #374151; line-height: 1.7; margin: 0 0 16px; }
    .content h2 { font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 28px 0 12px; }
    .content h3 { font-size: 18px; font-weight: 700; color: #1A1A1A; margin: 24px 0 8px; }
    .promo-box { background-color: #1A1A1A; border-radius: 16px; padding: 32px; text-align: center; margin: 24px 0; }
    .promo-code { display: inline-block; background-color: #ffffff; color: #1A1A1A; font-size: 28px; font-weight: 800; letter-spacing: 3px; padding: 16px 40px; border-radius: 12px; margin: 16px 0; border: 3px solid #D7F000; }
    .promo-box p { color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0; }
    .cta-wrapper { text-align: center; margin: 32px 0; }
    .cta-button { display: inline-block; padding: 16px 40px; background-color: #D7F000; color: #1A1A1A; font-size: 16px; font-weight: 800; text-decoration: none; border-radius: 50px; letter-spacing: 0.5px; text-transform: uppercase; }
    .cta-secondary { display: inline-block; padding: 12px 28px; background-color: transparent; color: #1A1A1A; font-size: 14px; font-weight: 700; text-decoration: none; border: 2px solid #1A1A1A; border-radius: 50px; margin-top: 12px; }
    .feature-grid { margin: 24px 0; }
    .feature-item { padding: 16px 0; border-bottom: 1px solid #f3f4f6; }
    .feature-item:last-child { border-bottom: none; }
    .feature-icon { display: inline-block; width: 40px; height: 40px; background-color: #D7F000; border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px; vertical-align: middle; margin-right: 12px; }
    .feature-text { display: inline-block; vertical-align: middle; max-width: 440px; }
    .feature-text strong { font-size: 15px; color: #1A1A1A; display: block; }
    .feature-text span { font-size: 13px; color: #6b7280; }
    .tip-card { background: linear-gradient(135deg, #f0f9e8 0%, #f5f5f3 100%); border: 2px solid #D7F000; border-radius: 12px; padding: 20px; margin: 16px 0; }
    .tip-card strong { color: #1A1A1A; }
    .numbered-list { counter-reset: step; padding-left: 0; list-style: none; margin: 20px 0; }
    .numbered-list li { counter-increment: step; padding: 12px 0 12px 56px; position: relative; font-size: 15px; color: #374151; border-bottom: 1px solid #f3f4f6; }
    .numbered-list li::before { content: counter(step); position: absolute; left: 0; top: 10px; width: 36px; height: 36px; background-color: #1A1A1A; color: #D7F000; font-weight: 800; font-size: 16px; text-align: center; line-height: 36px; border-radius: 50%; }
    .divider { height: 1px; background-color: #e5e7eb; margin: 32px 0; }
    .footer { background-color: #1A1A1A; padding: 32px; text-align: center; }
    .footer-tagline { font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 4px; }
    .footer-subtitle { font-size: 13px; color: rgba(255,255,255,0.5); margin: 0 0 20px; }
    .footer-links { margin: 16px 0; }
    .footer-links a { color: rgba(255,255,255,0.5); text-decoration: underline; font-size: 12px; margin: 0 8px; }
    .footer-social { margin: 16px 0; }
    .footer-social a { display: inline-block; width: 32px; height: 32px; background-color: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 32px; margin: 0 4px; color: #ffffff; font-size: 14px; text-decoration: none; }
    .footer-copy { font-size: 11px; color: rgba(255,255,255,0.3); margin: 16px 0 0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge-pro { background-color: #D7F000; color: #1A1A1A; }
    .badge-new { background-color: #7C3AED; color: #ffffff; }
    .badge-tip { background-color: #059669; color: #ffffff; }
    @media (max-width: 620px) {
        .email-wrapper { padding: 16px 0 !important; }
        .email-container { margin: 0 12px !important; border-radius: 12px !important; }
        .header, .hero, .content, .footer { padding-left: 20px !important; padding-right: 20px !important; }
        .hero h1 { font-size: 26px !important; }
        .promo-code { font-size: 22px !important; padding: 12px 28px !important; }
    }
</style>
</head>
<body>
<div class="email-wrapper">
<div class="email-container">
    <!-- Header -->
    <div class="header">
        <a href="${APP_URL}" class="header-logo">Portyo*</a>
    </div>

    <!-- Hero -->
    <div class="hero">
        <h1>${content.heroTitle}</h1>
        ${content.heroSubtitle ? `<p>${content.heroSubtitle}</p>` : ""}
    </div>

    <!-- Body Content -->
    <div class="content">
        <p>Hi ${firstName},</p>
        ${content.body}

        ${content.ctaText && content.ctaUrl ? `
        <div class="cta-wrapper">
            <a href="${content.ctaUrl}" class="cta-button">${content.ctaText}</a>
            ${content.secondaryCta ? `<br><a href="${content.secondaryCta.url}" class="cta-secondary">${content.secondaryCta.text}</a>` : ""}
        </div>
        ` : ""}
    </div>

    <!-- Footer -->
    <div class="footer">
        <p class="footer-tagline">Portyo*</p>
        <p class="footer-subtitle">Everything you are. In one simple link.</p>
        <div class="footer-links">
            <a href="${APP_URL}/terms-of-service">Terms</a>
            <a href="${APP_URL}/privacy-policy">Privacy</a>
            <a href="${APP_URL}">Home</a>
            <a href="${unsubscribeUrl}">Unsubscribe</a>
        </div>
        <p class="footer-copy">&copy; ${new Date().getFullYear()} Portyo. All rights reserved.</p>
    </div>
</div>
</div>
</body>
</html>`;
}

// ─── Template Definitions ────────────────────────────────────────────────

export const NEWSLETTER_TEMPLATES: NewsletterTemplate[] = [
    // ── 1. Welcome Tips ─────────────────────────────────────────────────
    {
        id: "welcome_tips",
        subject: "3 tips to make your Portyo stand out",
        targetPlans: "all",
        getHtml: (vars) => buildEmail(vars, {
            preheader: "Make your bio unforgettable with these quick tips",
            heroTitle: "Make Your Portyo<br>Stand Out",
            heroSubtitle: "3 quick wins to level up your bio right now",
            body: `
                <p>Your Portyo page is your digital handshake — let's make it a great one.</p>

                <ol class="numbered-list">
                    <li><strong>Write a killer headline.</strong> Your bio description is the first thing visitors read. Make it specific: "UX designer helping startups ship faster" beats "Designer" every time.</li>
                    <li><strong>Pin your best links.</strong> Put your most important link at the top. Whether it's your portfolio, shop, or latest post — make it easy to find.</li>
                    <li><strong>Add a profile photo.</strong> Pages with photos get 40% more engagement. Use a clear, well-lit headshot or logo.</li>
                </ol>

                <div class="tip-card">
                    <strong>💡 Quick tip:</strong> Visit your page from your phone to see how visitors experience it. Mobile traffic accounts for 80%+ of link-in-bio visits.
                </div>
            `,
            ctaText: "Edit Your Bio",
            ctaUrl: `${APP_URL}/dashboard`,
        }),
    },

    // ── 2. Upgrade Pro ──────────────────────────────────────────────────
    {
        id: "upgrade_pro",
        subject: "Unlock your full potential with Pro",
        targetPlans: "free",
        getHtml: (vars) => buildEmail(vars, {
            preheader: "Get advanced analytics, custom domains, and more",
            heroTitle: "Upgrade Today<br>& Grow Faster",
            heroSubtitle: "Get the tools that top creators use to stand out",
            body: `
                <p>You've been building something great on Portyo — now imagine what you could do with the full toolkit.</p>

                <div class="promo-box">
                    <p style="color: #D7F000; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Your upgrade code is:</p>
                    <div class="promo-code">PORTYO2026</div>
                    <p>Use this code to get started with Pro features.</p>
                </div>

                <div class="feature-grid">
                    <div class="feature-item">
                        <span class="feature-icon">📊</span>
                        <div class="feature-text">
                            <strong>Advanced Analytics</strong>
                            <span>See where your visitors come from and what they click</span>
                        </div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🌐</span>
                        <div class="feature-text">
                            <strong>Custom Domains</strong>
                            <span>Use your own domain for a professional look</span>
                        </div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🤖</span>
                        <div class="feature-text">
                            <strong>AI Auto-Post</strong>
                            <span>Let AI write and publish blog posts for you</span>
                        </div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🎨</span>
                        <div class="feature-text">
                            <strong>Premium Themes</strong>
                            <span>Access exclusive themes that make your page unique</span>
                        </div>
                    </div>
                </div>
            `,
            ctaText: "Upgrade to Pro",
            ctaUrl: `${APP_URL}/dashboard?upgrade=true`,
            secondaryCta: { text: "Compare Plans", url: `${APP_URL}/pricing` },
        }),
    },

    // ── 3. New Features ─────────────────────────────────────────────────
    {
        id: "new_features",
        subject: "What's new on Portyo ✨",
        targetPlans: "all",
        getHtml: (vars) => buildEmail(vars, {
            preheader: "Check out the latest features we've shipped",
            heroTitle: "What's New<br>on Portyo",
            heroSubtitle: "Fresh features to help you grow faster",
            body: `
                <p>We've been busy building. Here's what's new:</p>

                <div class="feature-grid">
                    <div class="feature-item">
                        <span class="feature-icon">✨</span>
                        <div class="feature-text">
                            <strong>Smart Themes <span class="badge badge-new">NEW</span></strong>
                            <span>Category-matched themes that adapt to your content style</span>
                        </div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">📝</span>
                        <div class="feature-text">
                            <strong>AI Blog Posts <span class="badge badge-pro">PRO</span></strong>
                            <span>Auto-generate SEO-optimized blog posts on schedule</span>
                        </div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">📅</span>
                        <div class="feature-text">
                            <strong>Booking System</strong>
                            <span>Let visitors schedule meetings directly from your bio</span>
                        </div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🏪</span>
                        <div class="feature-text">
                            <strong>Digital Store</strong>
                            <span>Sell products and services with built-in Stripe payments</span>
                        </div>
                    </div>
                </div>

                <div class="tip-card">
                    <strong>🔮 Coming soon:</strong> Enhanced portfolio blocks, email campaigns with templates, and Instagram feed integration.
                </div>
            `,
            ctaText: "Explore Features",
            ctaUrl: `${APP_URL}/dashboard`,
        }),
    },

    // ── 4. SEO Boost ────────────────────────────────────────────────────
    {
        id: "seo_boost",
        subject: "Boost your SEO score in 5 minutes",
        targetPlans: "paid",
        getHtml: (vars) => buildEmail(vars, {
            preheader: "Quick SEO wins for your Portyo page",
            heroTitle: "Boost Your<br>SEO Score",
            heroSubtitle: "5-minute fixes that make a big difference",
            body: `
                <p>Getting discovered on search engines is one of the best ways to grow your audience. Here's how to optimize your Portyo page in just 5 minutes:</p>

                <ol class="numbered-list">
                    <li><strong>Set a custom meta title.</strong> Go to SEO Settings and write a descriptive title with your key skills (e.g., "John Doe — Freelance UI Designer | Portfolio & Services").</li>
                    <li><strong>Write a meta description.</strong> Summarize what you do in 155 characters. Include a call-to-action like "View portfolio" or "Book a call".</li>
                    <li><strong>Use descriptive link titles.</strong> Instead of "Click here," name your links: "View My Portfolio" or "Listen to My Podcast".</li>
                    <li><strong>Add alt text to images.</strong> Describe your photos and graphics — search engines can't see images, but they can read alt text.</li>
                    <li><strong>Connect a custom domain.</strong> Custom domains (e.g., yourname.com) rank better than subdomains and look more professional.</li>
                </ol>

                <div class="tip-card">
                    <strong>📈 Pro tip:</strong> Blog posts on your Portyo site significantly improve SEO. Each post is a new page that Google can index. Use Auto-Post to publish consistently.
                </div>
            `,
            ctaText: "Open SEO Settings",
            ctaUrl: `${APP_URL}/dashboard`,
        }),
    },

    // ── 5. Grow Audience ────────────────────────────────────────────────
    {
        id: "grow_audience",
        subject: "How top creators grow on Portyo",
        targetPlans: "all",
        getHtml: (vars) => buildEmail(vars, {
            preheader: "Proven strategies from the fastest-growing Portyo creators",
            heroTitle: "Grow Your<br>Audience 10x",
            heroSubtitle: "Strategies from Portyo's top creators",
            body: `
                <p>The fastest-growing creators on Portyo share a few key habits. Here's what they do differently:</p>

                <h3>🔗 Share your link everywhere</h3>
                <p>Add your Portyo link to your Instagram bio, Twitter/X profile, TikTok, LinkedIn, email signature — everywhere. Consistency compounds.</p>

                <h3>📊 Track what works</h3>
                <p>Check your analytics weekly. See which links get the most clicks and double down on what your audience wants.</p>

                <h3>📝 Post consistently</h3>
                <p>Creators who blog at least weekly see 3x more organic traffic. Use AI Auto-Post to stay consistent without the effort.</p>

                <h3>🎯 Have a clear CTA</h3>
                <p>Every Portyo page should have one primary call-to-action. Whether it's "Book a call," "Shop now," or "Follow me" — make it obvious.</p>

                <div class="tip-card">
                    <strong>🏆 Did you know?</strong> Portyo creators who use QR codes on their business cards see double the profile visits compared to sharing URLs verbally.
                </div>
            `,
            ctaText: "Go to Dashboard",
            ctaUrl: `${APP_URL}/dashboard`,
        }),
    },

    // ── 6. Auto-Post Intro ──────────────────────────────────────────────
    {
        id: "auto_post_intro",
        subject: "Let AI write your blog posts ✍️",
        targetPlans: "free",
        getHtml: (vars) => buildEmail(vars, {
            preheader: "Publish SEO-optimized blog posts on autopilot",
            heroTitle: "Your Blog,<br>On Autopilot",
            heroSubtitle: "AI-powered blog posts, published on your schedule",
            body: `
                <p>What if you could publish professional, SEO-optimized blog posts without writing a single word?</p>

                <p>With <strong>Portyo Auto-Post</strong>, our AI analyzes your profile, expertise, and audience to generate high-quality blog posts — and publishes them automatically on your schedule.</p>

                <div class="feature-grid">
                    <div class="feature-item">
                        <span class="feature-icon">🧠</span>
                        <div class="feature-text">
                            <strong>AI that knows your voice</strong>
                            <span>Learns your tone, expertise, and audience for personalized content</span>
                        </div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">📈</span>
                        <div class="feature-text">
                            <strong>SEO-optimized by default</strong>
                            <span>Every post scores 80+ on SEO, GEO, and AEO metrics</span>
                        </div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">⏰</span>
                        <div class="feature-text">
                            <strong>Set it and forget it</strong>
                            <span>Daily, weekly, or monthly — you choose the frequency</span>
                        </div>
                    </div>
                </div>

                <div class="promo-box">
                    <p style="color: #D7F000; font-weight: 700; font-size: 18px; margin: 0 0 8px;">Up to 10 AI posts/month</p>
                    <p>Available on the Pro plan. Start your journey today.</p>
                </div>
            `,
            ctaText: "Try Auto-Post",
            ctaUrl: `${APP_URL}/dashboard?upgrade=true`,
        }),
    },

    // ── 7. Engagement Tips ──────────────────────────────────────────────
    {
        id: "engagement_tips",
        subject: "Make every click count 🎯",
        targetPlans: "all",
        getHtml: (vars) => buildEmail(vars, {
            preheader: "Optimize your links for maximum engagement",
            heroTitle: "Make Every<br>Click Count",
            heroSubtitle: "Small tweaks that dramatically boost engagement",
            body: `
                <p>Every link on your Portyo page is an opportunity. Here's how to make each one count:</p>

                <ol class="numbered-list">
                    <li><strong>Use action-oriented labels.</strong> "Listen to my latest track" outperforms "Spotify" by 2x. Tell visitors what they'll get.</li>
                    <li><strong>Limit your links.</strong> Pages with 5-7 links perform better than pages with 15+. Quality over quantity — remove links that don't get clicks.</li>
                    <li><strong>Add thumbnails.</strong> Links with images get 30% more clicks. Use eye-catching thumbnails for your most important links.</li>
                    <li><strong>Reorder weekly.</strong> Put your most timely content at the top. Launching something new? Pin it to the first position.</li>
                    <li><strong>Use link scheduling.</strong> Time-sensitive links (sales, events) can go live and expire automatically with automations.</li>
                </ol>

                <div class="tip-card">
                    <strong>📱 Mobile first:</strong> 85% of your visitors are on mobile. Test your page on your phone every time you make changes.
                </div>
            `,
            ctaText: "Optimize Your Links",
            ctaUrl: `${APP_URL}/dashboard`,
        }),
    },

    // ── 8. Theme Refresh ────────────────────────────────────────────────
    {
        id: "theme_refresh",
        subject: "Fresh looks for your bio 🎨",
        targetPlans: "all",
        getHtml: (vars) => buildEmail(vars, {
            preheader: "New themes and customization options are waiting",
            heroTitle: "Time for a<br>Fresh Look?",
            heroSubtitle: "Discover themes that match your style",
            body: `
                <p>First impressions matter. Your Portyo theme is the first thing visitors see — and the right one can boost engagement by up to 50%.</p>

                <h3>🌟 Popular theme categories</h3>
                <div class="feature-grid">
                    <div class="feature-item">
                        <span class="feature-icon">💻</span>
                        <div class="feature-text">
                            <strong>Tech & Developer</strong>
                            <span>Dark modes, terminal aesthetics, and clean code vibes</span>
                        </div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🎨</span>
                        <div class="feature-text">
                            <strong>Creative & Art</strong>
                            <span>Bold gradients, mesh backgrounds, and floating elements</span>
                        </div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">💼</span>
                        <div class="feature-text">
                            <strong>Business & Professional</strong>
                            <span>Minimal, clean designs that mean business</span>
                        </div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">📸</span>
                        <div class="feature-text">
                            <strong>Photography & Portfolio</strong>
                            <span>Gallery-focused layouts that let your work shine</span>
                        </div>
                    </div>
                </div>

                <div class="tip-card">
                    <strong>✨ Pro tip:</strong> Change your theme seasonally to keep your page feeling fresh for returning visitors. Your content stays — only the look changes.
                </div>
            `,
            ctaText: "Browse Themes",
            ctaUrl: `${APP_URL}/dashboard`,
        }),
    },

    // ── 9. Pro Exclusive ────────────────────────────────────────────────
    {
        id: "pro_exclusive",
        subject: "Pro insights: Your analytics deep dive",
        targetPlans: "paid",
        getHtml: (vars) => buildEmail(vars, {
            preheader: "Advanced analytics strategies for Pro creators",
            heroTitle: "Analytics<br>Deep Dive",
            heroSubtitle: "Pro-exclusive strategies to understand your audience",
            body: `
                <p>As a ${vars.plan === "pro" ? "Pro" : "Standard"} member, you have access to powerful analytics. Here's how to make the most of them:</p>

                <h3>📊 Key metrics to track weekly</h3>
                <ol class="numbered-list">
                    <li><strong>Click-through rate (CTR).</strong> How many visitors actually click your links? If CTR is below 30%, try rewriting your link titles or reordering them.</li>
                    <li><strong>Traffic sources.</strong> Know where your visitors come from (Instagram, Twitter, direct, search). Double down on your best-performing channels.</li>
                    <li><strong>Geography.</strong> See which countries visit most. Consider adding content in their language or posting at times that match their timezone.</li>
                    <li><strong>Peak hours.</strong> Share your link when your audience is most active. Post at peak hours for maximum initial engagement.</li>
                </ol>

                <h3>🎯 Advanced strategies</h3>
                <p><strong>A/B test your links:</strong> Try different titles for the same link and track which gets more clicks. Even small wording changes can increase CTR by 20%+.</p>

                <p><strong>QR code tracking:</strong> Each QR code has its own analytics. Print QR codes on business cards and track exactly how many scans convert to page visits.</p>

                <div class="tip-card">
                    <strong>💎 Pro exclusive:</strong> Export your analytics data anytime from the dashboard. Use it to build reports for sponsors, clients, or your own growth strategy.
                </div>
            `,
            ctaText: "View Analytics",
            ctaUrl: `${APP_URL}/dashboard`,
        }),
    },

    // ── 10. Milestone / Engagement ──────────────────────────────────────
    {
        id: "milestone",
        subject: "You're doing great! 🎉",
        targetPlans: "all",
        getHtml: (vars) => buildEmail(vars, {
            preheader: "A quick recap and what's next for your Portyo page",
            heroTitle: "You're<br>Doing Great!",
            heroSubtitle: `Keep up the momentum, ${vars.fullName.split(" ")[0]}`,
            body: `
                <p>We just wanted to check in and say — you're building something awesome on Portyo. 🙌</p>

                <h3>✅ What you've accomplished</h3>
                <p>You've set up your Portyo page, customized your theme, and started sharing your content with the world. That's more than most people do!</p>

                <h3>🚀 What's next?</h3>
                <div class="feature-grid">
                    <div class="feature-item">
                        <span class="feature-icon">📝</span>
                        <div class="feature-text">
                            <strong>Start a blog</strong>
                            <span>Blog posts boost SEO and give visitors a reason to come back</span>
                        </div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">📧</span>
                        <div class="feature-text">
                            <strong>Collect emails</strong>
                            <span>Build your audience with email collection blocks</span>
                        </div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">📱</span>
                        <div class="feature-text">
                            <strong>Generate a QR code</strong>
                            <span>Print it on business cards, flyers, or product packaging</span>
                        </div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🔗</span>
                        <div class="feature-text">
                            <strong>Share everywhere</strong>
                            <span>Add your Portyo link to all your social media bios</span>
                        </div>
                    </div>
                </div>

                <div class="tip-card">
                    <strong>🌟 Fun fact:</strong> Creators who log in at least once a week see 5x more page views than those who set it and forget it. Stay active!
                </div>
            `,
            ctaText: "Go to Dashboard",
            ctaUrl: `${APP_URL}/dashboard`,
        }),
    },
];
