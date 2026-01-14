import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
    {path:'/',file:"routes/home.tsx", id: "home"},
    {path:'/login',file:"routes/login.tsx"},
    {path:'/sign-up',file:"routes/sign-up.tsx"},
    {path:'/verify-email',file:"routes/verify-email.tsx"},
    {path:'/robots.txt',file:"routes/robots.ts", id: "robots-txt"},
    {path:'/robot.txt',file:"routes/robots.ts", id: "robot-txt"},
    {path:'/sitemap.xml',file:"routes/sitemap.ts", id: "sitemap-xml"},
    {path:'/sitemap',file:"routes/sitemap.ts", id: "sitemap"},
    // Per-bio robots & sitemap
    {path:'/p/:username/robots.txt',file:"routes/robots.ts", id: "bio-robots"},
    {path:'/p/:username/sitemap.xml',file:"routes/sitemap.ts", id: "bio-sitemap"},
    {
        path:'/dashboard',
        file:"routes/dashboard.tsx",
        children: [
            { index: true, file: "routes/dashboard-home.tsx" },
            { path: "editor", file: "routes/dashboard-editor.tsx" },
            { path: "seo", file: "routes/dashboard-seo.tsx" },
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
            { path: "products", file: "routes/dashboard-products.tsx" },
            { path: "blog", file: "routes/dashboard-blog.tsx" },
            { path: "site-blog", file: "routes/dashboard.site-blog.tsx" },
            { path: "qrcode", file: "routes/dashboard-qrcode.tsx" },
            { path: "scheduler", file: "routes/dashboard-scheduler.tsx" },
            { path: "templates", file: "routes/dashboard-templates.tsx" },
            { path: "templates/:id", file: "routes/dashboard-templates.editor.tsx" },
        ]
    },
    { path: "redirect-qrcode/:id", file: "routes/redirect-qrcode.$id.tsx" },
    { path: "bookings/manage", file: "routes/booking-manage.tsx" },
    { path: "blog", file: "routes/home.tsx", id: "home-blog" },
    { path: "blog/:postId", file: "routes/blog.$postId.tsx" },
    { path: "site-blog/:id", file: "routes/site-blog.$id.tsx" },
    { path: "shop", file: "routes/home.tsx", id: "home-shop" },
    { path: "p/:username", file: "routes/p.$username.tsx" },
    { path: "*", file: "routes/catchall.tsx" }
] satisfies RouteConfig;
