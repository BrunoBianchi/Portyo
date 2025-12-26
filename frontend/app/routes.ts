import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
    {path:'/',file:"routes/home.tsx"},
    {path:'/login',file:"routes/login.tsx"},
    {path:'/signup',file:"routes/signup.tsx"},
    {path:'/verify-email',file:"routes/verify-email.tsx"},
    {
        path:'/dashboard',
        file:"routes/dashboard.tsx",
        children: [
            { index: true, file: "routes/dashboard-home.tsx" },
            { path: "editor", file: "routes/dashboard-editor.tsx" },
            { path: "seo", file: "routes/dashboard-seo.tsx" },
            { path: "analytics", file: "routes/dashboard-analytics.tsx" },
            { path: "leads", file: "routes/dashboard-leads.tsx" },
            { path: "automation", file: "routes/dashboard-automation.tsx" },
            { path: "integrations", file: "routes/dashboard-integrations.tsx" },
            { path: "billing", file: "routes/dashboard-billing.tsx" },
            { path: "settings", file: "routes/dashboard-settings.tsx" },
            { path: "products", file: "routes/dashboard-products.tsx" },
            { path: "blog", file: "routes/dashboard-blog.tsx" },
        ]
    }
] satisfies RouteConfig;
