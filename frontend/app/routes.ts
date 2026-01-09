import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
    {path:'/',file:"routes/home.tsx", id: "home"},
    {path:'/login',file:"routes/login.tsx"},
    {path:'/signup',file:"routes/signup.tsx"},
    {path:'/verify-email',file:"routes/verify-email.tsx"},
    {path:'/robots.txt',file:"routes/robots.ts", id: "robots-txt"},
    {path:'/robot.txt',file:"routes/robots.ts", id: "robot-txt"},
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
            { path: "automation/:id", file: "routes/dashboard-automation.$id.tsx" },
            { path: "integrations", file: "routes/dashboard-integrations.tsx" },
            { path: "settings", file: "routes/dashboard-settings.tsx" },
            { path: "products", file: "routes/dashboard-products.tsx" },
            { path: "blog", file: "routes/dashboard-blog.tsx" },
            { path: "qrcode", file: "routes/dashboard-qrcode.tsx" },
            { path: "scheduler", file: "routes/dashboard-scheduler.tsx" },
            { path: "templates", file: "routes/dashboard-templates.tsx" },
            { path: "templates/:id", file: "routes/dashboard-templates.editor.tsx" },
        ]
    },
    { path: "bookings/manage", file: "routes/booking-manage.tsx" },
    { path: "blog", file: "routes/home.tsx", id: "home-blog" },
    { path: "blog/post/:postId", file: "routes/blog-post.tsx" },
    { path: "shop", file: "routes/home.tsx", id: "home-shop" },
    { path: "*", file: "routes/catchall.tsx" }
] satisfies RouteConfig;
