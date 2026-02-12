import { type RouteConfig, type RouteConfigEntry } from "@react-router/dev/routes";

const baseRoutes: RouteConfig = [
    { path: '/', file: "routes/home.tsx", id: "home" },
    { path: '/home', file: "routes/home.tsx", id: "home-alias" }, // Added to fix 404 on /en/home
    { path: '/login', file: "routes/login.tsx" },
    { path: '/sign-up', file: "routes/sign-up.tsx" },
    { path: '/claim-bio', file: "routes/claim-bio.tsx" },
    { path: '/verify-email', file: "routes/verify-email.tsx" },
    { path: '/forgot-password', file: "routes/forgot-password.tsx" },
    { path: '/reset-password', file: "routes/reset-password.tsx" },
    { path: '/onboarding', file: "routes/onboarding.tsx" },
    { path: '/about', file: "routes/about.tsx" },
    { path: '/legal', file: "routes/legal.tsx" },
    { path: '/contact', file: "routes/contact.tsx" },
    { path: '/privacy-policy', file: "routes/privacy-policy.tsx" },
    { path: '/terms-of-service', file: "routes/terms-of-service.tsx" },
    { path: '/pricing', file: "routes/pricing.tsx" },
    { path: '/themes', file: "routes/dashboard-themes.tsx" },
    {
        path: '/dashboard',
        file: "routes/dashboard.tsx",
        children: [
            { index: true, file: "routes/dashboard-home.tsx" },
            { path: "editor", file: "routes/dashboard-editor.tsx" },
            { path: "design", file: "routes/dashboard-design.tsx" },
            { path: "analytics", file: "routes/dashboard-analytics.tsx" },
            { path: "leads", file: "routes/dashboard-leads.tsx" },
            { path: "automation", file: "routes/dashboard-automation._index.tsx" },
            { path: "forms", file: "routes/dashboard-forms.tsx" },
            { path: "forms/:id", file: "routes/dashboard-forms.editor.tsx" },
            { path: "forms/:id/answers", file: "routes/dashboard-forms-answers.tsx" },
            { path: "automation/:id", file: "routes/dashboard-automation.$id.tsx" },
            { path: "integrations", file: "routes/dashboard-integrations.tsx" },
            { path: "settings", file: "routes/dashboard-settings.tsx" },
            { path: "domains", file: "routes/dashboard-domains.tsx" },
            { path: "custom-domains", file: "routes/dashboard-custom-domains.tsx" },
            { path: "products", file: "routes/dashboard-products.tsx" },
            { path: "earnings", file: "routes/dashboard-earnings.tsx" },
            { path: "marketing", file: "routes/dashboard-marketing.tsx" },
            { path: "blog", file: "routes/dashboard-blog.tsx" },
            { path: "site-blog", file: "routes/dashboard.site-blog.tsx" },
            { path: "site-blog/auto-post", file: "routes/dashboard.site-blog.auto-post.tsx" },
            { path: "auto-post", file: "routes/dashboard-auto-post.tsx" },
            { path: "sponsored", file: "routes/dashboard-sponsored.tsx" },
            { path: "qrcode", file: "routes/dashboard-qrcode.tsx" },
            { path: "scheduler", file: "routes/dashboard-scheduler.tsx" },
            { path: "social-planner", file: "routes/dashboard-social-planner.tsx" },
            { path: "templates", file: "routes/dashboard-templates.tsx" },
            { path: "templates/:id", file: "routes/dashboard-templates.editor.tsx" },
            { path: "admin", file: "routes/dashboard.admin.tsx" },
            { path: "announcements", file: "routes/dashboard.announcements.tsx" },
            { path: "portfolio", file: "routes/dashboard-portfolio.tsx" },
            // Company Dashboard Routes (merged for subdomain support)
            { path: "create", file: "routes/company-dashboard-create-offer.tsx", id: "company-create-offer-merged" },
            { path: "profile", file: "routes/company-dashboard-profile.tsx", id: "company-profile-merged" },
        ]
    },
    // Company routes (under /:lang/company/...)
    {
        path: '/company',
        file: "routes/company-layout.tsx",
        children: [
            { index: true, file: "routes/company-login.tsx", id: "company-index" },
            { path: "login", file: "routes/company-login.tsx", id: "company-login" },
            { path: "register", file: "routes/company-register.tsx", id: "company-register" },
            { path: "dashboard", file: "routes/company-dashboard.tsx", id: "company-dashboard" },
            { path: "dashboard/create", file: "routes/company-dashboard-create-offer.tsx", id: "company-create-offer" },
            { path: "dashboard/profile", file: "routes/company-dashboard-profile.tsx", id: "company-profile" },
        ]
    },
    { path: "redirect-qrcode/:id", file: "routes/redirect-qrcode.$id.tsx" },
    { path: "bookings/manage", file: "routes/booking-manage.tsx" },
    { path: "blog", file: "routes/blog.tsx" },
    { path: "blog/:id", file: "routes/site-blog.$id.tsx" },
    { path: "blog/post/:postId", file: "routes/blog.$postId.tsx" },
    { path: "shop", file: "routes/home.tsx", id: "home-shop" },
    { path: "payment-success", file: "routes/payment-success.tsx" },
    { path: "p/:username/:tab?", file: "routes/p.$username.tsx" },
    { path: "*", file: "routes/catchall.tsx" }
] satisfies RouteConfig;

const stripLeadingSlash = (path: string) => (path.startsWith("/") ? path.slice(1) : path);

const toLocalizedRoutes = (routes: RouteConfigEntry[], parentKey = ""): RouteConfigEntry[] =>
    routes.map((route) => {
        const mapped: any = { ...route };

        const originalPath = route.path ?? (route.index ? "index" : "");
        const normalizedPath = originalPath === "/" ? "index" : stripLeadingSlash(originalPath || "index");
        const fileKey = route.file ?? route.id ?? "route";
        const localKey = [parentKey, fileKey, normalizedPath].filter(Boolean).join(":");
        mapped.id = `lang:${localKey}`;

        if (route.path === "/") {
            delete mapped.path;
            mapped.index = true;
        } else if (route.path) {
            mapped.path = stripLeadingSlash(route.path);
        }

        if (route.children) {
            mapped.children = toLocalizedRoutes(route.children, localKey);
        }

        return mapped;
    });

const nonLocalizedRoutes: RouteConfig = [
    { path: '/robots.txt', file: "routes/robots.ts", id: "robots-txt" },
    { path: '/robot.txt', file: "routes/robots.ts", id: "robot-txt" },
    { path: '/sitemap.xml', file: "routes/sitemap.ts", id: "sitemap-xml" },
    { path: '/sitemap', file: "routes/sitemap.ts", id: "sitemap" },
    { path: '/p/:username/robots.txt', file: "routes/robots.ts", id: "bio-robots" },
    { path: '/p/:username/sitemap.xml', file: "routes/sitemap.ts", id: "bio-sitemap" },
    { path: '/claim-bio', file: "routes/claim-bio.tsx", id: "claim-bio-direct" },
];

export default [
    { path: "/:lang", file: "routes/lang.tsx", children: toLocalizedRoutes(baseRoutes) },
    ...nonLocalizedRoutes,
    { path: "*", file: "routes/redirect-lang.tsx" }
] satisfies RouteConfig;
